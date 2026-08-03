const express = require("express");
const router = express.Router();

const tenantController = require("../controllers/tenant.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

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

module.exports = router;