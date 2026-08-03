const express = require("express");
const router = express.Router();

const tenantController = require("../controllers/tenant.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

// Configure multer for multiple files
const uploadFields = upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'otherDocuments', maxCount: 5 }
]);

// All routes require authentication
router.use(authMiddleware);

// Routes
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

module.exports = router;