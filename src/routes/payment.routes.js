const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// All routes require authentication
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

// Webhook routes (no authentication needed)
router.post(
    "/webhook/:gateway",
    paymentController.handleWebhook
);

module.exports = router;