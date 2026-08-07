const express = require("express");
const router = express.Router();

const tenantController = require("../controllers/tenant.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");
const tenantService = require("../services/tenant.service");

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

// NEW: Endpoint to manually trigger e-FRRO expiry notifications
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