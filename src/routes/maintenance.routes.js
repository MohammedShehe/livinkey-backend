const express = require("express");
const router = express.Router();

const maintenanceController = require("../controllers/maintenance.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

// ============ TENANT ROUTES (Protected) ============
router.use(tenantAuthMiddleware);

// Create maintenance request
router.post(
    "/request",
    upload.single('image'),
    maintenanceController.createRequest
);

// Get my requests
router.get("/my-requests", maintenanceController.getMyRequests);

// Get my stats
router.get("/my-stats", maintenanceController.getMyStats);

// ============ ADMIN ROUTES (Protected) ============
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware("super_admin", "admin"));

// Get all requests with filters
adminRouter.get("/admin/all", maintenanceController.getAllRequestsAdmin);

// Get admin stats
adminRouter.get("/admin/stats", maintenanceController.getAdminStats);

// Get request by ID
adminRouter.get("/admin/:id", maintenanceController.getRequestByIdAdmin);

// Start request
adminRouter.put("/admin/:id/start", maintenanceController.startRequest);

// Complete request
adminRouter.put("/admin/:id/complete", maintenanceController.completeRequest);

// Delete request
adminRouter.delete("/admin/:id", maintenanceController.deleteRequestAdmin);

// Mount admin routes
router.use(adminRouter);

module.exports = router;