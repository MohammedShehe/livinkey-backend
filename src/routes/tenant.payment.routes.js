const express = require("express");
const userActivity = require("../middleware/user.activity.middleware");
const activityAudit = require("../middleware/activity.audit.middleware");
const router = express.Router();

const tenantPaymentController = require("../controllers/tenant.payment.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const upload = require("../middleware/upload.middleware");

// All routes require tenant authentication
router.use(tenantAuthMiddleware);
router.use(userActivity);

// Get current bill details
router.get("/bill", tenantPaymentController.getBillDetails);

// Generate an amount-specific UPI QR/deep link for a partial payment
router.post("/partial-qr", tenantPaymentController.generatePartialPaymentQR);

// Submit payment proof
router.post(
    "/proof",
    upload.single('payment_screenshot'),
    tenantPaymentController.submitPaymentProof
);

// Get payment history
router.get("/history", tenantPaymentController.getPaymentHistory);

// View payment receipt (opens in browser)
router.get("/receipt/:type/:paymentId", tenantPaymentController.getPaymentReceipt);

// Download payment receipt
router.get("/receipt/:type/:paymentId/download", tenantPaymentController.downloadPaymentReceipt);

module.exports = router;