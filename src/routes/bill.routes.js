const express = require("express");
const router = express.Router();

const billController = require("../controllers/bill.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const uploadFields = upload.fields([
    { name: 'meterImage', maxCount: 1 },
    { name: 'paymentQr', maxCount: 1 },
    { name: 'adminQr', maxCount: 1 }
]);

router.use(authMiddleware);

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
    "/",
    roleMiddleware("super_admin", "admin"),
    billController.getBills
);

router.get(
    "/cash-payments",
    roleMiddleware("super_admin", "admin"),
    billController.getCashPayments
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

router.post(
    "/:id/payment",
    roleMiddleware("super_admin", "admin"),
    billController.addPayment
);

router.post(
    "/:id/send-message",
    roleMiddleware("super_admin", "admin"),
    upload.fields([{ name: 'adminQr', maxCount: 1 }]),
    billController.sendCustomMessage
);

// Cash Payment Routes
router.post(
    "/:id/cash-payment/request-otp",
    roleMiddleware("super_admin", "admin"),
    billController.requestCashPaymentOTP
);

router.post(
    "/:id/cash-payment/verify",
    roleMiddleware("super_admin", "admin"),
    billController.verifyCashPayment
);

module.exports = router;