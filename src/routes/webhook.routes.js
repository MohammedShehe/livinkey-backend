/**
 * Webhook Routes (Twilio)
 * These should be public (no auth) but you can add signature validation
 */

const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/whatsapp.webhook.controller");

// Incoming WhatsApp messages
router.post("/twilio/whatsapp", webhookController.handleIncomingMessage);

// Delivery status callbacks
router.post("/twilio/status", webhookController.handleStatusCallback);

module.exports = router;
