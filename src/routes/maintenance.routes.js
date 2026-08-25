const express = require("express");
const router = express.Router();

const maintenanceController = require("../controllers/maintenance.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const upload = require("../middleware/upload.middleware");

// ============ TENANT ROUTES (Protected) ============
// Tenant routes are NOT mounted under /admin, so they use tenantAuthMiddleware
// These are separate from admin routes

// Create maintenance request (tenant)
router.post(
    "/request",
    tenantAuthMiddleware,
    upload.single('image'),
    maintenanceController.createRequest
);

// Get my requests (tenant)
router.get("/my-requests", tenantAuthMiddleware, maintenanceController.getMyRequests);

// Get my stats (tenant)
router.get("/my-stats", tenantAuthMiddleware, maintenanceController.getMyStats);

// ============================================================
// NEW: Tenant completes a maintenance request
// ============================================================
router.put(
    "/:id/complete-by-tenant",
    tenantAuthMiddleware,
    maintenanceController.completeRequestByTenant
);

// ============ ADMIN ROUTES (Protected) ============
// Admin routes are mounted on a separate router to avoid tenantAuthMiddleware leak
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware("super_admin", "admin"));

// GET ALL REQUESTS - Requires maintenance.view permission
adminRouter.get(
    "/all",
    permissionMiddleware("maintenance", "view"),
    maintenanceController.getAllRequestsAdmin
);

// GET ADMIN STATS - Requires maintenance.view permission
adminRouter.get(
    "/stats",
    permissionMiddleware("maintenance", "view"),
    maintenanceController.getAdminStats
);

// GET REQUEST BY ID - Requires maintenance.view permission
adminRouter.get(
    "/:id",
    permissionMiddleware("maintenance", "view"),
    maintenanceController.getRequestByIdAdmin
);

// START REQUEST - Requires maintenance.edit permission
adminRouter.put(
    "/:id/start",
    permissionMiddleware("maintenance", "edit"),
    maintenanceController.startRequest
);

// COMPLETE REQUEST - Requires maintenance.edit permission
adminRouter.put(
    "/:id/complete",
    permissionMiddleware("maintenance", "edit"),
    maintenanceController.completeRequest
);

// DELETE REQUEST - Requires maintenance.delete permission
adminRouter.delete(
    "/:id",
    permissionMiddleware("maintenance", "delete"),
    maintenanceController.deleteRequestAdmin
);

// ============================================================
// NEW: Check for pending completion reminders (Admin only)
// This is primarily for cron jobs but also accessible via API
// ============================================================
adminRouter.post(
    "/check-reminders",
    permissionMiddleware("maintenance", "view"),
    maintenanceController.checkPendingCompletionReminders
);

// Mount admin routes under /admin
router.use("/admin", adminRouter);

module.exports = router;