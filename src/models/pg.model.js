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
        INSERT INTO floors (pg_id, floor_number, is_active)
        VALUES (?, ?, 1)
        `,
        [pgId, floorNumber]
    );
    return result.insertId;
};

const createRoom = async (connection, floorId, roomNumber, capacity, rent = null) => {
    const [result] = await connection.execute(
        `
        INSERT INTO rooms (floor_id, room_number, capacity, rent, is_active)
        VALUES (?, ?, ?, ?, 1)
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
            floor_number,
            is_active
        FROM floors
        WHERE pg_id = ? AND is_active = 1
        ORDER BY floor_number ASC
        `,
        [pgId]
    );
    return rows;
};

/**
 * FIXED: Get rooms by floor ID - Only active rooms
 */
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
        WHERE r.floor_id = ? AND r.is_active = 1
        ORDER BY r.room_number ASC
        `,
        [floorId]
    );
    return rows;
};

/**
 * FIXED: Get all active rooms by PG ID
 */
const getRoomsByPGId = async (pgId) => {
    const [rows] = await db.execute(
        `
        SELECT
            r.id,
            r.room_number,
            r.capacity,
            r.rent,
            r.floor_id,
            r.is_active,
            COALESCE(ro.occupied_count, 0) as occupied_count
        FROM rooms r
        INNER JOIN floors f ON r.floor_id = f.id
        LEFT JOIN room_occupancy ro ON r.id = ro.room_id
        WHERE f.pg_id = ? AND r.is_active = 1
        ORDER BY r.room_number ASC
        `,
        [pgId]
    );
    return rows;
};

/**
 * FIXED: Get active rooms with tenant count
 */
const getRoomsWithTenantCount = async (pgId) => {
    const [rows] = await db.execute(
        `
        SELECT
            r.id,
            r.room_number,
            r.capacity,
            r.rent,
            r.floor_id,
            r.is_active,
            COALESCE(ro.occupied_count, 0) as occupied_count,
            COUNT(td.tenant_id) as tenant_count
        FROM rooms r
        INNER JOIN floors f ON r.floor_id = f.id
        LEFT JOIN room_occupancy ro ON r.id = ro.room_id
        LEFT JOIN tenant_details td ON r.id = td.room_id
        WHERE f.pg_id = ? AND r.is_active = 1
        GROUP BY r.id
        ORDER BY r.room_number ASC
        `,
        [pgId]
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
// FIXED: getAllPGs - Only active rooms
// ============================================
const getAllPGs = async (search = null, isActive = null) => {
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

    const result = [];
    for (const pg of pgRows) {
        // FIXED: Only count active rooms
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
// FIXED: getPGStats - Only active rooms
// ============================================
const getPGStats = async () => {
    const [totalResult] = await db.execute(
        `SELECT COUNT(*) as total FROM pgs`
    );
    const totalPGs = totalResult[0].total;

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

        if (totalRooms === 0 || totalCapacity === 0) {
            vacant++;
            continue;
        }

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

// ============================================
// FIXED: Soft delete floors - uses JOIN for pg_id
// ============================================
const softDeleteFloorsByPGId = async (connection, pgId, activeFloorNumbers) => {
    if (!activeFloorNumbers || activeFloorNumbers.length === 0) {
        await connection.execute(
            `UPDATE floors SET is_active = 0, deleted_at = NOW() WHERE pg_id = ?`,
            [pgId]
        );
        return;
    }
    
    const placeholders = activeFloorNumbers.map(() => '?').join(',');
    await connection.execute(
        `UPDATE floors SET is_active = 0, deleted_at = NOW() 
         WHERE pg_id = ? AND floor_number NOT IN (${placeholders})`,
        [pgId, ...activeFloorNumbers]
    );
};

// ============================================
// FIXED: Soft delete rooms - uses JOIN through floors table
// ============================================
const softDeleteRoomsByPGId = async (connection, pgId, activeRoomIds) => {
    if (!activeRoomIds || activeRoomIds.length === 0) {
        await connection.execute(
            `UPDATE rooms r 
             INNER JOIN floors f ON r.floor_id = f.id 
             SET r.is_active = 0, r.deleted_at = NOW() 
             WHERE f.pg_id = ?`,
            [pgId]
        );
        return;
    }
    
    const placeholders = activeRoomIds.map(() => '?').join(',');
    await connection.execute(
        `UPDATE rooms r 
         INNER JOIN floors f ON r.floor_id = f.id 
         SET r.is_active = 0, r.deleted_at = NOW() 
         WHERE f.pg_id = ? AND r.id NOT IN (${placeholders})`,
        [pgId, ...activeRoomIds]
    );
};

// ============================================
// FIXED: Check if rooms have tenants
// ============================================
const checkRoomsHaveTenants = async (connection, roomIds) => {
    if (!roomIds || roomIds.length === 0) return [];
    
    const placeholders = roomIds.map(() => '?').join(',');
    const [rows] = await connection.execute(
        `
        SELECT 
            r.id as room_id,
            r.room_number,
            COUNT(td.tenant_id) as tenant_count,
            GROUP_CONCAT(t.full_name SEPARATOR ', ') as tenant_names
        FROM rooms r
        LEFT JOIN tenant_details td ON r.id = td.room_id
        LEFT JOIN tenants t ON td.tenant_id = t.id
        WHERE r.id IN (${placeholders}) AND r.is_active = 1
        GROUP BY r.id, r.room_number
        HAVING COUNT(td.tenant_id) > 0
        `,
        roomIds
    );
    return rows;
};

// ============================================
// FIXED: Activate a room (undo soft delete)
// ============================================
const activateRoom = async (connection, roomId) => {
    const [result] = await connection.execute(
        `
        UPDATE rooms 
        SET is_active = 1, deleted_at = NULL 
        WHERE id = ?
        `,
        [roomId]
    );
    return result.affectedRows;
};

// ============================================
// FIXED: Get room by number for a PG (only active)
// ============================================
const getRoomByNumber = async (pgId, roomNumber) => {
    const [rows] = await db.execute(
        `
        SELECT r.id, r.room_number, r.capacity, r.rent, r.floor_id
        FROM rooms r
        INNER JOIN floors f ON r.floor_id = f.id
        WHERE f.pg_id = ? AND r.room_number = ? AND r.is_active = 1
        LIMIT 1
        `,
        [pgId, roomNumber]
    );
    return rows[0] || null;
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

// ============================================
// FIXED: Check if PG has any active tenants
// ============================================
const hasActiveTenants = async (connection, pgId) => {
    const [rows] = await connection.execute(
        `
        SELECT COUNT(*) as count
        FROM tenant_details td
        INNER JOIN rooms r ON td.room_id = r.id
        INNER JOIN floors f ON r.floor_id = f.id
        WHERE f.pg_id = ? AND td.tenant_id IS NOT NULL
        `,
        [pgId]
    );
    return parseInt(rows[0]?.count || 0) > 0;
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
    getRoomsByPGId,
    getRoomsWithTenantCount,
    getPGWithDetails,
    getAllPGs,
    getPGStats,
    updatePG,
    deleteAmenitiesByPGId,
    deleteImagesByPGId,
    softDeleteFloorsByPGId,
    softDeleteRoomsByPGId,
    checkRoomsHaveTenants,
    activateRoom,
    getRoomByNumber,
    deletePG,
    togglePGStatus,
    hasActiveTenants
};