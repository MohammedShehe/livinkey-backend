/**
 * WhatsApp Webhook Controller (Twilio)
 * Handles incoming messages + status callbacks
 */

const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const messagingService = require("../services/messaging.service");

/**
 * POST /api/webhooks/twilio/whatsapp
 * Incoming message from user
 */
exports.handleIncomingMessage = async (req, res) => {
  try {
    // Twilio sends form-urlencoded
    const {
      From,           // whatsapp:+9198xxxxxxxx
      To,
      Body,
      MessageSid,
      NumMedia,
      MediaUrl0,
      ProfileName,
    } = req.body;

    console.log("Incoming WhatsApp:", { From, Body, MessageSid });

    // Normalize phone (remove whatsapp: prefix)
    const phone = From ? From.replace("whatsapp:", "") : null;

    if (!phone) {
      return res.status(200).send("OK"); // Always return 200 to Twilio
    }

    // Try to find existing conversation by phone
    let conversation = await Conversation.findOne({
      where: { phone },
    });

    // If not found, create a new one (unknown user)
    if (!conversation) {
      conversation = await Conversation.create({
        user_id: 0, // unknown
        user_type: "tenant",
        phone,
        name: ProfileName || phone,
        last_message_at: new Date(),
        unread_count: 1,
      });
    } else {
      await Conversation.update(conversation.id, {
        last_message_at: new Date(),
        unread_count: conversation.unread_count + 1,
        name: ProfileName || conversation.name,
      });
    }

    // Save inbound message
    await Message.create({
      conversation_id: conversation.id,
      direction: "inbound",
      channel: "whatsapp",
      message_type: NumMedia && parseInt(NumMedia) > 0 ? "media" : "text",
      content: Body || "",
      media_url: MediaUrl0 || null,
      status: "received",
      external_id: MessageSid,
      metadata: {
        profileName: ProfileName,
        raw: req.body,
      },
    });

    // Optional: Auto-reply
    if (process.env.WHATSAPP_AUTO_REPLY === "true") {
      try {
        await messagingService.sendMessage({
          userId: conversation.user_id,
          userType: conversation.user_type,
          phone: conversation.phone,
          name: conversation.name,
          type: "text",
          body: process.env.WHATSAPP_AUTO_REPLY_TEXT || "Thank you for your message. Our team will get back to you shortly.",
        });
      } catch (autoReplyErr) {
        console.error("Auto-reply failed:", autoReplyErr.message);
      }
    }

    // Always respond 200 to Twilio
    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 so Twilio doesn't retry aggressively
    res.status(200).send("OK");
  }
};

/**
 * POST /api/webhooks/twilio/status
 * Delivery status callback
 */
exports.handleStatusCallback = async (req, res) => {
  try {
    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = req.body;

    if (MessageSid) {
      const message = await Message.findOne({ external_id: MessageSid });

      if (message) {
        let status = MessageStatus;
        // Map Twilio statuses
        if (["queued", "accepted", "sending"].includes(MessageStatus)) status = "queued";
        if (MessageStatus === "sent") status = "sent";
        if (MessageStatus === "delivered") status = "delivered";
        if (MessageStatus === "read") status = "read";
        if (["failed", "undelivered"].includes(MessageStatus)) status = "failed";

        await message.update({
          status,
          metadata: {
            ...message.metadata,
            statusCallback: {
              status: MessageStatus,
              errorCode: ErrorCode,
              errorMessage: ErrorMessage,
              receivedAt: new Date(),
            },
          },
        });
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Status callback error:", error);
    res.status(200).send("OK");
  }
};
