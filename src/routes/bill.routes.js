const express = require("express");
const router = express.Router();

const billController = require("../controllers/bill.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

// Configure multer for multiple files
const uploadFields = upload.fields([
    { name: 'meterImage', maxCount: 1 },
    { name: 'paymentQr', maxCount: 1 }
]);

// All routes require authentication
router.use(authMiddleware);

// Routes
router.post(
    "/",
    roleMiddleware("super_admin", "admin"),
    uploadFields,
    billController.createBill
);

router.get(
    "/unpaid-tenants",
    roleMiddleware("super_admin", "admin"),
    billController.getUnpaidTenants
);

router.get(
    "/stats",
    roleMiddleware("super_admin", "admin"),
    billController.getBillStats
);

router.get(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    billController.getBillById
);

router.get(
    "/tenant/:tenantId",
    roleMiddleware("super_admin", "admin"),
    billController.getBillsByTenant
);

router.post(
    "/process-delayed",
    roleMiddleware("super_admin", "admin"),
    billController.processDelayedPayments
);

module.exports = router;