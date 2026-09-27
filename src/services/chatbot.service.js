const db = require("../config/db");

// Public chatbot limits are intentionally generous enough to search the full
// active catalogue while keeping individual responses readable.
const DISPLAY_LIMIT = 12;
const SEARCH_LIMIT = 100;

const money = (value) => {
    const amount = Number(value || 0);
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const cleanQuestion = (question) =>
    String(question || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s₹,.-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

const normalizeText = (value) =>
    String(value || "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

const normalizeAmenity = (value) => String(value || "").trim().replace(/\s+/g, " ");

const unique = (items) => [...new Set(items.filter(Boolean))];

const formatPg = (pg, includeAmenity = false) => {
    const available = Math.max(0, Number(pg.available_spots || 0));
    const parts = [
        `• ${pg.name}`,
        `Rent: ${money(pg.rent)}`,
        `Location: ${pg.location}`,
        `Available spots: ${available}`
    ];

    if (includeAmenity && pg.amenities) {
        parts.push(`Amenities: ${pg.amenities}`);
    }

    return parts.join(" | ");
};

const formatPgList = (rows, includeAmenity = false) =>
    rows.slice(0, DISPLAY_LIMIT).map((pg) => formatPg(pg, includeAmenity));

async function getPgRows({
    search = null,
    amenity = null,
    location = null,
    minRent = null,
    maxRent = null,
    availableOnly = false,
    order = "rent_asc",
    limit = SEARCH_LIMIT
} = {}) {
    const connection = await db.getConnection();

    try {
        const orderBy = {
            rent_asc: "p.rent ASC, p.name ASC",
            rent_desc: "p.rent DESC, p.name ASC",
            available: "available_spots DESC, p.rent ASC, p.name ASC",
            name: "p.name ASC"
        }[order] || "p.rent ASC, p.name ASC";

        const safeLimit = Math.max(1, Math.min(Number(limit) || SEARCH_LIMIT, SEARCH_LIMIT));

        let query = `
            SELECT
                p.id,
                p.name,
                p.location,
                p.rent,
                p.security_fee,
                COALESCE(COUNT(DISTINCT r.id), 0) AS total_rooms,
                COALESCE(SUM(r.capacity), 0) AS total_capacity,
                COALESCE(SUM(COALESCE(ro.occupied_count, 0)), 0) AS total_occupied,
                GREATEST(
                    COALESCE(SUM(r.capacity), 0) -
                    COALESCE(SUM(COALESCE(ro.occupied_count, 0)), 0),
                    0
                ) AS available_spots,
                COALESCE((
                    SELECT GROUP_CONCAT(
                        DISTINCT pa.amenity_name
                        ORDER BY pa.amenity_name
                        SEPARATOR ', '
                    )
                    FROM pg_amenities pa
                    WHERE pa.pg_id = p.id
                ), '') AS amenities
            FROM pgs p
            LEFT JOIN floors f
              ON f.pg_id = p.id
             AND f.is_active = 1
             AND f.deleted_at IS NULL
            LEFT JOIN rooms r
              ON r.floor_id = f.id
             AND r.is_active = 1
             AND r.deleted_at IS NULL
            LEFT JOIN room_occupancy ro
              ON ro.room_id = r.id
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
                      AND LOWER(pa_filter.amenity_name) LIKE LOWER(?)
                )
            `;
            params.push(`%${amenity}%`);
        }

        if (minRent !== null && minRent !== undefined) {
            query += ` AND p.rent >= ?`;
            params.push(Number(minRent));
        }

        if (maxRent !== null && maxRent !== undefined) {
            query += ` AND p.rent <= ?`;
            params.push(Number(maxRent));
        }

        query += `
            GROUP BY p.id, p.name, p.location, p.rent, p.security_fee
        `;

        if (availableOnly) {
            query += `
                HAVING GREATEST(
                    COALESCE(SUM(r.capacity), 0) -
                    COALESCE(SUM(COALESCE(ro.occupied_count, 0)), 0),
                    0
                ) > 0
            `;
        }

        query += ` ORDER BY ${orderBy} LIMIT ${safeLimit}`;

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
                    WHEN COALESCE(capacity.total_capacity, 0) -
                         COALESCE(capacity.total_occupied, 0) > 0
                    THEN p.id
                END) AS pgs_with_availability,
                COALESCE(SUM(COALESCE(capacity.total_capacity, 0)), 0) AS total_capacity,
                COALESCE(SUM(COALESCE(capacity.total_occupied, 0)), 0) AS total_occupied,
                MIN(p.rent) AS min_rent,
                MAX(p.rent) AS max_rent
            FROM pgs p
            LEFT JOIN (
                SELECT
                    f.pg_id,
                    SUM(r.capacity) AS total_capacity,
                    SUM(COALESCE(ro.occupied_count, 0)) AS total_occupied
                FROM floors f
                JOIN rooms r
                  ON r.floor_id = f.id
                 AND r.is_active = 1
                 AND r.deleted_at IS NULL
                LEFT JOIN room_occupancy ro ON ro.room_id = r.id
                WHERE f.is_active = 1
                  AND f.deleted_at IS NULL
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
                TRIM(pa.amenity_name) AS amenity_name,
                COUNT(DISTINCT pa.pg_id) AS pg_count
            FROM pg_amenities pa
            INNER JOIN pgs p
                ON p.id = pa.pg_id
               AND p.is_active = 1
            WHERE TRIM(pa.amenity_name) <> ''
            GROUP BY TRIM(pa.amenity_name)
            ORDER BY pg_count DESC, amenity_name ASC
            LIMIT 100
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
                TRIM(p.location) AS location,
                COUNT(*) AS pg_count,
                MIN(p.rent) AS min_rent,
                MAX(p.rent) AS max_rent
            FROM pgs p
            WHERE p.is_active = 1
              AND TRIM(p.location) <> ''
            GROUP BY TRIM(p.location)
            ORDER BY pg_count DESC, location ASC
        `);

        return rows;
    } finally {
        connection.release();
    }
}

async function getActivePgsForMatching() {
    const connection = await db.getConnection();

    try {
        const [rows] = await connection.execute(`
            SELECT id, name, location, rent
            FROM pgs
            WHERE is_active = 1
            ORDER BY CHAR_LENGTH(name) DESC, name ASC
        `);
        return rows;
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
                COALESCE(COUNT(DISTINCT r.id), 0) AS total_rooms,
                COALESCE(SUM(r.capacity), 0) AS total_capacity,
                COALESCE(SUM(COALESCE(ro.occupied_count, 0)), 0) AS total_occupied,
                GREATEST(
                    COALESCE(SUM(r.capacity), 0) -
                    COALESCE(SUM(COALESCE(ro.occupied_count, 0)), 0),
                    0
                ) AS available_spots,
                COALESCE((
                    SELECT GROUP_CONCAT(
                        DISTINCT pa.amenity_name
                        ORDER BY pa.amenity_name
                        SEPARATOR ', '
                    )
                    FROM pg_amenities pa
                    WHERE pa.pg_id = p.id
                ), '') AS amenities
            FROM pgs p
            LEFT JOIN floors f
              ON f.pg_id = p.id
             AND f.is_active = 1
             AND f.deleted_at IS NULL
            LEFT JOIN rooms r
              ON r.floor_id = f.id
             AND r.is_active = 1
             AND r.deleted_at IS NULL
            LEFT JOIN room_occupancy ro
              ON ro.room_id = r.id
            WHERE p.id = ?
              AND p.is_active = 1
            GROUP BY p.id, p.name, p.location, p.rent, p.security_fee
            LIMIT 1
        `, [pgId]);

        return result[0] || null;
    } finally {
        connection.release();
    }
}

function findAmenityMatch(message, amenities) {
    const normalizedMessage = normalizeText(message);

    // Prefer longer names first, so e.g. "Free WiFi" wins over "WiFi".
    const sorted = [...amenities].sort(
        (a, b) => normalizeText(b.amenity_name).length - normalizeText(a.amenity_name).length
    );

    return sorted.find((row) => {
        const amenity = normalizeText(row.amenity_name);
        if (!amenity) return false;
        if (normalizedMessage.includes(amenity)) return true;

        // Handle common singular/plural wording without hardcoding an amenity list.
        if (amenity.endsWith("s") && normalizedMessage.includes(amenity.slice(0, -1))) return true;
        if (!amenity.endsWith("s") && normalizedMessage.includes(`${amenity}s`)) return true;

        return false;
    }) || null;
}

function findLocationMatch(message, locations) {
    const normalizedMessage = normalizeText(message);
    return [...locations]
        .sort((a, b) => normalizeText(b.location).length - normalizeText(a.location).length)
        .find((row) => {
            const location = normalizeText(row.location);
            return location && normalizedMessage.includes(location);
        }) || null;
}

function parseMoneyValue(value) {
    const normalized = String(value || "").toLowerCase().replace(/,/g, "").trim();
    if (!normalized) return null;
    const match = normalized.match(/(\d+(?:\.\d+)?)\s*(k|thousand|lakh|lac)?/i);
    if (!match) return null;

    let amount = Number(match[1]);
    const suffix = (match[2] || "").toLowerCase();
    if (suffix === "k" || suffix === "thousand") amount *= 1000;
    if (suffix === "lakh" || suffix === "lac") amount *= 100000;
    return Number.isFinite(amount) ? amount : null;
}

function parseRentRange(message) {
    const normalized = message.replace(/,/g, "");

    const between = normalized.match(/between\s+(?:₹\s*)?([\d.]+\s*(?:k|thousand|lakh|lac)?)\s+(?:and|to|-)\s+(?:₹\s*)?([\d.]+\s*(?:k|thousand|lakh|lac)?)/i);
    if (between) {
        return {
            minRent: parseMoneyValue(between[1]),
            maxRent: parseMoneyValue(between[2])
        };
    }

    const under = normalized.match(/(?:under|below|less than|upto|up to|max(?:imum)?(?:\s+rent)?(?:\s+of)?)\s*(?:₹\s*)?([\d.]+\s*(?:k|thousand|lakh|lac)?)/i);
    if (under) return { minRent: null, maxRent: parseMoneyValue(under[1]) };

    const over = normalized.match(/(?:above|over|more than|at least|from)\s*(?:₹\s*)?([\d.]+\s*(?:k|thousand|lakh|lac)?)/i);
    if (over) return { minRent: parseMoneyValue(over[1]), maxRent: null };

    return { minRent: null, maxRent: null };
}

function wantsCheapest(message) {
    return /\b(cheapest|lowest|least expensive|minimum rent|low(?:est)? rent)\b/.test(message);
}

function wantsMostExpensive(message) {
    return /\b(most expensive|highest|maximum rent|high(?:est)? rent)\b/.test(message);
}

function formatAvailability(rows, heading) {
    if (!rows.length) {
        return `${heading}\nNo active PG currently matches the requested criteria in the database.`;
    }

    const shown = rows.slice(0, DISPLAY_LIMIT);
    const extra = rows.length > DISPLAY_LIMIT ? `\n…and ${rows.length - DISPLAY_LIMIT} more.` : "";
    return [heading, ...formatPgList(shown), extra].filter(Boolean).join("\n");
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
            label: "💰 Current rents",
            question: "What are the current rent prices?"
        });
    }

    // These buttons are created from actual database amenity names.
    amenities.slice(0, 4).forEach((row) => {
        const amenity = normalizeAmenity(row.amenity_name);
        if (!amenity) return;
        questions.push({
            label: `✨ ${amenity}`,
            question: `Which PGs have ${amenity}?`
        });
    });

    if (locations.length > 0) {
        const location = normalizeAmenity(locations[0].location);
        questions.push({
            label: "📍 PG locations",
            question: `Which PGs are in ${location}?`
        });
    }

    questions.push({
        label: "🛏️ Lowest rent",
        question: "Which PGs have the lowest rent?"
    });

    questions.push({
        label: "📊 Live summary",
        question: "How many active PGs are there and how many have availability?"
    });

    return {
        questions: questions.slice(0, 8),
        generated_from_database: true,
        generated_at: new Date().toISOString(),
        stats: {
            total_pgs: Number(stats.total_pgs || 0),
            pgs_with_availability: Number(stats.pgs_with_availability || 0),
            min_rent: Number(stats.min_rent || 0),
            max_rent: Number(stats.max_rent || 0)
        }
    };
}

async function answerQuestion(question) {
    const raw = String(question || "").trim();
    const msg = cleanQuestion(raw);

    if (!msg) {
        return {
            answer: "Please enter a question about the current PGs.",
            source: "database"
        };
    }

    const [stats, amenities, locations, activePgs] = await Promise.all([
        getStats(),
        getAmenitySummary(),
        getLocationSummary(),
        getActivePgsForMatching()
    ]);

    const amenityMatch = findAmenityMatch(msg, amenities);
    const locationMatch = findLocationMatch(msg, locations);
    const named = activePgs.find((pg) => {
        const name = normalizeText(pg.name);
        return name && msg.includes(name);
    });

    const asksAvailability = /\b(available|availability|vacan|vacancy|free spot|free spots|empty|open room|open rooms|vacant)\b/.test(msg);
    const asksRent = /\b(rent|price|prices|cost|cheapest|expensive|monthly|affordable|budget)\b/.test(msg);
    const asksAmenities = /\b(amenit|facilit|feature|features|what do you offer|what is included|included)\b/.test(msg);
    const asksLocation = /\b(location|locations|where|area|areas|near|lawgate|law gate|phagwara|green valley)\b/.test(msg) || Boolean(locationMatch);
    const asksSummary = /\b(how many|count|total|summary|overview|capacity|occupied|occupancy|beds|spots)\b/.test(msg);
    const asksSecurity = /\b(security fee|deposit|security deposit)\b/.test(msg);
    const asksFood = /\b(food|meal|mess|breakfast|lunch|dinner)\b/.test(msg);
    const asksBooking = /\b(book|booking|reserve|reservation|how to join|how do i join|admission)\b/.test(msg);
    const rentRange = parseRentRange(msg);

    // A question about a named PG can be combined with an amenity question.
    if (named) {
        const details = await getPgDetails(named.id);
        if (!details) {
            return {
                answer: "That PG is not currently active in the database.",
                source: "database"
            };
        }

        if (amenityMatch) {
            const pgAmenities = normalizeText(details.amenities).split(",").map((x) => x.trim()).filter(Boolean);
            const hasAmenity = pgAmenities.some((a) => {
                const target = normalizeText(amenityMatch.amenity_name);
                return a === target || a.includes(target) || target.includes(a);
            });

            return {
                answer: hasAmenity
                    ? `Yes. ${details.name} lists ${amenityMatch.amenity_name} in the database.`
                    : `No. ${details.name} does not currently list ${amenityMatch.amenity_name} in the database.`,
                source: "database",
                data: details
            };
        }

        return {
            answer: [
                `${details.name} is currently listed in the database.`,
                `Rent: ${money(details.rent)}`,
                `Security fee: ${money(details.security_fee)}`,
                `Location: ${details.location}`,
                `Rooms: ${Number(details.total_rooms || 0)}`,
                `Total capacity: ${Number(details.total_capacity || 0)}`,
                `Occupied: ${Number(details.total_occupied || 0)}`,
                `Available spots: ${Number(details.available_spots || 0)}`,
                details.amenities
                    ? `Amenities: ${details.amenities}`
                    : "No amenities are currently listed."
            ].join("\n"),
            source: "database",
            data: details
        };
    }

    // Amenity questions are checked before broad availability/rent intent.
    // This is what makes a message such as "Washing Machine?" work.
    if (amenityMatch) {
        const rows = await getPgRows({
            amenity: amenityMatch.amenity_name,
            location: locationMatch ? locationMatch.location : null,
            minRent: rentRange.minRent,
            maxRent: rentRange.maxRent,
            availableOnly: asksAvailability,
            order: wantsMostExpensive(msg) ? "rent_desc" : "rent_asc"
        });

        const qualifiers = [];
        if (locationMatch) qualifiers.push(`in ${locationMatch.location}`);
        if (rentRange.maxRent !== null) qualifiers.push(`with rent up to ${money(rentRange.maxRent)}`);
        if (rentRange.minRent !== null) qualifiers.push(`with rent from ${money(rentRange.minRent)}`);
        if (asksAvailability) qualifiers.push("with available spots");

        return {
            answer: formatAvailability(
                rows,
                `${amenityMatch.amenity_name} is listed for active PGs${qualifiers.length ? ` ${qualifiers.join(" ")}` : ""}:`
            ),
            source: "database",
            data: rows
        };
    }

    if (asksFood) {
        const foodAmenities = amenities.filter((row) =>
            /\b(food|meal|mess|breakfast|lunch|dinner)\b/i.test(row.amenity_name)
        );

        if (foodAmenities.length === 0) {
            return {
                answer: "I checked the current PG amenities in the database, but no food, meal, or mess facility is listed. I won't guess beyond the stored data.",
                source: "database"
            };
        }

        return {
            answer: [
                "Food-related facilities currently stored in the database:",
                ...foodAmenities.map((a) => `• ${a.amenity_name} — ${a.pg_count} PG(s)`)
            ].join("\n"),
            source: "database",
            data: foodAmenities
        };
    }

    if (asksBooking) {
        return {
            answer: "The current public database does not contain a booking/reservation procedure. I can answer questions about the PG data that is actually stored.",
            source: "database"
        };
    }

    if (asksAvailability) {
        const rows = await getPgRows({
            location: locationMatch ? locationMatch.location : null,
            minRent: rentRange.minRent,
            maxRent: rentRange.maxRent,
            availableOnly: true,
            order: "available"
        });

        return {
            answer: formatAvailability(rows, "Active PGs with available spots in the current database:"),
            source: "database",
            data: rows
        };
    }

    if (asksRent || rentRange.minRent !== null || rentRange.maxRent !== null) {
        const order = wantsMostExpensive(msg) ? "rent_desc" : "rent_asc";
        const rows = await getPgRows({
            location: locationMatch ? locationMatch.location : null,
            minRent: rentRange.minRent,
            maxRent: rentRange.maxRent,
            order
        });

        if (!rows.length) {
            return {
                answer: "No active PG matches that rent/location criteria in the current database.",
                source: "database"
            };
        }

        const min = Number(stats.min_rent || 0);
        const max = Number(stats.max_rent || 0);
        const title = wantsCheapest(msg)
            ? "Lowest-rent active PGs in the current database:"
            : wantsMostExpensive(msg)
                ? "Highest-rent active PGs in the current database:"
                : `Current monthly rent range in the database: ${money(min)} to ${money(max)}.`;

        return {
            answer: [title, ...formatPgList(rows)].join("\n"),
            source: "database",
            data: rows
        };
    }

    if (asksLocation) {
        if (locationMatch) {
            const rows = await getPgRows({
                location: locationMatch.location,
                order: "rent_asc"
            });

            return {
                answer: formatAvailability(
                    rows,
                    `Active PGs in ${locationMatch.location}:`
                ),
                source: "database",
                data: rows
            };
        }

        return {
            answer: [
                "Current PG locations stored in the database:",
                ...locations.map((row) =>
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
                ...formatPgList(rows).map((line, index) => `${line} | Security fee: ${money(rows[index].security_fee)}`)
            ].join("\n"),
            source: "database",
            data: rows
        };
    }

    if (asksAmenities) {
        if (!amenities.length) {
            return {
                answer: "No PG amenities are currently listed in the database.",
                source: "database"
            };
        }

        return {
            answer: [
                "Amenities currently stored in the database:",
                ...amenities.map((a) => `• ${a.amenity_name} — ${a.pg_count} PG(s)`)
            ].join("\n"),
            source: "database",
            data: amenities
        };
    }

    if (asksSummary) {
        return {
            answer: [
                `Active PGs: ${Number(stats.total_pgs || 0)}`,
                `PGs with available spots: ${Number(stats.pgs_with_availability || 0)}`,
                `Total capacity: ${Number(stats.total_capacity || 0)}`,
                `Currently occupied: ${Number(stats.total_occupied || 0)}`,
                `Current rent range: ${money(stats.min_rent)}–${money(stats.max_rent)}`
            ].join("\n"),
            source: "database"
        };
    }

    return {
        answer: [
            "I can answer from the current LIVINKEY PG database.",
            "Try asking about an actual PG name, an amenity, rent, availability, location, security fee, or the current PG summary."
        ].join("\n"),
        source: "database"
    };
}

module.exports = {
    getQuickQuestions,
    answerQuestion
};
