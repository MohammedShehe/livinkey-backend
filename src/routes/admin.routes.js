const express = require("express");
const activityAudit = require("../middleware/activity.audit.middleware");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");
const overviewController = require("../controllers/admin.overview.controller");

// Admin dashboard with greeting (Protected)
router.get(
    "/dashboard",
    authMiddleware,
    activityAudit,
    roleMiddleware("super_admin", "admin"),
    adminController.getAdminDashboard
);

// Monitoring endpoints (must stay above "/:id")
router.get(
    "/overview",
    authMiddleware,
    roleMiddleware("super_admin", "admin"),
    overviewController.getOverview
);

router.get(
    "/system-health",
    authMiddleware,
    roleMiddleware("super_admin"),
    overviewController.getSystemHealth
);

router.get(
    "/login-history",
    authMiddleware,
    roleMiddleware("super_admin"),
    overviewController.getLoginHistory
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