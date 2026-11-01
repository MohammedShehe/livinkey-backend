const express = require("express");
const activityAudit = require("../middleware/activity.audit.middleware");
const router = express.Router();

const pgController = require("../controllers/pg.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const upload = require("../middleware/upload.middleware");
const offerController = require("../controllers/pg.offer.controller");

// Configure multer for multiple files
const uploadFields = upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'paymentQr', maxCount: 1 }
]);

// All routes require authentication
router.use(authMiddleware);
router.use(activityAudit);

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

// ---------------- OFFERS (super admin / admins with PG edit access) ----------------
router.get("/offers/all", roleMiddleware("super_admin", "admin"), permissionMiddleware("pgs", "view"), offerController.listAll);
router.get("/:id/offers", roleMiddleware("super_admin", "admin"), permissionMiddleware("pgs", "view"), offerController.list);
router.post("/:id/offers", roleMiddleware("super_admin", "admin"), permissionMiddleware("pgs", "edit"), offerController.create);
router.put("/:id/offers/:offerId", roleMiddleware("super_admin", "admin"), permissionMiddleware("pgs", "edit"), offerController.update);
router.patch("/:id/offers/:offerId/toggle", roleMiddleware("super_admin", "admin"), permissionMiddleware("pgs", "edit"), offerController.toggle);
router.delete("/:id/offers/:offerId", roleMiddleware("super_admin", "admin"), permissionMiddleware("pgs", "edit"), offerController.remove);

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