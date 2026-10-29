/**
 * Webhook Routes (Twilio)
 * Public endpoints, authenticated by the Twilio request signature
 */

const express = require("express");
const router = express.Router();
const verifyTwilio = require("../middleware/twilio.signature");
const webhookController = require("../controllers/whatsapp.webhook.controller");

// Incoming WhatsApp messages
router.post("/twilio/whatsapp", verifyTwilio, webhookController.handleIncomingMessage);

// Delivery status callbacks
router.post("/twilio/status", verifyTwilio, webhookController.handleStatusCallback);

module.exports = router;
