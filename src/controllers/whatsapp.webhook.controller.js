/**
 * Twilio webhooks
 *   POST /api/webhooks/twilio/whatsapp  – a person wrote to our WhatsApp number
 *   POST /api/webhooks/twilio/status    – delivery receipts for every message we sent (WhatsApp + SMS)
 *
 * Both always answer 200 (Twilio retries aggressively on anything else); errors are logged.
 */

const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const messagingService = require("../services/messaging.service");
const { findUserByE164 } = require("../services/contacts.service");
const { normalizePhone, digitsOnly } = require("../utils/phone");

const stripChannel = (v) => String(v || "").replace(/^whatsapp:/i, "").trim();

/**
 * Find the conversation a phone number belongs to – creating it when needed.
 *  1. a Livinkey user owns this number -> that user's conversation
 *  2. an earlier conversation already uses this number
 *  3. a stranger: new conversation with a NEGATIVE user_id derived from the number
 *     (the (user_id, user_type) key is unique, so a shared 0 would collide on the 2nd stranger)
 */
const findOrCreateConversation = async (e164, profileName) => {
    const user = await findUserByE164(e164);
    if (user) {
        let conv = await Conversation.findOne({ user_id: user.userId, user_type: user.userType });
        if (!conv) {
            conv = await Conversation.create({
                user_id: user.userId, user_type: user.userType, phone: e164, email: user.email || null,
                name: user.name || profileName || e164, last_message_at: new Date(), unread_count: 0,
            });
        } else if (!conv.phone) {
            await Conversation.update(conv.id, { phone: e164 });
        }
        return conv;
    }

    const byPhone = await Conversation.findOne({ phone: e164 });
    if (byPhone) return byPhone;

    const strangerId = -(Number(digitsOnly(e164).slice(-9)) || 1);
    try {
        return await Conversation.create({
            user_id: strangerId, user_type: "tenant", phone: e164,
            name: profileName || e164, last_message_at: new Date(), unread_count: 0,
        });
    } catch (err) {
        const again = (await Conversation.findOne({ phone: e164 })) || (await Conversation.findOne({ user_id: strangerId, user_type: "tenant" }));
        if (again) return again;
        throw err;
    }
};

/** POST /api/webhooks/twilio/whatsapp */
exports.handleIncomingMessage = async (req, res) => {
    try {
        const { From, To, Body, MessageSid, NumMedia, MediaUrl0, MediaContentType0, ProfileName } = req.body || {};
        const e164 = normalizePhone(stripChannel(From));
        if (!e164) return res.status(200).send("OK");

        // Twilio may deliver the same webhook twice – never store a message twice.
        if (MessageSid && (await Message.findOne({ external_id: MessageSid }))) return res.status(200).send("OK");

        const conversation = await findOrCreateConversation(e164, ProfileName);
        const media = Number.parseInt(NumMedia, 10) > 0;

        await Message.create({
            conversation_id: conversation.id,
            direction: "inbound",
            channel: "whatsapp",
            message_type: media ? "media" : "text",
            content: Body || "",
            media_url: MediaUrl0 || null,
            status: "received",
            external_id: MessageSid || null,
            metadata: { profileName: ProfileName || null, to: stripChannel(To), numMedia: NumMedia || "0", mediaType: MediaContentType0 || null },
        });
        await Conversation.update(conversation.id, {
            last_message_at: new Date(),
            unread_count: (conversation.unread_count || 0) + 1,
            ...(ProfileName && (!conversation.name || conversation.name === conversation.phone) ? { name: ProfileName } : {}),
        });

        // Optional auto-reply (free-form is allowed: the person just wrote to us, so the 24h window is open)
        if (process.env.WHATSAPP_AUTO_REPLY === "true") {
            try {
                await messagingService.sendMessage({
                    userId: conversation.user_id,
                    userType: conversation.user_type,
                    phone: conversation.phone,
                    name: conversation.name,
                    type: "text",
                    body: process.env.WHATSAPP_AUTO_REPLY_TEXT || "Thank you for your message. Our team will get back to you shortly.",
                    skipEmail: true,
                });
            } catch (autoReplyErr) {
                console.error("Auto-reply failed:", autoReplyErr.message);
            }
        }
    } catch (error) {
        console.error("Incoming WhatsApp webhook error:", error.message);
    }
    res.status(200).send("OK");
};

/** POST /api/webhooks/twilio/status */
exports.handleStatusCallback = async (req, res) => {
    try {
        const { MessageSid, SmsSid, MessageStatus, SmsStatus, ErrorCode, ErrorMessage } = req.body || {};
        await messagingService.processStatusCallback({
            sid: MessageSid || SmsSid,
            status: MessageStatus || SmsStatus,
            errorCode: ErrorCode || null,
            errorMessage: ErrorMessage || null,
        });
    } catch (error) {
        console.error("Twilio status callback error:", error.message);
    }
    res.status(200).send("OK");
};
