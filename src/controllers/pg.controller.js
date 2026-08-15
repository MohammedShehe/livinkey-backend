const pgService = require("../services/pg.service");

// =============================================
// PG Controller - Request/Response Handling
// =============================================

const createPG = async (req, res) => {
    try {
        const {
            name,
            location,
            number_of_floors,
            rent,
            security_fee,
            amenities,
            floors
        } = req.body;

        // Validation
        if (!name || !location || !number_of_floors) {
            return res.status(400).json({
                success: false,
                message: "Name, location and number_of_floors are required."
            });
        }

        // Validate rent
        if (!rent || rent <= 0) {
            return res.status(400).json({
                success: false,
                message: "Rent is required and must be greater than 0."
            });
        }

        // Parse JSON fields if they come as strings
        let parsedAmenities = amenities;
        let parsedFloors = floors;

        if (typeof amenities === 'string') {
            try {
                parsedAmenities = JSON.parse(amenities);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid amenities format"
                });
            }
        }

        if (typeof floors === 'string') {
            try {
                parsedFloors = JSON.parse(floors);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid floors format"
                });
            }
        }

        // ============================================
        // FIX: Validate floors and rooms properly
        // ============================================
        if (!parsedFloors || !Array.isArray(parsedFloors) || parsedFloors.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one floor is required"
            });
        }

        // Track empty floors for better error message
        let emptyFloorFound = false;
        let emptyFloorNumber = null;

        for (const floor of parsedFloors) {
            // Check if floor has floor_number
            if (!floor.floor_number && floor.floor_number !== 0) {
                return res.status(400).json({
                    success: false,
                    message: "Each floor must have a floor_number"
                });
            }

            // Check if floor has rooms
            if (!floor.rooms || !Array.isArray(floor.rooms) || floor.rooms.length === 0) {
                emptyFloorFound = true;
                emptyFloorNumber = floor.floor_number || 'unknown';
                break;
            }

            // Validate each room
            for (const room of floor.rooms) {
                if (!room.room_number) {
                    return res.status(400).json({
                        success: false,
                        message: `Room on floor ${floor.floor_number} is missing a room_number`
                    });
                }
                if (!room.capacity || room.capacity < 1) {
                    return res.status(400).json({
                        success: false,
                        message: `Room ${room.room_number} on floor ${floor.floor_number} must have a capacity of at least 1`
                    });
                }
            }
        }

        if (emptyFloorFound) {
            return res.status(400).json({
                success: false,
                message: `Floor ${emptyFloorNumber} must have at least one room`
            });
        }

        // Prepare data for service
        const pgData = {
            name,
            location,
            number_of_floors: parseInt(number_of_floors),
            rent: parseFloat(rent),
            security_fee: parseFloat(security_fee) || 0,
            amenities: parsedAmenities || [],
            floors: parsedFloors,
            created_by: req.admin.id
        };

        // Prepare files
        const files = {
            images: req.files?.images || [],
            paymentQr: req.files?.paymentQr || []
        };

        // Limit images to 5
        if (files.images.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Maximum 5 images allowed"
            });
        }

        const pg = await pgService.createPG(pgData, files);

        return res.status(201).json({
            success: true,
            message: "PG created successfully",
            data: pg
        });

    } catch (error) {
        console.error("Create PG Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const getAllPGs = async (req, res) => {
    try {
        const { search, is_active } = req.query;
        const isActive = is_active !== undefined ? parseInt(is_active) : null;

        const pgs = await pgService.getAllPGs(search, isActive);

        return res.status(200).json({
            success: true,
            count: pgs.length,
            data: pgs
        });

    } catch (error) {
        console.error("Get All PGs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getPGStats = async (req, res) => {
    try {
        const stats = await pgService.getPGStats();

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("Get PG Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getPGById = async (req, res) => {
    try {
        const { id } = req.params;

        const pg = await pgService.getPGById(id);

        if (!pg) {
            return res.status(404).json({
                success: false,
                message: "PG not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: pg
        });

    } catch (error) {
        console.error("Get PG By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updatePG = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            location,
            number_of_floors,
            rent,
            security_fee,
            amenities,
            floors,
            remove_qr
        } = req.body;

        // Validation
        if (!name || !location || !number_of_floors) {
            return res.status(400).json({
                success: false,
                message: "Name, location and number_of_floors are required."
            });
        }

        // Validate rent
        if (!rent || rent <= 0) {
            return res.status(400).json({
                success: false,
                message: "Rent is required and must be greater than 0."
            });
        }

        // Parse JSON fields if they come as strings
        let parsedAmenities = amenities;
        let parsedFloors = floors;

        if (typeof amenities === 'string') {
            try {
                parsedAmenities = JSON.parse(amenities);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid amenities format"
                });
            }
        }

        if (typeof floors === 'string') {
            try {
                parsedFloors = JSON.parse(floors);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid floors format"
                });
            }
        }

        // Validate floors and rooms
        if (!parsedFloors || !Array.isArray(parsedFloors) || parsedFloors.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one floor is required"
            });
        }

        for (const floor of parsedFloors) {
            if (!floor.floor_number) {
                return res.status(400).json({
                    success: false,
                    message: "Each floor must have a floor_number"
                });
            }
            if (!floor.rooms || !Array.isArray(floor.rooms) || floor.rooms.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Floor ${floor.floor_number} must have at least one room`
                });
            }
            for (const room of floor.rooms) {
                if (!room.room_number || !room.capacity) {
                    return res.status(400).json({
                        success: false,
                        message: "Each room must have a room_number and capacity"
                    });
                }
            }
        }

        // Prepare data for service
        const pgData = {
            name,
            location,
            number_of_floors: parseInt(number_of_floors),
            rent: parseFloat(rent),
            security_fee: parseFloat(security_fee) || 0,
            amenities: parsedAmenities || [],
            floors: parsedFloors,
            remove_qr: remove_qr === true || remove_qr === 'true'
        };

        // Prepare files
        const files = {
            images: req.files?.images || [],
            paymentQr: req.files?.paymentQr || []
        };

        // Limit images to 5
        if (files.images.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Maximum 5 images allowed"
            });
        }

        const pg = await pgService.updatePG(id, pgData, files);

        return res.status(200).json({
            success: true,
            message: "PG updated successfully",
            data: pg
        });

    } catch (error) {
        console.error("Update PG Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const deletePG = async (req, res) => {
    try {
        const { id } = req.params;

        await pgService.deletePG(id);

        return res.status(200).json({
            success: true,
            message: "PG deleted successfully"
        });

    } catch (error) {
        console.error("Delete PG Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

const togglePGStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined) {
            return res.status(400).json({
                success: false,
                message: "is_active is required"
            });
        }

        const result = await pgService.togglePGStatus(id, parseInt(is_active));

        if (result === 0) {
            return res.status(404).json({
                success: false,
                message: "PG not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: `PG ${is_active ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error("Toggle PG Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createPG,
    getAllPGs,
    getPGStats,
    getPGById,
    updatePG,
    deletePG,
    togglePGStatus
};