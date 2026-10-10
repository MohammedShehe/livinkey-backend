/**
 * Dual-Channel Messaging Service
 * Primary: WhatsApp (Twilio)
 * Fallback: Email
 * Production-ready
 */

const whatsappService = require("./whatsapp.service");
const mailService = require("./mail.service"); // Your existing mail service
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");

// Simple in-memory dedup to prevent accidental double-sends within a short window
const recentSends = new Map(); // key -> timestamp
const DEDUP_WINDOW_MS = 8000;

const makeDedupKey = ({ userId, phone, email, type, body, templateData }) => {
  const tip = templateData?.otp || templateData?.billId || templateData?.amount || "";
  return [userId || "", phone || "", email || "", type || "", (body || "").slice(0, 80), tip].join("|");
};

const isDuplicateSend = (key) => {
  const now = Date.now();
  // cleanup old
  for (const [k, ts] of recentSends.entries()) {
    if (now - ts > DEDUP_WINDOW_MS) recentSends.delete(k);
  }
  if (recentSends.has(key)) return true;
  recentSends.set(key, now);
  return false;
};

/**
 * Normalize phone to E.164 (basic)
 */
const normalizePhone = (phone) => {
  if (!phone) return null;
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    // Assume India if 10 digits
    if (cleaned.length === 10) cleaned = "+91" + cleaned;
    else if (cleaned.length === 12 && cleaned.startsWith("91")) cleaned = "+" + cleaned;
  }
  return cleaned;
};

/**
 * Core send function with WhatsApp primary + Email fallback
 * Also logs the message into conversation system
 */
const sendMessage = async ({
  userId = null,
  userType = "tenant", // tenant | guest | admin
  phone = null,
  email = null,
  name = "User",
  channelPreference = "whatsapp", // whatsapp | email | both
  type = "text", // otp | bill | fine | custom | efrro | text
  subject = null,
  title = null,
  body = null,
  templateData = {},
  metadata = {},
  skipEmail = false, // when caller already sent email
}) => {
  // Conversation records have a unique (user_id, user_type) key.
  // Never allow an empty/invalid user type to reach that constraint.
  const normalizedUserType = ["tenant", "guest", "admin"].includes(String(userType || "").toLowerCase())
    ? String(userType).toLowerCase()
    : "tenant";

  const results = {
    whatsapp: null,
    email: null,
    primaryChannel: null,
    fallbackUsed: false,
    conversationId: null,
    messageId: null,
    skippedDuplicate: false,
  };

  const normalizedPhone = normalizePhone(phone);
  let whatsappSuccess = false;
  let emailSuccess = false;

  // Dedup guard
  const dedupKey = makeDedupKey({ userId, phone: normalizedPhone, email, type, body, templateData });
  if (isDuplicateSend(dedupKey)) {
    results.skippedDuplicate = true;
    console.warn("Duplicate message skipped:", dedupKey);
    return results;
  }

  // ---------- 1. Try WhatsApp first ----------
  if (normalizedPhone && (channelPreference === "whatsapp" || channelPreference === "both")) {
    try {
      let waResult;

      switch (type) {
        case "otp":
          waResult = await whatsappService.sendOTP(normalizedPhone, templateData.otp, templateData.purpose || "Login");
          break;
        case "bill":
          waResult = await whatsappService.sendBillNotification(normalizedPhone, name, templateData);
          break;
        case "fine":
          waResult = await whatsappService.sendFineNotification(normalizedPhone, name, templateData);
          break;
        case "efrro":
          waResult = await whatsappService.sendEFRROExpiry(normalizedPhone, name, templateData.daysLeft);
          break;
        case "custom":
          waResult = await whatsappService.sendCustomMessage(normalizedPhone, title || subject || "Message", body);
          break;
        default:
          waResult = await whatsappService.sendTextMessage(normalizedPhone, body);
      }

      results.whatsapp = {
        success: true,
        sid: waResult.sid,
        status: waResult.status,
      };
      whatsappSuccess = true;
      results.primaryChannel = "whatsapp";
    } catch (err) {
      console.error("WhatsApp send failed:", err.message);
      results.whatsapp = {
        success: false,
        error: err.message,
      };
    }
  }

  // ---------- 2. Fallback to Email ----------
  if (!whatsappSuccess && email && !skipEmail) {
    try {
      // Reuse your existing mail functions
      switch (type) {
        case "otp":
          await mailService.sendOTPEmail(email, templateData.otp, templateData.purpose || "Login");
          break;
        case "bill":
          // Adjust according to your existing function signature
          if (mailService.sendBillEmail) {
            await mailService.sendBillEmail(email, name, templateData);
          }
          break;
        case "fine":
          if (mailService.sendFineNotificationEmail) {
            await mailService.sendFineNotificationEmail(email, name, templateData);
          }
          break;
        case "efrro":
          if (mailService.sendEFRROExpiryTenantEmail) {
            await mailService.sendEFRROExpiryTenantEmail(email, name, templateData);
          }
          break;
        case "custom":
          if (mailService.sendCustomAdminNotificationEmail) {
            await mailService.sendCustomAdminNotificationEmail(email, name, title || subject, body, "Livinkey Admin");
          }
          break;
        default:
          // Generic fallback - you may need to implement a simple send
          console.warn("No matching email function for type:", type);
      }

      results.email = { success: true };
      emailSuccess = true;
      results.fallbackUsed = true;
      if (!results.primaryChannel) results.primaryChannel = "email";
    } catch (err) {
      console.error("Email fallback failed:", err.message);
      results.email = {
        success: false,
        error: err.message,
      };
    }
  }

  // ---------- 3. Log into Conversation System ----------
  try {
    if (userId) {
      // Find or create conversation
      let conversation = await Conversation.findOne({ user_id: userId, user_type: normalizedUserType });

      if (!conversation) {
        conversation = await Conversation.create({
          user_id: userId,
          user_type: normalizedUserType,
          phone: normalizedPhone,
          email: email,
          name: name,
          last_message_at: new Date(),
          unread_count: 0,
        });
      } else {
        await Conversation.update(conversation.id, {
          last_message_at: new Date(),
          phone: normalizedPhone || conversation.phone,
          email: email || conversation.email,
        });
      }

      results.conversationId = conversation.id;

      // Create outbound message record
      const messageRecord = await Message.create({
        conversation_id: conversation.id,
        direction: "outbound",
        channel: results.primaryChannel || "email",
        message_type: type,
        content: body || title || `[${type}]`,
        status: whatsappSuccess || emailSuccess ? "sent" : "failed",
        external_id: results.whatsapp?.sid || null,
        metadata: {
          ...metadata,
          templateData,
          whatsappResult: results.whatsapp,
          emailResult: results.email,
        },
      });

      results.messageId = messageRecord.id;
    }
  } catch (logErr) {
    console.error("Failed to log message to conversation:", logErr.message);
  }

  // Final success check
  if (!whatsappSuccess && !emailSuccess) {
    throw new Error("Failed to send message via both WhatsApp and Email");
  }

  return results;
};

/**
 * Convenience wrappers
 */
const sendOTP = async (user, otp, purpose = "Login") => {
  return sendMessage({
    userId: user.id,
    userType: user.role || "tenant",
    phone: user.phone,
    email: user.email,
    name: user.full_name || user.name || "User",
    type: "otp",
    templateData: { otp, purpose },
  });
};

const sendBill = async (user, billData) => {
  return sendMessage({
    userId: user.id,
    userType: user.role || "tenant",
    phone: user.phone,
    email: user.email,
    name: user.full_name || user.name,
    type: "bill",
    templateData: billData,
  });
};

const sendFine = async (user, fineData) => {
  return sendMessage({
    userId: user.id,
    userType: user.role || "tenant",
    phone: user.phone,
    email: user.email,
    name: user.full_name || user.name,
    type: "fine",
    templateData: fineData,
  });
};

const sendCustom = async (user, title, message) => {
  return sendMessage({
    userId: user.id,
    userType: user.role || "tenant",
    phone: user.phone,
    email: user.email,
    name: user.full_name || user.name,
    type: "custom",
    title,
    body: message,
  });
};

module.exports = {
  sendMessage,
  sendOTP,
  sendBill,
  sendFine,
  sendCustom,
  normalizePhone,
};
