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
// ⚠️ IMPORTANT: Payment Proof Routes MUST come BEFORE generic /:id routes
// ============================================

// GET PAYMENT PROOF STATS
router.get(
    "/payment-proofs/stats",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    adminPaymentProofController.getPaymentProofStats
);

// GET ALL PAYMENT PROOFS
router.get(
    "/payment-proofs",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    adminPaymentProofController.getPaymentProofs
);

// GET PAYMENT PROOF BY ID
router.get(
    "/payment-proofs/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    adminPaymentProofController.getPaymentProofById
);

// ✅ VERIFY PAYMENT PROOF - NOW REQUIRES paid_from AND paid_till
router.put(
    "/payment-proofs/:id/verify",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    adminPaymentProofController.verifyPaymentProof
);

// REJECT PAYMENT PROOF
router.put(
    "/payment-proofs/:id/reject",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    adminPaymentProofController.rejectPaymentProof
);

// DELETE PAYMENT PROOF
router.delete(
    "/payment-proofs/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "delete"),
    adminPaymentProofController.deletePaymentProof
);

// ============================================
// BILL CRUD ROUTES (Now safe from being eaten by /:id)
// ============================================

// CREATE BILL
router.post(
    "/",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "add"),
    uploadFields,
    billController.createBill
);

// GET UNPAID TENANTS
router.get(
    "/unpaid-tenants",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getUnpaidTenants
);

// GET BILL STATS
router.get(
    "/stats",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getBillStats
);

// GET ALL BILLS
router.get(
    "/",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getBills
);

// GET CASH PAYMENTS
router.get(
    "/cash-payments",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getCashPayments
);

// ⚠️ GET BILL BY ID - MUST COME AFTER ALL LITERAL ROUTES
router.get(
    "/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getBillById
);

// GET BILLS BY TENANT
router.get(
    "/tenant/:tenantId",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    billController.getBillsByTenant
);

// PROCESS DELAYED PAYMENTS
router.post(
    "/process-delayed",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    billController.processDelayedPayments
);

// ✅ ADD PAYMENT - NOW REQUIRES paid_from, paid_till, AND proof
router.post(
    "/:id/payment",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    upload.single('payment_proof'), // ← Require proof upload
    billController.addPayment
);

// SEND CUSTOM MESSAGE
router.post(
    "/:id/send-message",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    upload.fields([{ name: 'adminQr', maxCount: 1 }]),
    billController.sendCustomMessage
);

// REQUEST CASH PAYMENT OTP
router.post(
    "/:id/cash-payment/request-otp",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    billController.requestCashPaymentOTP
);

// ✅ VERIFY CASH PAYMENT - NOW REQUIRES paid_from AND paid_till
router.post(
    "/:id/cash-payment/verify",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    billController.verifyCashPayment
);

module.exports = router;