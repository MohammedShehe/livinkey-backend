const db = require("../config/db");

const MAX_RESULTS = 8;

const money = (value) => {
    const amount = Number(value || 0);
    return `₹${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 0
    })}`;
};

const cleanQuestion = (question) =>
    question.toLowerCase().replace(/[^\p{L}\p{N}\s₹.-]/gu, " ").replace(/\s+/g, " ").trim();

const normalizeAmenity = (value) =>
    String(value || "").trim().replace(/\s+/g, " ");

// Normalize punctuation/symbols so database amenities such as "24×7 Power Backup"
// match user questions such as "24*7 Power Backup", "24x7 Power Backup",
// "24 7 Power Backup", or "24-7 Power Backup".
const canonicalText = (value) =>
    String(value || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .replace(/\b(\d+)\s*x\s*(\d+)\b/gi, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();

const phraseMatches = (text, phrase) => {
    const haystack = ` ${canonicalText(text)} `;
    const needle = ` ${canonicalText(phrase)} `;
    return needle.trim().length > 0 && haystack.includes(needle);
};

const unique = (items) => [...new Set(items.filter(Boolean))];

const formatPg = (pg, includeAmenity = false) => {
    const available = Math.max(0, Number(pg.available_spots || 0));
    const parts = [
        `• ${pg.name}`,
        `Rent: ${money(pg.rent)}`,
        `Location: ${pg.location}`,
        `Vacant rooms: ${available}`
    ];

    if (includeAmenity && pg.amenities) {
        parts.push(`Amenities: ${pg.amenities}`);
    }

    return parts.join(" | ");
};

async function getPgRows({ search = null, amenity = null, location = null, order = "rent_asc" } = {}) {
    const connection = await db.getConnection();

    try {
        const orderBy = {
            rent_asc: "p.rent ASC, p.name ASC",
            rent_desc: "p.rent DESC, p.name ASC",
            available: "empty_rooms DESC, p.rent ASC, p.name ASC",
            name: "p.name ASC"
        }[order] || "p.rent ASC, p.name ASC";

        let query = `
            SELECT
                p.id,
                p.name,
                p.location,
                p.rent,
                p.security_fee,
                COALESCE(SUM(r.capacity), 0) AS total_capacity,
                COALESCE(SUM(COALESCE(ro.occupied_count, 0)), 0) AS total_occupied,
                COUNT(DISTINCT CASE
                    WHEN COALESCE(ro.occupied_count, 0) = 0 THEN r.id
                END) AS empty_rooms,
                COUNT(DISTINCT CASE
                    WHEN COALESCE(ro.occupied_count, 0) = 0 THEN r.id
                END) AS available_spots,
                COALESCE((
                    SELECT GROUP_CONCAT(DISTINCT pa.amenity_name ORDER BY pa.amenity_name SEPARATOR ', ')
                    FROM pg_amenities pa
                    WHERE pa.pg_id = p.id
                ), '') AS amenities
            FROM pgs p
            LEFT JOIN floors f ON f.pg_id = p.id AND f.is_active = 1
            LEFT JOIN rooms r ON r.floor_id = f.id AND r.is_active = 1 AND r.deleted_at IS NULL
            LEFT JOIN room_occupancy ro ON ro.room_id = r.id
            WHERE p.is_active = 1
        `;

        const params = [];

        if (search) {
            query += ` AND (p.name LIKE ? OR p.location LIKE ?)`;
            const pattern = `%${search}%`;
            params.push(pattern, pattern);
        }

        if (location) {
            query += ` AND p.location LIKE ?`;
            params.push(`%${location}%`);
        }

        if (amenity) {
            query += `
                AND EXISTS (
                    SELECT 1
                    FROM pg_amenities pa_filter
                    WHERE pa_filter.pg_id = p.id
                      AND pa_filter.amenity_name LIKE ?
                )
            `;
            params.push(`%${amenity}%`);
        }

        query += `
            GROUP BY p.id, p.name, p.location, p.rent, p.security_fee
            ORDER BY ${orderBy}
            LIMIT ${MAX_RESULTS}
        `;

        const [rows] = await connection.execute(query, params);
        return rows;
    } finally {
        connection.release();
    }
}

async function getVacantRooms({ location = null, pgId = null } = {}) {
    const connection = await db.getConnection();

    try {
        let query = `
            SELECT
                p.id AS pg_id,
                p.name AS pg_name,
                p.location,
                p.rent AS pg_rent,
                f.floor_number,
                r.id AS room_id,
                r.room_number,
                r.capacity,
                r.rent AS room_rent,
                COALESCE(ro.occupied_count, 0) AS occupied_count
            FROM pgs p
            INNER JOIN floors f
                ON f.pg_id = p.id
               AND f.is_active = 1
            INNER JOIN rooms r
                ON r.floor_id = f.id
               AND r.is_active = 1
               AND r.deleted_at IS NULL
            LEFT JOIN room_occupancy ro
                ON ro.room_id = r.id
            WHERE p.is_active = 1
              AND COALESCE(ro.occupied_count, 0) = 0
              AND COALESCE(r.capacity, 0) > 0
        `;

        const params = [];

        if (location) {
            query += ` AND p.location LIKE ?`;
            params.push(`%${location}%`);
        }

        if (pgId) {
            query += ` AND p.id = ?`;
            params.push(pgId);
        }

        query += ` ORDER BY p.name ASC, f.floor_number ASC, r.room_number ASC LIMIT 100`;

        const [rows] = await connection.execute(query, params);
        return rows;
    } finally {
        connection.release();
    }
}

async function getStats() {
    const connection = await db.getConnection();

    try {
        const [rows] = await connection.execute(`
            SELECT
                COUNT(DISTINCT p.id) AS total_pgs,
                COUNT(DISTINCT CASE
                    WHEN COALESCE(capacity.empty_rooms, 0) > 0
                    THEN p.id
                END) AS pgs_with_availability,
                COALESCE(SUM(COALESCE(capacity.total_empty_rooms, 0)), 0) AS total_empty_rooms,
                COALESCE(SUM(COALESCE(capacity.total_capacity, 0)), 0) AS total_capacity,
                COALESCE(SUM(COALESCE(capacity.total_occupied, 0)), 0) AS total_occupied,
                MIN(p.rent) AS min_rent,
                MAX(p.rent) AS max_rent
            FROM pgs p
            LEFT JOIN (
                SELECT
                    f.pg_id,
                    SUM(r.capacity) AS total_capacity,
                    SUM(COALESCE(ro.occupied_count, 0)) AS total_occupied,
                    COUNT(DISTINCT CASE
                        WHEN COALESCE(ro.occupied_count, 0) = 0 THEN r.id
                    END) AS empty_rooms,
                    COUNT(DISTINCT CASE
                        WHEN COALESCE(ro.occupied_count, 0) = 0 THEN r.id
                    END) AS total_empty_rooms
                FROM floors f
                JOIN rooms r
                  ON r.floor_id = f.id
                 AND r.is_active = 1
                 AND r.deleted_at IS NULL
                LEFT JOIN room_occupancy ro ON ro.room_id = r.id
                WHERE f.is_active = 1
                GROUP BY f.pg_id
            ) capacity ON capacity.pg_id = p.id
            WHERE p.is_active = 1
        `);

        return rows[0] || {};
    } finally {
        connection.release();
    }
}

async function getAmenitySummary() {
    const connection = await db.getConnection();

    try {
        const [rows] = await connection.execute(`
            SELECT
                pa.amenity_name,
                COUNT(DISTINCT pa.pg_id) AS pg_count
            FROM pg_amenities pa
            INNER JOIN pgs p ON p.id = pa.pg_id AND p.is_active = 1
            WHERE TRIM(pa.amenity_name) <> ''
            GROUP BY pa.amenity_name
            ORDER BY pg_count DESC, pa.amenity_name ASC
            LIMIT 20
        `);

        return rows;
    } finally {
        connection.release();
    }
}

async function getLocationSummary() {
    const connection = await db.getConnection();

    try {
        const [rows] = await connection.execute(`
            SELECT
                p.location,
                COUNT(*) AS pg_count,
                MIN(p.rent) AS min_rent,
                MAX(p.rent) AS max_rent
            FROM pgs p
            WHERE p.is_active = 1
            GROUP BY p.location
            ORDER BY pg_count DESC, p.location ASC
        `);

        return rows;
    } finally {
        connection.release();
    }
}

async function findNamedPg(question) {
    const connection = await db.getConnection();

    try {
        const [rows] = await connection.execute(`
            SELECT id, name, location, rent, security_fee
            FROM pgs
            WHERE is_active = 1
              AND name LIKE ?
            ORDER BY CHAR_LENGTH(name) ASC
            LIMIT 1
        `, [`%${question}%`]);

        return rows[0] || null;
    } finally {
        connection.release();
    }
}

async function getPgDetails(pgId) {
    const connection = await db.getConnection();

    try {
        const [result] = await connection.execute(`
            SELECT
                p.id,
                p.name,
                p.location,
                p.rent,
                p.security_fee,
                COALESCE(SUM(r.capacity), 0) AS total_capacity,
                COALESCE(SUM(COALESCE(ro.occupied_count, 0)), 0) AS total_occupied,
                COUNT(DISTINCT CASE
                    WHEN COALESCE(ro.occupied_count, 0) = 0 THEN r.id
                END) AS empty_rooms,
                COUNT(DISTINCT CASE
                    WHEN COALESCE(ro.occupied_count, 0) = 0 THEN r.id
                END) AS available_spots,
                COALESCE((
                    SELECT GROUP_CONCAT(DISTINCT pa.amenity_name ORDER BY pa.amenity_name SEPARATOR ', ')
                    FROM pg_amenities pa
                    WHERE pa.pg_id = p.id
                ), '') AS amenities
            FROM pgs p
            LEFT JOIN floors f ON f.pg_id = p.id AND f.is_active = 1
            LEFT JOIN rooms r ON r.floor_id = f.id AND r.is_active = 1 AND r.deleted_at IS NULL
            LEFT JOIN room_occupancy ro ON ro.room_id = r.id
            WHERE p.id = ? AND p.is_active = 1
            GROUP BY p.id, p.name, p.location, p.rent, p.security_fee
            LIMIT 1
        `, [pgId]);

        return result[0] || null;
    } finally {
        connection.release();
    }
}

async function getQuickQuestions() {
    const [stats, amenities, locations] = await Promise.all([
        getStats(),
        getAmenitySummary(),
        getLocationSummary()
    ]);

    const questions = [];

    if (Number(stats.total_pgs || 0) > 0) {
        questions.push({
            label: "🏠 Available PGs",
            question: "Which PGs currently have available spots?"
        });
        questions.push({
            label: "🚪 Vacant rooms",
            question: "Which rooms are completely vacant right now?"
        });
        questions.push({
            label: "💰 Rent prices",
            question: "What are the current rent prices?"
        });
    }

    const amenityNames = amenities
        .slice(0, 3)
        .map(row => normalizeAmenity(row.amenity_name));

    for (const amenity of amenityNames) {
        questions.push({
            label: `✨ ${amenity}`,
            question: `Which PGs have ${amenity}?`
        });
    }

    if (locations.length > 0) {
        questions.push({
            label: "📍 Locations",
            question: "Which locations have PGs and what are their rents?"
        });
    }

    questions.push({
        label: "🛏️ Cheapest PGs",
        question: "Which PGs have the lowest rent?"
    });

    questions.push({
        label: "📊 PG summary",
        question: "How many active PGs are there and how many have availability?"
    });

    return {
        questions: questions.slice(0, 8),
        generated_from_database: true,
        stats: {
            total_pgs: Number(stats.total_pgs || 0),
            pgs_with_availability: Number(stats.pgs_with_availability || 0),
            min_rent: Number(stats.min_rent || 0),
            max_rent: Number(stats.max_rent || 0)
        }
    };
}

async function answerQuestion(question) {
    const raw = question.trim();
    const msg = cleanQuestion(raw);

    if (!msg) {
        return {
            answer: "Please enter a question about our PGs.",
            source: "database"
        };
    }

    const stats = await getStats();

    // Specific PG lookup: only use the name when it matches a current active PG.
    const allPgs = await getPgRows({ order: "name" });
    const named = allPgs.find(pg => {
        const name = String(pg.name || "").toLowerCase();
        return name && msg.includes(name.toLowerCase());
    });

    if (named) {
        const details = await getPgDetails(named.id);
        return {
            answer: [
                `${details.name} is currently listed in the database.`,
                `Rent: ${money(details.rent)}`,
                `Location: ${details.location}`,
                `Completely vacant rooms: ${Number(details.available_spots || 0)}`,
                details.amenities ? `Amenities: ${details.amenities}` : "No amenities are currently listed."
            ].join("\n"),
            source: "database",
            view: "pg_detail",
            data: details
        };
    }

    // Match both "vacant rooms" and "rooms ... vacant" (e.g. "Which rooms are completely vacant right now?")
    const asksVacantRooms = /\b(vacant|empty|unoccupied|free)\s+(room|rooms)\b/.test(msg)
        || /\b(room|rooms)\b.{0,40}\b(vacant|empty|unoccupied|free)\b/.test(msg)
        || /\b(vacancy|vacant rooms|empty rooms)\b/.test(msg);
    const asksAvailability = /\b(available|availability|vacan|vacancy|free spot|empty|open room)\b/.test(msg);
    const asksRent = /\b(rent|price|prices|cost|cheapest|expensive|monthly)\b/.test(msg);
    const asksAmenities = /\b(amenit|facilit|feature|features)\b/.test(msg);
    const asksLocation = /\b(location|locations|where|area|areas|lawgate|law gate|phagwara|green valley)\b/.test(msg);
    const asksSummary = /\b(how many|count|total|summary|overview)\b/.test(msg);
    const asksSecurity = /\b(security fee|deposit|security deposit)\b/.test(msg);
    const asksFood = /\b(food|meal|mess|breakfast|lunch|dinner)\b/.test(msg);

    // Match an actual database amenity before generic fallbacks.
    // This makes 24×7 / 24*7 / 24x7 / 24-7 / 24 7 equivalent.
    const amenities = await getAmenitySummary();
    const amenityMatch = amenities
        .slice()
        .sort((a, b) => canonicalText(b.amenity_name).length - canonicalText(a.amenity_name).length)
        .find(a => phraseMatches(msg, a.amenity_name));

    if (asksFood) {
        const foodAmenities = (await getAmenitySummary())
            .filter(row => /\b(food|meal|mess|breakfast|lunch|dinner)\b/i.test(row.amenity_name));

        if (foodAmenities.length === 0) {
            return {
                answer: "I checked the current PG amenities in the database, but no food, meal, or mess facility is listed. I don't want to guess beyond the stored data.",
                source: "database"
            };
        }

        return {
            answer: `The database lists these food-related facilities: ${foodAmenities.map(a => `${a.amenity_name} (${a.pg_count} PGs)`).join(", ")}.`,
            source: "database"
        };
    }

    if (asksVacantRooms) {
        const rows = await getVacantRooms();

        if (rows.length === 0) {
            return {
                answer: "There are currently no completely vacant rooms in the active PG database.",
                source: "database",
                view: "vacant_rooms",
                data: []
            };
        }

        return {
            answer: [
                `I found ${rows.length} completely vacant room(s) in the current database:`,
                ...rows.map(room =>
                    `• ${room.pg_name} — Room ${room.room_number} | Floor ${room.floor_number} | Capacity: ${room.capacity} | Room rent: ${money(room.room_rent || room.pg_rent)} | ${room.location}`
                )
             ].join("\n"),
            source: "database",
            view: "vacant_rooms",
            data: rows
        };
    }

    if (asksAvailability) {
        const rows = await getPgRows({ order: "available" });
        const available = rows.filter(pg => Number(pg.empty_rooms || pg.available_spots || 0) > 0);

        if (available.length === 0) {
            return {
                answer: "There are currently no active PGs with available spots in the database.",
                source: "database"
            };
        }

        return {
            answer: [
                `I found ${available.length} active PG(s) with at least one completely vacant room in the current database:`,
                ...available.map(pg => formatPg(pg))
            ].join("\n"),
            source: "database",
            view: "pg_list",
            data: available
        };
    }

    if (asksRent) {
        const rows = await getPgRows({
            order: /\b(cheapest|lowest)\b/.test(msg) ? "rent_asc" : "rent_asc"
        });

        const min = Number(stats.min_rent || 0);
        const max = Number(stats.max_rent || 0);

        return {
            answer: [
                `Current monthly PG rents in the database range from ${money(min)} to ${money(max)}.`,
                ...rows.map(pg => formatPg(pg))
            ].join("\n"),
            source: "database",
            view: "pg_list",
            data: rows
        };
    }

    if (amenityMatch && !asksVacantRooms && !asksRent && !asksLocation && !asksSecurity && !asksSummary && !asksFood) {
        const rows = await getPgRows({
            amenity: amenityMatch.amenity_name,
            order: "rent_asc"
        });

        return {
            answer: [
                `${amenityMatch.amenity_name} is listed for ${amenityMatch.pg_count} active PG(s):`,
                ...rows.map(pg => formatPg(pg, true))
            ].join("\n"),
            source: "database",
            view: "pg_list",
            data: rows
        };
    }

    if (asksAmenities) {
        if (amenities.length === 0) {
            return {
                answer: "No PG amenities are currently listed in the database.",
                source: "database"
            };
        }

        const requested = raw.replace(/\b(which|what|pgs?|have|has|with|amenities|facilities|features|available|do|you|offer|are|there)\b/gi, " ").trim();

        if (requested.length >= 2) {
            const matched = amenities.filter(a =>
                a.amenity_name.toLowerCase().includes(requested.toLowerCase())
            );

            if (matched.length > 0) {
                const rows = await getPgRows({ amenity: requested, order: "rent_asc" });
                return {
                    answer: [
                        `${matched[0].amenity_name} is listed for ${matched[0].pg_count} active PG(s):`,
                        ...rows.map(pg => formatPg(pg))
                    ].join("\n"),
                    source: "database",
                    view: "pg_list",
                    data: rows
                };
            }
        }

        return {
            answer: [
                "Amenities currently stored in the database:",
                ...amenities.map(a => `• ${a.amenity_name} — ${a.pg_count} PG(s)`)
            ].join("\n"),
            source: "database",
            data: amenities
        };
    }

    if (asksLocation) {
        const locations = await getLocationSummary();

        if (locations.length === 0) {
            return {
                answer: "No active PG locations are currently listed in the database.",
                source: "database"
            };
        }

        return {
            answer: [
                "Current PG locations and rent ranges:",
                ...locations.map(row =>
                    `• ${row.location}: ${row.pg_count} PG(s), ${money(row.min_rent)}–${money(row.max_rent)}`
                )
            ].join("\n"),
            source: "database",
            data: locations
        };
    }

    if (asksSecurity) {
        const rows = await getPgRows({ order: "rent_asc" });

        return {
            answer: [
                "Current security fees stored for active PGs:",
                ...rows.map(pg => `• ${pg.name}: ${money(pg.security_fee)}`)
            ].join("\n"),
            source: "database",
            data: rows
        };
    }

    if (asksSummary) {
        const total = Number(stats.total_pgs || 0);
        const withAvailability = Number(stats.pgs_with_availability || 0);
        const capacity = Number(stats.total_capacity || 0);
        const occupied = Number(stats.total_occupied || 0);
        const emptyRooms = Number(stats.total_empty_rooms || 0);

        return {
            answer: [
                `Active PGs: ${total}`,
                `PGs with at least one completely vacant room: ${withAvailability}`,
                `Completely vacant rooms: ${emptyRooms}`,
                `Total capacity: ${capacity}`,
                `Currently occupied: ${occupied}`,
                `Current rent range: ${money(stats.min_rent)}–${money(stats.max_rent)}`
            ].join("\n"),
            source: "database"
        };
    }

    return {
        answer: [
            "I can answer using the current PG database.",
            "Try asking about:",
            "• available PGs",
            "• rent prices",
            "• amenities such as AC or WiFi",
            "• locations",
            "• security fees",
            "• PG availability/count"
        ].join("\n"),
        source: "database"
    };
}

module.exports = {
    getQuickQuestions,
    answerQuestion
};
