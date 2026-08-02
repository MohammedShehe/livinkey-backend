const express = require("express");
const router = express.Router();
const multer = require("multer");

const pgController = require("../controllers/pg.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

// Configure multer for multiple files
const uploadFields = upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'paymentQr', maxCount: 1 }
]);

// All routes require authentication
router.use(authMiddleware);

// Routes
router.post(
    "/",
    roleMiddleware("super_admin", "admin"),
    uploadFields,
    pgController.createPG
);

router.get(
    "/",
    roleMiddleware("super_admin", "admin"),
    pgController.getAllPGs
);

router.get(
    "/stats",
    roleMiddleware("super_admin", "admin"),
    pgController.getPGStats
);

router.get(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    pgController.getPGById
);

router.put(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    uploadFields,
    pgController.updatePG
);

router.delete(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    pgController.deletePG
);

router.patch(
    "/:id/status",
    roleMiddleware("super_admin", "admin"),
    pgController.togglePGStatus
);

module.exports = router;