const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

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

// ============================================================
// FIX: None of the routes below previously checked the "bills"
// permission — only roleMiddleware("super_admin","admin"), which any
// admin account satisfies regardless of what an actual super admin
// granted them. That meant an admin with zero "bills" permissions
// could still generate payment links (which emails the tenant) and
// view/download any tenant's full payment history and receipts.
// Every other bills-related mutation in the app is correctly gated
// by the "bills" permission; these routes are brought in line with
// that same model.
// ============================================================

// Generate payment link for a bill
router.post(
    "/generate/:id",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "edit"),
    paymentController.generatePaymentLink
);

// Get payment status
router.get(
    "/status/:transactionId",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    paymentController.getPaymentStatus
);

// Get payment history for a tenant
router.get(
    "/history/:tenantId",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    paymentController.getPaymentHistory
);

// View payment receipt (admin — any tenant's payment)
router.get(
    "/receipt/:type/:paymentId",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    paymentController.getReceiptAdmin
);

// Download payment receipt (admin — any tenant's payment)
router.get(
    "/receipt/:type/:paymentId/download",
    roleMiddleware("super_admin", "admin"),
    permissionMiddleware("bills", "view"),
    paymentController.downloadReceiptAdmin
);

module.exports = router;