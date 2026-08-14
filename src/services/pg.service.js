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

    try {
        await connection.beginTransaction();

        // Check for duplicate PG name
        const existingPG = await PGModel.findByName(pgData.name);
        if (existingPG) {
            throw new Error(`PG with name "${pgData.name}" already exists`);
        }

        // 1. Upload Payment QR if provided
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
            }
        }

        // 2. Create PG
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

        // 3. Add Amenities
        const amenities = pgData.amenities || [];
        for (const amenity of amenities) {
            await PGModel.createAmenity(
                connection,
                pgId,
                amenity.name,
                amenity.is_custom ? 1 : 0
            );
        }

        // 4. Upload PG Images
        const imageFiles = files.images || [];
        const uploadedImages = [];

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

                uploadedImages.push({
                    url: uploadResult.secure_url,
                    public_id: uploadResult.public_id
                });
            }
        }

        // 5. Create Floors and Rooms
        const floors = pgData.floors || [];
        for (const floorData of floors) {
            const floorId = await PGModel.createFloor(
                connection,
                pgId,
                parseInt(floorData.floor_number)
            );

            // Create rooms for this floor
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

        // Get the complete PG data
        createdPG = await PGModel.getPGWithDetails(pgId);

        // Send PG creation notification to admins
        try {
            await NotificationEventManager.onPGCreated(createdPG);
        } catch (notifError) {
            console.error("Failed to send PG notification:", notifError);
        }

        // Send PG creation notification to guests (NEW)
        try {
            await NotificationEventManager.onGuestPGAdded(createdPG);
        } catch (notifError) {
            console.error("Failed to send PG added notification to guests:", notifError);
        }

        return createdPG;

    } catch (error) {
        await connection.rollback();

        // Clean up any uploaded files if transaction fails
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

const updatePG = async (pgId, pgData, files = {}) => {
    const connection = await db.getConnection();
    let updatedPG = null;

    try {
        await connection.beginTransaction();

        // Get existing PG data
        const existingPG = await PGModel.findById(pgId);
        if (!existingPG) {
            throw new Error("PG not found");
        }

        // Check for duplicate PG name (excluding current PG)
        const duplicatePG = await PGModel.findByName(pgData.name, pgId);
        if (duplicatePG) {
            throw new Error(`PG with name "${pgData.name}" already exists`);
        }

        // 1. Handle Payment QR update
        let paymentQr = existingPG.payment_qr;
        let paymentQrPublicId = existingPG.payment_qr_public_id;
        let paymentQrResourceType = existingPG.payment_qr_resource_type;

        if (files.paymentQr && files.paymentQr.length > 0) {
            // Delete old QR if exists
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
            // Remove QR if requested
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

        // 2. Update PG
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

        // 3. Update Amenities (delete and recreate)
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

        // 4. Update Images (delete and recreate) - Only if new images are provided
        if (files.images && files.images.length > 0) {
            // Delete old images from Cloudinary first
            const oldImages = await PGModel.getImagesByPGId(pgId);
            for (const image of oldImages) {
                try {
                    await deleteFile(image.public_id, image.resource_type);
                } catch (error) {
                    console.error("Failed to delete old image:", error);
                }
            }
            await PGModel.deleteImagesByPGId(connection, pgId);

            // Upload new images
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

        // 5. Update Floors and Rooms (delete and recreate)
        await PGModel.deleteFloorsByPGId(connection, pgId);
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

        // Get the updated PG data
        updatedPG = await PGModel.getPGWithDetails(pgId);

        // Send PG update notification to admins
        try {
            await NotificationEventManager.onPGUpdated(updatedPG);
        } catch (notifError) {
            console.error("Failed to send PG update notification:", notifError);
        }

        // Send PG update notification to guests (NEW)
        try {
            await NotificationEventManager.onGuestPGUpdated(updatedPG);
        } catch (notifError) {
            console.error("Failed to send PG updated notification to guests:", notifError);
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

const deletePG = async (pgId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get PG data for file cleanup
        const pg = await PGModel.findById(pgId);
        if (!pg) {
            throw new Error("PG not found");
        }

        // Delete QR from Cloudinary
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

        // Delete images from Cloudinary
        const images = await PGModel.getImagesByPGId(pgId);
        for (const image of images) {
            try {
                await deleteFile(image.public_id, image.resource_type);
            } catch (error) {
                console.error("Failed to delete image:", error);
            }
        }

        // Delete PG from database (cascades to all related tables)
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
            // Get the PG details for notification
            const pg = await PGModel.findById(pgId);
            if (pg) {
                // Send status change notification to admins
                try {
                    await NotificationEventManager.onPGStatusChanged(pg, isActive === 1);
                } catch (notifError) {
                    console.error("Failed to send PG status notification:", notifError);
                }

                // If PG is activated, send notification to guests (NEW)
                if (isActive === 1) {
                    try {
                        await NotificationEventManager.onGuestPGAdded(pg);
                    } catch (notifError) {
                        console.error("Failed to send PG activation notification to guests:", notifError);
                    }
                }

                // Check for vacant rooms and notify guests (NEW)
                try {
                    const floors = await PGModel.getFloorsByPGId(pgId);
                    for (const floor of floors) {
                        const rooms = await PGModel.getRoomsByFloorId(floor.id);
                        for (const room of rooms) {
                            if (room.occupied_count < room.capacity) {
                                await NotificationEventManager.onGuestRoomVacant(room, pg.name);
                            }
                        }
                    }
                } catch (notifError) {
                    console.error("Failed to send vacant room notifications to guests:", notifError);
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