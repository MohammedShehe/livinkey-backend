const express = require("express");
const router = express.Router();

const billController = require("../controllers/bill.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const upload = require("../middleware/upload.middleware");

const uploadFields = upload.fields([
    { name: 'meterImage', maxCount: 1 },
    { name: 'paymentQr', maxCount: 1 },
    { name: 'adminQr', maxCount: 1 }
]);

router.use(authMiddleware);

// CREATE BILL - Requires bills.add permission
router.post(
    "/",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "add"),
    uploadFields,
    billController.createBill
);

// GET UNPAID TENANTS - Requires bills.view permission
router.get(
    "/unpaid-tenants",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getUnpaidTenants
);

// GET BILL STATS - Requires bills.view permission
router.get(
    "/stats",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getBillStats
);

// GET ALL BILLS - Requires bills.view permission
router.get(
    "/",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getBills
);

// GET CASH PAYMENTS - Requires bills.view permission
router.get(
    "/cash-payments",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getCashPayments
);

// GET BILL BY ID - Requires bills.view permission
router.get(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getBillById
);

// GET BILLS BY TENANT - Requires bills.view permission
router.get(
    "/tenant/:tenantId",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getBillsByTenant
);

// PROCESS DELAYED PAYMENTS - Requires bills.edit permission
router.post(
    "/process-delayed",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    billController.processDelayedPayments
);

// ADD PAYMENT - Requires bills.edit permission
router.post(
    "/:id/payment",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    billController.addPayment
);

// SEND CUSTOM MESSAGE - Requires bills.edit permission
router.post(
    "/:id/send-message",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    upload.fields([{ name: 'adminQr', maxCount: 1 }]),
    billController.sendCustomMessage
);

// REQUEST CASH PAYMENT OTP - Requires bills.edit permission
router.post(
    "/:id/cash-payment/request-otp",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    billController.requestCashPaymentOTP
);

// VERIFY CASH PAYMENT - Requires bills.edit permission
router.post(
    "/:id/cash-payment/verify",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    billController.verifyCashPayment
);

module.exports = router;