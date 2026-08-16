const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// ============================================================
// Webhook route — MUST be registered BEFORE `router.use(authMiddleware)`.
//
// FIX: This was previously declared AFTER `router.use(authMiddleware)`,
// which in Express applies to every route registered after it on this
// router. That meant incoming webhook calls from Razorpay/Cashfree
// (server-to-server, no admin JWT) were being rejected with 401 by
// authMiddleware before ever reaching the handler. Payment gateway
// webhooks can't carry an admin Bearer token, so this route must stay
// unauthenticated (the gateway payload itself is the source of trust,
// verified via signature checks inside the service layer).
// ============================================================
router.post(
    "/webhook/:gateway",
    paymentController.handleWebhook
);

// All routes below require authenticated admin access
router.use(authMiddleware);

// Generate payment link for a bill
router.post(
    "/generate/:id",
    roleMiddleware("super_admin", "admin"),
    paymentController.generatePaymentLink
);

// Get payment status
router.get(
    "/status/:transactionId",
    roleMiddleware("super_admin", "admin"),
    paymentController.getPaymentStatus
);

// Get payment history for a tenant
router.get(
    "/history/:tenantId",
    roleMiddleware("super_admin", "admin"),
    paymentController.getPaymentHistory
);

// View payment receipt (admin — any tenant's payment)
router.get(
    "/receipt/:type/:paymentId",
    roleMiddleware("super_admin", "admin"),
    paymentController.getReceiptAdmin
);

// Download payment receipt (admin — any tenant's payment)
router.get(
    "/receipt/:type/:paymentId/download",
    roleMiddleware("super_admin", "admin"),
    paymentController.downloadReceiptAdmin
);

module.exports = router;