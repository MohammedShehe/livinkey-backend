const express = require("express");
const router = express.Router();

// FIXED: Import each controller properly
const tenantController = require("../controllers/tenant.controller");
const tenantAuthController = require("../controllers/tenant.auth.controller");
const tenantProfileController = require("../controllers/tenant.profile.controller");
const { getTenantHomeData } = require("../controllers/tenant.home.controller");
const authMiddleware = require("../middleware/auth.middleware");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const upload = require("../middleware/upload.middleware");

// ============ TENANT AUTH ROUTES (Public) ============
router.post("/auth/login", tenantAuthController.login);
router.post("/auth/change-password", tenantAuthController.changePassword);
router.post("/auth/forgot-password", tenantAuthController.forgotPassword);
router.post("/auth/verify-otp", tenantAuthController.verifyOTP);
router.post("/auth/reset-password", tenantAuthController.resetPassword);

// ============ TENANT HOME ROUTE (Protected) ============
router.get("/home", tenantAuthMiddleware, getTenantHomeData);

// ============ TENANT PROFILE ROUTES (Protected) ============
router.get("/profile", tenantAuthMiddleware, tenantProfileController.getProfile);

// ============ ADMIN ROUTES ============
const uploadFields = upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'otherDocuments', maxCount: 5 }
]);

// All admin routes require authentication and admin role
router.use(authMiddleware);

// CREATE TENANT - Requires tenants.add permission
router.post(
    "/",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "add"),
    uploadFields,
    tenantController.createTenant
);

// GET ALL TENANTS - Requires tenants.view permission
router.get(
    "/",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "view"),
    tenantController.getAllTenants
);

// GET TENANT STATS - Requires tenants.view permission
router.get(
    "/stats",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "view"),
    tenantController.getTenantStats
);

// GET GUEST STATS - Requires tenants.view permission (guests are part of tenants)
router.get(
    "/stats/guests",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "view"),
    tenantController.getGuestStats
);

// GET E-FRRO STATS - Requires tenants.view permission
router.get(
    "/stats/efrro",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "view"),
    tenantController.getEFRROStats
);

// GET E-FRRO EXPIRING LIST - Requires tenants.view permission
router.get(
    "/efrro/expiring",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "view"),
    tenantController.getEFRROExpiringList
);

// GET TENANT BY ID - Requires tenants.view permission
router.get(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "view"),
    tenantController.getTenantById
);

// UPDATE TENANT - Requires tenants.edit permission
router.put(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "edit"),
    uploadFields,
    tenantController.updateTenant
);

// DELETE TENANT - Requires tenants.delete permission
router.delete(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "delete"),
    tenantController.deleteTenant
);

// SEND MESSAGE TO GUEST - Requires tenants.edit permission (sending messages is an edit action)
router.post(
    "/:id/send-message",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "edit"),
    tenantController.sendMessage
);

// CHECK E-FRRO EXPIRY - Requires tenants.view permission
router.post(
    "/check-efrro-expiry",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("tenants", "view"),
    async (req, res) => {
        try {
            // Import tenantService here to avoid circular dependency
            const tenantService = require("../services/tenant.service");
            const result = await tenantService.checkAndSendEFRROExpiryNotifications();
            
            return res.status(200).json({
                success: true,
                message: "e-FRRO expiry notifications processed successfully",
                data: result
            });
        } catch (error) {
            console.error("e-FRRO expiry check error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }
);

module.exports = router;