const express = require("express");
const router = express.Router();

const tenantPaymentController = require("../controllers/tenant.payment.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const upload = require("../middleware/upload.middleware");

// All routes require tenant authentication
router.use(tenantAuthMiddleware);

// Get current bill details
router.get("/bill", tenantPaymentController.getBillDetails);

// Submit payment proof
router.post(
    "/proof",
    upload.single('payment_screenshot'),
    tenantPaymentController.submitPaymentProof
);

// Get payment history
router.get("/history", tenantPaymentController.getPaymentHistory);

module.exports = router;