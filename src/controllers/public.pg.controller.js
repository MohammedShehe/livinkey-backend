const db = require("../config/db");

// Get Welcome Message for Public (NEW)
exports.getWelcomeMessage = async (req, res) => {
    const hours = new Date().getHours();
    let greeting = '';
    if (hours >= 5 && hours < 12) greeting = 'Good Morning';
    else if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
    else if (hours >= 17 && hours < 21) greeting = 'Good Evening';
    else greeting = 'Good Night';

    return res.json({
        success: true,
        data: {
            greeting: greeting,
            message: 'Welcome to Livinkey! Find your perfect PG today.',
            description: 'Browse through our verified PGs, check reviews, and find the perfect place to stay.'
        }
    });
};

// Get all PGs with details (Public - No Auth)
exports.getAllPGs = async (req, res) => {
    try {
        const { 
            status, 
            search, 
            min_rent, 
            max_rent, 
            amenities,
            min_rating,
            max_rating 
        } = req.query;

        const connection = await db.getConnection();

        let query = `
            SELECT 
                p.id,
                p.name,
                p.location,
                p.rent,
                p.security_fee,
                p.number_of_floors,
                p.is_active,
                p.created_at,
                COUNT(DISTINCT r.id) as total_rooms,
                COALESCE(SUM(r.capacity), 0) as total_capacity,
                COALESCE(SUM(ro.occupied_count), 0) as total_occupied,
                ROUND(COALESCE(AVG(tf.overall_rating), 0), 1) as overall_rating,
                COUNT(DISTINCT tf.id) as total_reviews,
                GROUP_CONCAT(DISTINCT pa.amenity_name) as amenity_names,
                (
                    SELECT image_url 
                    FROM pg_images 
                    WHERE pg_id = p.id 
                    ORDER BY display_order ASC 
                    LIMIT 1
                ) as cover_image
            FROM pgs p
            LEFT JOIN floors f ON p.id = f.pg_id
            LEFT JOIN rooms r ON f.id = r.floor_id AND r.is_active = 1
            LEFT JOIN room_occupancy ro ON r.id = ro.room_id
            LEFT JOIN pg_amenities pa ON p.id = pa.pg_id
            LEFT JOIN tenant_feedbacks tf ON p.id = tf.pg_id
            WHERE 1=1
        `;

        const params = [];

        if (search) {
            query += ` AND (p.name LIKE ? OR p.location LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern);
        }

        if (min_rent) {
            query += ` AND p.rent >= ?`;
            params.push(parseFloat(min_rent));
        }

        if (max_rent) {
            query += ` AND p.rent <= ?`;
            params.push(parseFloat(max_rent));
        }

        if (amenities) {
            const amenityList = amenities.split(',').map(a => a.trim());
            const placeholders = amenityList.map(() => '?').join(',');
            query += ` AND p.id IN (
                SELECT pg_id FROM pg_amenities 
                WHERE amenity_name IN (${placeholders})
                GROUP BY pg_id 
                HAVING COUNT(DISTINCT amenity_name) = ?
            )`;
            params.push(...amenityList, amenityList.length);
        }

        query += ` GROUP BY p.id, p.name, p.location, p.rent, p.security_fee, p.number_of_floors, p.is_active, p.created_at`;

        const havingClauses = [];

        if (status) {
            if (status === 'vacant') {
                havingClauses.push(` COALESCE(SUM(ro.occupied_count), 0) = 0`);
            } else if (status === 'full_occupied') {
                havingClauses.push(` COALESCE(SUM(ro.occupied_count), 0) >= COALESCE(SUM(r.capacity), 0) AND COALESCE(SUM(r.capacity), 0) > 0`);
            } else if (status === 'partial_occupied') {
                havingClauses.push(` COALESCE(SUM(ro.occupied_count), 0) > 0 AND COALESCE(SUM(ro.occupied_count), 0) < COALESCE(SUM(r.capacity), 0)`);
            }
        }

        if (min_rating) {
            havingClauses.push(` ROUND(COALESCE(AVG(tf.overall_rating), 0), 1) >= ?`);
            params.push(parseFloat(min_rating));
        }

        if (max_rating) {
            havingClauses.push(` ROUND(COALESCE(AVG(tf.overall_rating), 0), 1) <= ?`);
            params.push(parseFloat(max_rating));
        }

        if (havingClauses.length > 0) {
            query += ` HAVING ` + havingClauses.join(' AND ');
        }

        query += ` ORDER BY p.is_active DESC, overall_rating DESC, p.name ASC`;

        const [rows] = await connection.execute(query, params);

        for (const pg of rows) {
            const [images] = await connection.execute(
                `
                SELECT image_url, display_order 
                FROM pg_images 
                WHERE pg_id = ? 
                ORDER BY display_order ASC
                `,
                [pg.id]
            );
            pg.images = images;
            pg.amenity_names = pg.amenity_names ? pg.amenity_names.split(',') : [];
            pg.occupancy_percentage = pg.total_capacity > 0 ? Math.round((pg.total_occupied / pg.total_capacity) * 100) : 0;
            pg.status_text = pg.total_occupied === 0 ? 'Vacant' :
                            pg.total_occupied >= pg.total_capacity ? 'Full Occupied' :
                            'Partially Occupied';
        }

        connection.release();

        return res.json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("Get All PGs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get PG Details by ID (Public - No Auth)
exports.getPGDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await db.getConnection();

        const [pgRows] = await connection.execute(
            `
            SELECT 
                p.id,
                p.name,
                p.location,
                p.rent,
                p.security_fee,
                p.number_of_floors,
                p.is_active,
                p.created_at,
                p.updated_at,
                ROUND(COALESCE(AVG(tf.overall_rating), 0), 1) as overall_rating,
                COUNT(DISTINCT tf.id) as total_reviews
            FROM pgs p
            LEFT JOIN tenant_feedbacks tf ON p.id = tf.pg_id
            WHERE p.id = ?
            GROUP BY p.id
            `,
            [id]
        );

        if (pgRows.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "PG not found"
            });
        }

        const pg = pgRows[0];

        const [amenities] = await connection.execute(
            `
            SELECT id, amenity_name, is_custom 
            FROM pg_amenities 
            WHERE pg_id = ? 
            ORDER BY id
            `,
            [id]
        );
        pg.amenities = amenities;

        const [images] = await connection.execute(
            `
            SELECT id, image_url, display_order 
            FROM pg_images 
            WHERE pg_id = ? 
            ORDER BY display_order ASC
            `,
            [id]
        );
        pg.images = images;

        const [floors] = await connection.execute(
            `
            SELECT 
                f.id,
                f.floor_number,
                COUNT(r.id) as total_rooms,
                COALESCE(SUM(r.capacity), 0) as total_capacity,
                COALESCE(SUM(ro.occupied_count), 0) as total_occupied
            FROM floors f
            LEFT JOIN rooms r ON f.id = r.floor_id AND r.is_active = 1
            LEFT JOIN room_occupancy ro ON r.id = ro.room_id
            WHERE f.pg_id = ?
            GROUP BY f.id, f.floor_number
            ORDER BY f.floor_number ASC
            `,
            [id]
        );

        for (const floor of floors) {
            const [rooms] = await connection.execute(
                `
                SELECT 
                    r.id,
                    r.room_number,
                    r.capacity,
                    COALESCE(ro.occupied_count, 0) as occupied_count,
                    r.is_active
                FROM rooms r
                LEFT JOIN room_occupancy ro ON r.id = ro.room_id
                WHERE r.floor_id = ? AND r.is_active = 1
                ORDER BY r.room_number ASC
                `,
                [floor.id]
            );
            floor.rooms = rooms.map(room => ({
                ...room,
                available_spots: room.capacity - room.occupied_count,
                is_full: room.occupied_count >= room.capacity
            }));
            floor.occupancy_percentage = floor.total_capacity > 0 ? Math.round((floor.total_occupied / floor.total_capacity) * 100) : 0;
        }

        pg.floors = floors;

        const [reviews] = await connection.execute(
            `
            SELECT 
                t.full_name as name,
                tf.comment,
                tf.overall_rating as rating,
                tf.created_at as date
            FROM tenant_feedbacks tf
            INNER JOIN tenants t ON tf.tenant_id = t.id
            WHERE tf.pg_id = ?
            ORDER BY tf.created_at DESC
            LIMIT 20
            `,
            [id]
        );
        pg.reviews = reviews;

        const totalRooms = floors.reduce((sum, f) => sum + f.total_rooms, 0);
        const totalCapacity = floors.reduce((sum, f) => sum + f.total_capacity, 0);
        const totalOccupied = floors.reduce((sum, f) => sum + f.total_occupied, 0);

        pg.stats = {
            total_rooms: totalRooms,
            total_capacity: totalCapacity,
            total_occupied: totalOccupied,
            available_spots: totalCapacity - totalOccupied,
            occupancy_percentage: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
            status: totalOccupied === 0 ? 'Vacant' :
                    totalOccupied >= totalCapacity ? 'Full Occupied' :
                    'Partially Occupied'
        };

        connection.release();

        return res.json({
            success: true,
            data: pg
        });

    } catch (error) {
        console.error("Get PG Details Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get PG Stats (Public - No Auth)
exports.getPGStats = async (req, res) => {
    try {
        const connection = await db.getConnection();

        const [totalResult] = await connection.execute(
            `SELECT COUNT(*) as total FROM pgs`
        );
        const total = totalResult[0].total;

        const [activeResult] = await connection.execute(
            `SELECT COUNT(*) as active FROM pgs WHERE is_active = 1`
        );
        const active = activeResult[0].active;

        const [statusResult] = await connection.execute(
            `
            SELECT 
                p.id,
                COALESCE(SUM(r.capacity), 0) as total_capacity,
                COALESCE(SUM(ro.occupied_count), 0) as total_occupied
            FROM pgs p
            LEFT JOIN floors f ON p.id = f.pg_id
            LEFT JOIN rooms r ON f.id = r.floor_id AND r.is_active = 1
            LEFT JOIN room_occupancy ro ON r.id = ro.room_id
            WHERE p.is_active = 1
            GROUP BY p.id
            `
        );

        let vacant = 0;
        let full = 0;
        let partial = 0;

        for (const pg of statusResult) {
            const occupied = pg.total_occupied || 0;
            const capacity = pg.total_capacity || 0;
            
            if (capacity === 0) {
                vacant++;
            } else if (occupied === 0) {
                vacant++;
            } else if (occupied >= capacity) {
                full++;
            } else {
                partial++;
            }
        }

        connection.release();

        return res.json({
            success: true,
            data: {
                total_pgs: total,
                active_pgs: active,
                inactive_pgs: total - active,
                vacant_pgs: vacant,
                full_pgs: full,
                partial_pgs: partial
            }
        });

    } catch (error) {
        console.error("Get PG Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};