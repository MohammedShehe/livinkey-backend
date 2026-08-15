const express = require("express");
const router = express.Router();

const pgController = require("../controllers/pg.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const upload = require("../middleware/upload.middleware");

// Configure multer for multiple files
const uploadFields = upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'paymentQr', maxCount: 1 }
]);

// All routes require authentication
router.use(authMiddleware);

// CREATE PG - Requires pgs.add permission
router.post(
    "/",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("pgs", "add"),
    uploadFields,
    pgController.createPG
);

// GET ALL PGs - Requires pgs.view permission
router.get(
    "/",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("pgs", "view"),
    pgController.getAllPGs
);

// GET PG STATS - Requires pgs.view permission
router.get(
    "/stats",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("pgs", "view"),
    pgController.getPGStats
);

// GET PG BY ID - Requires pgs.view permission
router.get(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("pgs", "view"),
    pgController.getPGById
);

// UPDATE PG - Requires pgs.edit permission
router.put(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("pgs", "edit"),
    uploadFields,
    pgController.updatePG
);

// DELETE PG - Requires pgs.delete permission
router.delete(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("pgs", "delete"),
    pgController.deletePG
);

// TOGGLE PG STATUS - Requires pgs.edit permission
router.patch(
    "/:id/status",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("pgs", "edit"),
    pgController.togglePGStatus
);

module.exports = router;