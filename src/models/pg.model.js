const db = require("../config/db");

// =============================================
// PG Model - Pure SQL Operations
// =============================================

const createPG = async (connection, pgData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO pgs (
            name,
            location,
            number_of_floors,
            rent,
            security_fee,
            payment_qr,
            payment_qr_public_id,
            payment_qr_resource_type,
            created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            pgData.name,
            pgData.location,
            pgData.number_of_floors,
            pgData.rent || 0,
            pgData.security_fee || 0,
            pgData.payment_qr || null,
            pgData.payment_qr_public_id || null,
            pgData.payment_qr_resource_type || null,
            pgData.created_by
        ]
    );
    return result.insertId;
};

const createAmenity = async (connection, pgId, amenityName, isCustom = 0) => {
    const [result] = await connection.execute(
        `
        INSERT INTO pg_amenities (pg_id, amenity_name, is_custom)
        VALUES (?, ?, ?)
        `,
        [pgId, amenityName, isCustom]
    );
    return result.insertId;
};

const createPGImage = async (connection, pgId, imageUrl, publicId, resourceType, displayOrder) => {
    const [result] = await connection.execute(
        `
        INSERT INTO pg_images (pg_id, image_url, public_id, resource_type, display_order)
        VALUES (?, ?, ?, ?, ?)
        `,
        [pgId, imageUrl, publicId, resourceType, displayOrder]
    );
    return result.insertId;
};

const createFloor = async (connection, pgId, floorNumber) => {
    const [result] = await connection.execute(
        `
        INSERT INTO floors (pg_id, floor_number)
        VALUES (?, ?)
        `,
        [pgId, floorNumber]
    );
    return result.insertId;
};

const createRoom = async (connection, floorId, roomNumber, capacity, rent = null) => {
    const [result] = await connection.execute(
        `
        INSERT INTO rooms (floor_id, room_number, capacity, rent)
        VALUES (?, ?, ?, ?)
        `,
        [floorId, roomNumber, capacity, rent]
    );
    return result.insertId;
};

const findByName = async (name, excludeId = null) => {
    let query = `SELECT id, name FROM pgs WHERE name = ?`;
    const params = [name];
    if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
    }
    query += ` LIMIT 1`;
    const [rows] = await db.execute(query, params);
    return rows[0] || null;
};

const findById = async (pgId) => {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            name,
            location,
            number_of_floors,
            rent,
            security_fee,
            payment_qr,
            payment_qr_public_id,
            payment_qr_resource_type,
            is_active,
            created_by,
            created_at,
            updated_at
        FROM pgs
        WHERE id = ?
        `,
        [pgId]
    );
    return rows[0] || null;
};

const getAmenitiesByPGId = async (pgId) => {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            amenity_name,
            is_custom
        FROM pg_amenities
        WHERE pg_id = ?
        ORDER BY id
        `,
        [pgId]
    );
    return rows;
};

const getImagesByPGId = async (pgId) => {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            image_url,
            public_id,
            resource_type,
            display_order
        FROM pg_images
        WHERE pg_id = ?
        ORDER BY display_order ASC
        `,
        [pgId]
    );
    return rows;
};

const getFloorsByPGId = async (pgId) => {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            floor_number
        FROM floors
        WHERE pg_id = ?
        ORDER BY floor_number ASC
        `,
        [pgId]
    );
    return rows;
};

const getRoomsByFloorId = async (floorId) => {
    const [rows] = await db.execute(
        `
        SELECT
            r.id,
            r.room_number,
            r.capacity,
            r.rent,
            r.is_active,
            COALESCE(ro.occupied_count, 0) as occupied_count
        FROM rooms r
        LEFT JOIN room_occupancy ro ON r.id = ro.room_id
        WHERE r.floor_id = ?
        ORDER BY r.room_number ASC
        `,
        [floorId]
    );
    return rows;
};

const getPGWithDetails = async (pgId) => {
    const pg = await findById(pgId);
    if (!pg) return null;

    const amenities = await getAmenitiesByPGId(pgId);
    const images = await getImagesByPGId(pgId);
    const floors = await getFloorsByPGId(pgId);

    let totalRooms = 0;
    let totalOccupied = 0;
    let totalCapacity = 0;

    const floorsWithRooms = await Promise.all(
        floors.map(async (floor) => {
            const rooms = await getRoomsByFloorId(floor.id);
            
            let floorTotalRooms = 0;
            let floorOccupied = 0;
            let floorCapacity = 0;
            
            const roomsWithDetails = rooms.map(room => {
                floorTotalRooms++;
                floorOccupied += room.occupied_count || 0;
                floorCapacity += room.capacity || 0;
                
                return {
                    ...room,
                    is_full: (room.occupied_count || 0) >= room.capacity,
                    available: room.capacity - (room.occupied_count || 0)
                };
            });
            
            totalRooms += floorTotalRooms;
            totalOccupied += floorOccupied;
            totalCapacity += floorCapacity;
            
            return {
                ...floor,
                rooms: roomsWithDetails,
                floor_summary: {
                    total_rooms: floorTotalRooms,
                    occupied: floorOccupied,
                    capacity: floorCapacity,
                    occupancy_percentage: floorCapacity > 0 ? Math.round((floorOccupied / floorCapacity) * 100) : 0
                }
            };
        })
    );

    const amenityNames = amenities.map(a => a.amenity_name);

    return {
        ...pg,
        amenities,
        amenity_names: amenityNames,
        images,
        floors: floorsWithRooms,
        total_rooms: totalRooms,
        total_capacity: totalCapacity,
        total_occupied: totalOccupied,
        summary: {
            total_rooms: totalRooms,
            total_capacity: totalCapacity,
            total_occupied: totalOccupied,
            occupancy_percentage: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
            occupancy_text: `${totalOccupied}/${totalCapacity}`
        }
    };
};

// ============================================
// FIXED: getAllPGs - Correct occupancy calculation
// ============================================
const getAllPGs = async (search = null, isActive = null) => {
    // First, get all PGs with basic info
    let baseQuery = `
        SELECT
            p.id,
            p.name,
            p.location,
            p.number_of_floors,
            p.rent,
            p.security_fee,
            p.payment_qr,
            p.is_active,
            p.created_by,
            p.created_at,
            p.updated_at,
            (SELECT image_url FROM pg_images WHERE pg_id = p.id ORDER BY display_order ASC LIMIT 1) as cover_image
        FROM pgs p
        WHERE 1=1
    `;
    const params = [];

    if (search) {
        baseQuery += ` AND (p.name LIKE ? OR p.location LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
    }

    if (isActive !== null) {
        baseQuery += ` AND p.is_active = ?`;
        params.push(isActive);
    }

    baseQuery += ` ORDER BY p.created_at DESC`;

    const [pgRows] = await db.execute(baseQuery, params);

    // For each PG, calculate occupancy separately
    const result = [];
    for (const pg of pgRows) {
        // Get room count, capacity, and occupancy for this PG
        const [roomData] = await db.execute(
            `
            SELECT
                COUNT(DISTINCT r.id) as total_rooms,
                COALESCE(SUM(r.capacity), 0) as total_capacity,
                COALESCE(SUM(ro.occupied_count), 0) as total_occupied
            FROM floors f
            LEFT JOIN rooms r ON f.id = r.floor_id AND r.is_active = 1
            LEFT JOIN room_occupancy ro ON r.id = ro.room_id
            WHERE f.pg_id = ?
            `,
            [pg.id]
        );

        // Get amenities
        const [amenities] = await db.execute(
            `
            SELECT GROUP_CONCAT(DISTINCT amenity_name) as amenity_names
            FROM pg_amenities
            WHERE pg_id = ?
            `,
            [pg.id]
        );

        result.push({
            ...pg,
            total_rooms: parseInt(roomData[0]?.total_rooms) || 0,
            total_capacity: parseInt(roomData[0]?.total_capacity) || 0,
            total_occupied: parseInt(roomData[0]?.total_occupied) || 0,
            amenity_names: amenities[0]?.amenity_names ? amenities[0].amenity_names.split(',') : [],
            occupancy_text: `${parseInt(roomData[0]?.total_occupied) || 0}/${parseInt(roomData[0]?.total_capacity) || 0}`,
            occupancy_percentage: parseInt(roomData[0]?.total_capacity) > 0 
                ? Math.round((parseInt(roomData[0]?.total_occupied) || 0) / parseInt(roomData[0]?.total_capacity) * 100) 
                : 0,
            images: pg.cover_image ? [pg.cover_image] : []
        });
    }

    return result;
};

// ============================================
// FIXED: getPGStats - Correct occupancy stats
// ============================================
const getPGStats = async () => {
    // Get total PGs
    const [totalResult] = await db.execute(
        `SELECT COUNT(*) as total FROM pgs`
    );
    const totalPGs = totalResult[0].total;

    // Get all PGs with their room data
    const [pgData] = await db.execute(
        `
        SELECT 
            p.id,
            p.is_active,
            COUNT(DISTINCT r.id) as total_rooms,
            COALESCE(SUM(r.capacity), 0) as total_capacity,
            COALESCE(SUM(ro.occupied_count), 0) as total_occupied
        FROM pgs p
        LEFT JOIN floors f ON p.id = f.pg_id
        LEFT JOIN rooms r ON f.id = r.floor_id AND r.is_active = 1
        LEFT JOIN room_occupancy ro ON r.id = ro.room_id
        WHERE p.is_active = 1
        GROUP BY p.id, p.is_active
        `
    );

    let fullyOccupied = 0;
    let partiallyOccupied = 0;
    let vacant = 0;

    for (const pg of pgData) {
        const totalRooms = parseInt(pg.total_rooms) || 0;
        const totalCapacity = parseInt(pg.total_capacity) || 0;
        const totalOccupied = parseInt(pg.total_occupied) || 0;

        // If no rooms, it's vacant
        if (totalRooms === 0) {
            vacant++;
            continue;
        }

        // If capacity is 0, it's vacant
        if (totalCapacity === 0) {
            vacant++;
            continue;
        }

        // Calculate occupancy percentage
        const occupancyPercentage = (totalOccupied / totalCapacity) * 100;

        if (occupancyPercentage === 100) {
            fullyOccupied++;
        } else if (occupancyPercentage > 0) {
            partiallyOccupied++;
        } else {
            vacant++;
        }
    }

    return {
        total_pgs: totalPGs,
        fully_occupied: fullyOccupied,
        partially_occupied: partiallyOccupied,
        vacant: vacant
    };
};

const updatePG = async (connection, pgId, pgData) => {
    const [result] = await connection.execute(
        `
        UPDATE pgs
        SET
            name = ?,
            location = ?,
            number_of_floors = ?,
            rent = ?,
            security_fee = ?,
            payment_qr = ?,
            payment_qr_public_id = ?,
            payment_qr_resource_type = ?
        WHERE id = ?
        `,
        [
            pgData.name,
            pgData.location,
            pgData.number_of_floors,
            pgData.rent || 0,
            pgData.security_fee || 0,
            pgData.payment_qr || null,
            pgData.payment_qr_public_id || null,
            pgData.payment_qr_resource_type || null,
            pgId
        ]
    );
    return result.affectedRows;
};

const deleteAmenitiesByPGId = async (connection, pgId) => {
    await connection.execute(
        `DELETE FROM pg_amenities WHERE pg_id = ?`,
        [pgId]
    );
};

const deleteImagesByPGId = async (connection, pgId) => {
    await connection.execute(
        `DELETE FROM pg_images WHERE pg_id = ?`,
        [pgId]
    );
};

const deleteFloorsByPGId = async (connection, pgId) => {
    await connection.execute(
        `DELETE FROM floors WHERE pg_id = ?`,
        [pgId]
    );
};

const deletePG = async (connection, pgId) => {
    const [result] = await connection.execute(
        `DELETE FROM pgs WHERE id = ?`,
        [pgId]
    );
    return result.affectedRows;
};

const togglePGStatus = async (pgId, isActive) => {
    const [result] = await db.execute(
        `
        UPDATE pgs
        SET is_active = ?
        WHERE id = ?
        `,
        [isActive, pgId]
    );
    return result.affectedRows;
};

module.exports = {
    createPG,
    createAmenity,
    createPGImage,
    createFloor,
    createRoom,
    findByName,
    findById,
    getAmenitiesByPGId,
    getImagesByPGId,
    getFloorsByPGId,
    getRoomsByFloorId,
    getPGWithDetails,
    getAllPGs,
    getPGStats,
    updatePG,
    deleteAmenitiesByPGId,
    deleteImagesByPGId,
    deleteFloorsByPGId,
    deletePG,
    togglePGStatus
};