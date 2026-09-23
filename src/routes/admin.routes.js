const express = require("express");
const activityAudit = require("../middleware/activity.audit.middleware");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

// Admin dashboard with greeting (Protected)
router.get(
    "/dashboard",
    authMiddleware,
    activityAudit,
    roleMiddleware("super_admin", "admin"),
    adminController.getAdminDashboard
);

router.post(
    "/",
    authMiddleware,
    activityAudit,
    roleMiddleware("super_admin"),
    upload.single("id_document"),
    adminController.createAdmin
);

router.get(
    "/",
    authMiddleware,
    activityAudit,
    roleMiddleware("super_admin"),
    adminController.getAllAdmins
);

router.put(
    "/:id/permissions",
    authMiddleware,
    activityAudit,
    roleMiddleware("super_admin"),
    adminController.updatePermissions
);

router.get(
    "/:id",
    authMiddleware,
    activityAudit,
    roleMiddleware("super_admin"),
    adminController.getAdmin
);

router.put(
    "/:id",
    authMiddleware,
    activityAudit,
    roleMiddleware("super_admin"),
    upload.single("id_document"),
    adminController.updateAdmin
);

router.delete(
    "/:id",
    authMiddleware,
    activityAudit,
    roleMiddleware("super_admin"),
    adminController.deleteAdmin
);

module.exports = router;