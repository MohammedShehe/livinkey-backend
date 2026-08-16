const express = require("express");
const router = express.Router();

const billController = require("../controllers/bill.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const upload = require("../middleware/upload.middleware");

// ============================================
// ADMIN PAYMENT PROOFS CONTROLLER
// ============================================
const adminPaymentProofController = require("../controllers/admin.payment.proof.controller");

const uploadFields = upload.fields([
    { name: 'meterImage', maxCount: 1 },
    { name: 'paymentQr', maxCount: 1 },
    { name: 'adminQr', maxCount: 1 }
]);

router.use(authMiddleware);

// ============================================
// ADMIN PAYMENT PROOFS ROUTES
// FIX: These literal-path routes (/payment-proofs, /payment-proofs/stats,
// /payment-proofs/:id, etc.) MUST be registered before the generic
// "/:id" bill route below. Express matches routes in registration
// order, and "/bills/payment-proofs" has exactly one path segment
// after "/bills" — the same shape as "/bills/:id". With the old
// ordering, "/:id" was registered first, so GET /bills/payment-proofs
// was being captured by billController.getBillById with id set to the
// literal string "payment-proofs", which obviously matches no bill and
// returns 404 "Bill not found". Moving these routes above the bill
// CRUD routes below fixes that collision permanently.
// ============================================

// GET PAYMENT PROOF STATS - Requires bills.view permission
router.get(
    "/payment-proofs/stats",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    adminPaymentProofController.getPaymentProofStats
);

// GET ALL PAYMENT PROOFS - Requires bills.view permission
router.get(
    "/payment-proofs",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    adminPaymentProofController.getPaymentProofs
);

// GET PAYMENT PROOF BY ID - Requires bills.view permission
router.get(
    "/payment-proofs/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    adminPaymentProofController.getPaymentProofById
);

// VERIFY PAYMENT PROOF - Requires bills.edit permission
router.put(
    "/payment-proofs/:id/verify",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    adminPaymentProofController.verifyPaymentProof
);

// REJECT PAYMENT PROOF - Requires bills.edit permission
router.put(
    "/payment-proofs/:id/reject",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    adminPaymentProofController.rejectPaymentProof
);

// DELETE PAYMENT PROOF - Requires bills.delete permission
router.delete(
    "/payment-proofs/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "delete"),
    adminPaymentProofController.deletePaymentProof
);

// ============================================
// BILL CRUD ROUTES
// ============================================

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
// FIX: This wildcard route now comes AFTER all literal "/payment-proofs*"
// routes above, so it can no longer swallow those requests.
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