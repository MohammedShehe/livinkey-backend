const express = require("express");
const router = express.Router();

const tenantController = require("../controllers/tenant.controller");
const tenantAuthController = require("../controllers/tenant.auth.controller");
const tenantProfileController = require("../controllers/tenant.profile.controller");
const authMiddleware = require("../middleware/auth.middleware");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

// ============ TENANT AUTH ROUTES (Public) ============
router.post("/auth/login", tenantAuthController.login);
router.post("/auth/change-password", tenantAuthController.changePassword);
router.post("/auth/forgot-password", tenantAuthController.forgotPassword);
router.post("/auth/verify-otp", tenantAuthController.verifyOTP);
router.post("/auth/reset-password", tenantAuthController.resetPassword);

// ============ TENANT PROFILE ROUTES (Protected) ============
router.get("/profile", tenantAuthMiddleware, tenantProfileController.getProfile);
// Note: No PUT/UPDATE or DELETE routes for tenant profile

// ============ ADMIN ROUTES (Existing) ============
const uploadFields = upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'otherDocuments', maxCount: 5 }
]);

router.use(authMiddleware);

router.post(
    "/",
    roleMiddleware("super_admin", "admin"),
    uploadFields,
    tenantController.createTenant
);

router.get(
    "/",
    roleMiddleware("super_admin", "admin"),
    tenantController.getAllTenants
);

router.get(
    "/stats",
    roleMiddleware("super_admin", "admin"),
    tenantController.getTenantStats
);

router.get(
    "/stats/guests",
    roleMiddleware("super_admin", "admin"),
    tenantController.getGuestStats
);

router.get(
    "/stats/efrro",
    roleMiddleware("super_admin", "admin"),
    tenantController.getEFRROStats
);

router.get(
    "/efrro/expiring",
    roleMiddleware("super_admin", "admin"),
    tenantController.getEFRROExpiringList
);

router.get(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    tenantController.getTenantById
);

router.put(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    uploadFields,
    tenantController.updateTenant
);

router.delete(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    tenantController.deleteTenant
);

router.post(
    "/:id/send-message",
    roleMiddleware("super_admin", "admin"),
    tenantController.sendMessage
);

router.post(
    "/check-efrro-expiry",
    roleMiddleware("super_admin"),
    async (req, res) => {
        try {
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