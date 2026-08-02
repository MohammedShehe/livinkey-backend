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
            payment_qr,
            payment_qr_public_id,
            payment_qr_resource_type,
            created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            pgData.name,
            pgData.location,
            pgData.number_of_floors,
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

const createRoom = async (connection, floorId, roomNumber, capacity) => {
    const [result] = await connection.execute(
        `
        INSERT INTO rooms (floor_id, room_number, capacity)
        VALUES (?, ?, ?)
        `,
        [floorId, roomNumber, capacity]
    );
    return result.insertId;
};

const findById = async (pgId) => {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            name,
            location,
            number_of_floors,
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
            id,
            room_number,
            capacity,
            is_active
        FROM rooms
        WHERE floor_id = ?
        ORDER BY room_number ASC
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

    const floorsWithRooms = await Promise.all(
        floors.map(async (floor) => {
            const rooms = await getRoomsByFloorId(floor.id);
            return {
                ...floor,
                rooms
            };
        })
    );

    return {
        ...pg,
        amenities,
        images,
        floors: floorsWithRooms
    };
};

const getAllPGs = async (search = null, isActive = null) => {
    let query = `
        SELECT
            id,
            name,
            location,
            number_of_floors,
            payment_qr,
            is_active,
            created_by,
            created_at,
            updated_at
        FROM pgs
        WHERE 1=1
    `;
    const params = [];

    if (search) {
        query += ` AND (name LIKE ? OR location LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
    }

    if (isActive !== null) {
        query += ` AND is_active = ?`;
        params.push(isActive);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
};

const getPGStats = async () => {
    // Get total PGs
    const [totalResult] = await db.execute(
        `SELECT COUNT(*) as total FROM pgs`
    );
    const totalPGs = totalResult[0].total;

    // Get all PGs with their room counts and capacities
    const [pgData] = await db.execute(
        `
        SELECT 
            p.id,
            p.name,
            p.is_active,
            COUNT(DISTINCT r.id) as total_rooms,
            COALESCE(SUM(r.capacity), 0) as total_capacity
        FROM pgs p
        LEFT JOIN floors f ON p.id = f.pg_id
        LEFT JOIN rooms r ON f.id = r.floor_id AND r.is_active = 1
        WHERE p.is_active = 1
        GROUP BY p.id, p.name, p.is_active
        `
    );

    // Get occupied rooms count (rooms that have tenants - we'll use a placeholder)
    // Since we don't have tenants table yet, we'll use a simpler approach
    // For now, we'll consider a PG as "occupied" if it has rooms with capacity
    // This will be updated when tenants table is implemented
    
    let fullyOccupied = 0;
    let partiallyOccupied = 0;
    let vacant = 0;

    // For each PG, calculate occupancy status
    // Since we don't have actual tenant data yet, we'll use a placeholder logic
    // We'll mark PGs with rooms but no occupancy data as "vacant" for now
    // This will be improved when tenants table is added
    
    for (const pg of pgData) {
        // If PG has no rooms, it's vacant
        if (pg.total_rooms === 0) {
            vacant++;
            continue;
        }

        // For now, we'll use a simple logic:
        // If total_rooms > 0 but we don't have occupancy data, mark as partially occupied
        // This will be refined when tenants are implemented
        partiallyOccupied++;
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
            payment_qr = ?,
            payment_qr_public_id = ?,
            payment_qr_resource_type = ?
        WHERE id = ?
        `,
        [
            pgData.name,
            pgData.location,
            pgData.number_of_floors,
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
    // This will cascade delete rooms due to FOREIGN KEY constraint
    await connection.execute(
        `DELETE FROM floors WHERE pg_id = ?`,
        [pgId]
    );
};

const deletePG = async (connection, pgId) => {
    // This will cascade delete amenities, images, floors, and rooms
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