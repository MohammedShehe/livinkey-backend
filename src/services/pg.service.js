const db = require("../config/db");
const PGModel = require("../models/pg.model");
const { uploadFile, deleteFile } = require("./upload.service");
const NotificationEventManager = require("../utils/notification.events");

// =============================================
// PG Service - Business Logic & Transactions
// =============================================

const createPG = async (pgData, files = {}) => {
    const connection = await db.getConnection();
    let createdPG = null;
    const uploadedCloudFiles = [];

    try {
        await connection.beginTransaction();

        const existingPG = await PGModel.findByName(pgData.name);
        if (existingPG) {
            throw new Error(`PG with name "${pgData.name}" already exists`);
        }

        let paymentQr = null;
        let paymentQrPublicId = null;
        let paymentQrResourceType = null;

        if (files.paymentQr && files.paymentQr.length > 0) {
            const uploadResult = await uploadFile(
                files.paymentQr[0],
                "livinkey/pgs/qr"
            );
            if (uploadResult) {
                paymentQr = uploadResult.secure_url;
                paymentQrPublicId = uploadResult.public_id;
                paymentQrResourceType = uploadResult.resource_type;
                uploadedCloudFiles.push({ public_id: paymentQrPublicId, resource_type: paymentQrResourceType });
            }
        }

        const pgId = await PGModel.createPG(connection, {
            name: pgData.name,
            location: pgData.location,
            number_of_floors: parseInt(pgData.number_of_floors),
            rent: pgData.rent || 0,
            security_fee: pgData.security_fee || 0,
            payment_qr: paymentQr,
            payment_qr_public_id: paymentQrPublicId,
            payment_qr_resource_type: paymentQrResourceType,
            created_by: pgData.created_by
        });

        const amenities = pgData.amenities || [];
        for (const amenity of amenities) {
            await PGModel.createAmenity(
                connection,
                pgId,
                amenity.name,
                amenity.is_custom ? 1 : 0
            );
        }

        const imageFiles = files.images || [];
        for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
            const file = imageFiles[i];
            const uploadResult = await uploadFile(
                file,
                "livinkey/pgs/images"
            );
            
            if (uploadResult) {
                await PGModel.createPGImage(
                    connection,
                    pgId,
                    uploadResult.secure_url,
                    uploadResult.public_id,
                    uploadResult.resource_type,
                    i
                );
                uploadedCloudFiles.push({ public_id: uploadResult.public_id, resource_type: uploadResult.resource_type });
            }
        }

        const floors = pgData.floors || [];
        for (const floorData of floors) {
            const floorId = await PGModel.createFloor(
                connection,
                pgId,
                parseInt(floorData.floor_number)
            );

            const rooms = floorData.rooms || [];
            for (const roomData of rooms) {
                await PGModel.createRoom(
                    connection,
                    floorId,
                    roomData.room_number,
                    parseInt(roomData.capacity),
                    roomData.rent || pgData.rent || 0
                );
            }
        }

        await connection.commit();

        createdPG = await PGModel.getPGWithDetails(pgId);

        try {
            await NotificationEventManager.onPGCreated(createdPG);
            await NotificationEventManager.onGuestPGAdded(createdPG);
        } catch (notifError) {
            console.error("Failed to send PG notification:", notifError);
        }

        return createdPG;

    } catch (error) {
        await connection.rollback();
        console.error("PG Creation Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const getAllPGs = async (search = null, isActive = null) => {
    return await PGModel.getAllPGs(search, isActive);
};

const getPGById = async (pgId) => {
    const pg = await PGModel.getPGWithDetails(pgId);
    return pg;
};

const getPGStats = async () => {
    return await PGModel.getPGStats();
};

// ============================================
// FIXED: updatePG - Safe room preservation
// ============================================
const updatePG = async (pgId, pgData, files = {}) => {
    const connection = await db.getConnection();
    let updatedPG = null;

    try {
        await connection.beginTransaction();

        const existingPG = await PGModel.findById(pgId);
        if (!existingPG) {
            throw new Error("PG not found");
        }

        // 1. Check duplicate name
        const duplicatePG = await PGModel.findByName(pgData.name, pgId);
        if (duplicatePG) {
            throw new Error(`PG with name "${pgData.name}" already exists`);
        }

        // 2. Get current active rooms
        const currentRooms = await PGModel.getRoomsByPGId(pgId);
        const currentRoomIds = currentRooms.map(r => r.id);
        const currentRoomNumbers = currentRooms.map(r => r.room_number);

        // 3. Extract new room numbers from request
        const newRoomNumbers = [];
        for (const floor of pgData.floors) {
            for (const room of floor.rooms) {
                newRoomNumbers.push(room.room_number);
            }
        }

        // 4. Identify rooms being removed
        const removedRoomNumbers = currentRoomNumbers.filter(
            rn => !newRoomNumbers.includes(rn)
        );
        
        // 5. CRITICAL: Check if removed rooms have tenants
        if (removedRoomNumbers.length > 0) {
            const removedRooms = currentRooms.filter(
                r => removedRoomNumbers.includes(r.room_number)
            );
            const removedRoomIds = removedRooms.map(r => r.id);
            
            const occupiedRooms = await PGModel.checkRoomsHaveTenants(
                connection,
                removedRoomIds
            );
            
            if (occupiedRooms.length > 0) {
                const details = occupiedRooms.map(r => 
                    `Room "${r.room_number}" has ${r.tenant_count} tenant(s) (${r.tenant_names})`
                ).join(', ');
                
                throw new Error(
                    `Cannot remove rooms with active tenants: ${details}. Please relocate tenants first.`
                );
            }
        }

        // 6. Handle Payment QR update
        let paymentQr = existingPG.payment_qr;
        let paymentQrPublicId = existingPG.payment_qr_public_id;
        let paymentQrResourceType = existingPG.payment_qr_resource_type;

        if (files.paymentQr && files.paymentQr.length > 0) {
            if (existingPG.payment_qr_public_id) {
                try {
                    await deleteFile(
                        existingPG.payment_qr_public_id,
                        existingPG.payment_qr_resource_type
                    );
                } catch (error) {
                    console.error("Failed to delete old QR:", error);
                }
            }

            const uploadResult = await uploadFile(
                files.paymentQr[0],
                "livinkey/pgs/qr"
            );
            
            if (uploadResult) {
                paymentQr = uploadResult.secure_url;
                paymentQrPublicId = uploadResult.public_id;
                paymentQrResourceType = uploadResult.resource_type;
            }
        } else if (pgData.remove_qr === true) {
            if (existingPG.payment_qr_public_id) {
                try {
                    await deleteFile(
                        existingPG.payment_qr_public_id,
                        existingPG.payment_qr_resource_type
                    );
                } catch (error) {
                    console.error("Failed to delete QR:", error);
                }
            }
            paymentQr = null;
            paymentQrPublicId = null;
            paymentQrResourceType = null;
        }

        // 7. Update PG basic info
        await PGModel.updatePG(connection, pgId, {
            name: pgData.name,
            location: pgData.location,
            number_of_floors: parseInt(pgData.number_of_floors),
            rent: pgData.rent || 0,
            security_fee: pgData.security_fee || 0,
            payment_qr: paymentQr,
            payment_qr_public_id: paymentQrPublicId,
            payment_qr_resource_type: paymentQrResourceType
        });

        // 8. Update Amenities
        await PGModel.deleteAmenitiesByPGId(connection, pgId);
        const amenities = pgData.amenities || [];
        for (const amenity of amenities) {
            await PGModel.createAmenity(
                connection,
                pgId,
                amenity.name,
                amenity.is_custom ? 1 : 0
            );
        }

        // 9. Update Images - Only if new images uploaded
        if (files.images && files.images.length > 0) {
            const oldImages = await PGModel.getImagesByPGId(pgId);
            for (const image of oldImages) {
                try {
                    await deleteFile(image.public_id, image.resource_type);
                } catch (error) {
                    console.error("Failed to delete old image:", error);
                }
            }
            await PGModel.deleteImagesByPGId(connection, pgId);

            const imageFiles = files.images || [];
            for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
                const file = imageFiles[i];
                const uploadResult = await uploadFile(
                    file,
                    "livinkey/pgs/images"
                );
                if (uploadResult) {
                    await PGModel.createPGImage(
                        connection,
                        pgId,
                        uploadResult.secure_url,
                        uploadResult.public_id,
                        uploadResult.resource_type,
                        i
                    );
                }
            }
        }

        // 10. Process new floor structure - PRESERVE existing rooms when possible
        const newFloorNumbers = pgData.floors.map(f => parseInt(f.floor_number));
        
        // 10a. Soft delete floors that are no longer present
        await PGModel.softDeleteFloorsByPGId(connection, pgId, newFloorNumbers);

        // 10b. Track room IDs to keep
        const activeRoomIds = [];

        for (const floorData of pgData.floors) {
            // Get or create floor
            let [floor] = await connection.execute(
                `SELECT id FROM floors WHERE pg_id = ? AND floor_number = ? AND is_active = 1`,
                [pgId, parseInt(floorData.floor_number)]
            );
            
            let floorId;
            if (floor.length === 0) {
                // Check if floor exists but is soft-deleted - reactivate it
                const [deletedFloor] = await connection.execute(
                    `SELECT id FROM floors WHERE pg_id = ? AND floor_number = ? AND is_active = 0`,
                    [pgId, parseInt(floorData.floor_number)]
                );
                
                if (deletedFloor.length > 0) {
                    await connection.execute(
                        `UPDATE floors SET is_active = 1 WHERE id = ?`,
                        [deletedFloor[0].id]
                    );
                    floorId = deletedFloor[0].id;
                } else {
                    const [result] = await connection.execute(
                        `INSERT INTO floors (pg_id, floor_number, is_active) VALUES (?, ?, 1)`,
                        [pgId, parseInt(floorData.floor_number)]
                    );
                    floorId = result.insertId;
                }
            } else {
                floorId = floor[0].id;
            }
            
            for (const roomData of floorData.rooms) {
                // Check if room already exists in this floor
                const [existingRoom] = await connection.execute(
                    `SELECT id, room_number, is_active FROM rooms 
                     WHERE floor_id = ? AND room_number = ?`,
                    [floorId, roomData.room_number]
                );
                
                if (existingRoom.length > 0) {
                    // ✅ UPDATE existing room (KEEPS SAME ID - TENANTS SAFE!)
                    await connection.execute(
                        `UPDATE rooms 
                         SET capacity = ?, rent = ?, is_active = 1, deleted_at = NULL 
                         WHERE id = ? AND room_number = ?`,
                        [
                            parseInt(roomData.capacity), 
                            roomData.rent || pgData.rent || 0,
                            existingRoom[0].id,
                            roomData.room_number
                        ]
                    );
                    activeRoomIds.push(existingRoom[0].id);
                } else {
                    // ✅ INSERT new room
                    const [result] = await connection.execute(
                        `INSERT INTO rooms (floor_id, room_number, capacity, rent, is_active)
                         VALUES (?, ?, ?, ?, 1)`,
                        [
                            floorId,
                            roomData.room_number,
                            parseInt(roomData.capacity),
                            roomData.rent || pgData.rent || 0
                        ]
                    );
                    activeRoomIds.push(result.insertId);
                }
            }
        }

        // 10c. Soft delete rooms that are no longer present (only if no tenants)
        await PGModel.softDeleteRoomsByPGId(connection, pgId, activeRoomIds);

        await connection.commit();

        updatedPG = await PGModel.getPGWithDetails(pgId);

        try {
            await NotificationEventManager.onPGUpdated(updatedPG);
            await NotificationEventManager.onGuestPGUpdated(updatedPG);
        } catch (notifError) {
            console.error("Failed to send PG update notification:", notifError);
        }

        return updatedPG;

    } catch (error) {
        await connection.rollback();
        console.error("PG Update Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============================================
// FIXED: deletePG - Check for tenants before deletion
// ============================================
const deletePG = async (pgId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const pg = await PGModel.findById(pgId);
        if (!pg) {
            throw new Error("PG not found");
        }

        // CRITICAL: Check if PG has active tenants
        const hasTenants = await PGModel.hasActiveTenants(connection, pgId);
        if (hasTenants) {
            throw new Error(
                "Cannot delete PG with active tenants. Please relocate or deactivate all tenants first."
            );
        }

        // Delete QR code
        if (pg.payment_qr_public_id) {
            try {
                await deleteFile(
                    pg.payment_qr_public_id,
                    pg.payment_qr_resource_type
                );
            } catch (error) {
                console.error("Failed to delete QR:", error);
            }
        }

        // Delete images
        const images = await PGModel.getImagesByPGId(pgId);
        for (const image of images) {
            try {
                await deleteFile(image.public_id, image.resource_type);
            } catch (error) {
                console.error("Failed to delete image:", error);
            }
        }

        await PGModel.deletePG(connection, pgId);

        await connection.commit();
        return true;

    } catch (error) {
        await connection.rollback();
        console.error("PG Delete Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const togglePGStatus = async (pgId, isActive) => {
    try {
        const result = await PGModel.togglePGStatus(pgId, isActive);
        
        if (result > 0) {
            const pg = await PGModel.findById(pgId);
            if (pg) {
                try {
                    await NotificationEventManager.onPGStatusChanged(pg, isActive === 1);
                } catch (notifError) {
                    console.error("Failed to send PG status notification:", notifError);
                }
            }
        }
        
        return result;
    } catch (error) {
        console.error("Toggle PG Status Error:", error);
        throw error;
    }
};

module.exports = {
    createPG,
    getAllPGs,
    getPGById,
    getPGStats,
    updatePG,
    deletePG,
    togglePGStatus
};