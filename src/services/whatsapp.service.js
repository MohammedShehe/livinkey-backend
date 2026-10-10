/**
 * WhatsApp Service - Twilio WhatsApp Business API
 * Production-ready
 */

const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+14155238886'

let client = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Send a free-form text message (only allowed inside 24-hour customer service window)
 */
const sendTextMessage = async (to, body) => {
  if (!client) {
    throw new Error("Twilio client not configured. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.");
  }

  const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const message = await client.messages.create({
    from: whatsappFrom,
    to: toNumber,
    body: body,
  });

  return {
    sid: message.sid,
    status: message.status,
    to: message.to,
    from: message.from,
    dateCreated: message.dateCreated,
  };
};

/**
 * Send a template message (required for business-initiated messages outside 24h window)
 * @param {string} to - Recipient phone in E.164 format (e.g. +919876543210)
 * @param {string} contentSid - Twilio Content Template SID
 * @param {object} contentVariables - Key-value variables for the template
 */
const sendTemplateMessage = async (to, contentSid, contentVariables = {}) => {
  if (!client) {
    throw new Error("Twilio client not configured. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.");
  }

  const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const message = await client.messages.create({
    from: whatsappFrom,
    to: toNumber,
    contentSid: contentSid,
    contentVariables: JSON.stringify(contentVariables),
  });

  return {
    sid: message.sid,
    status: message.status,
    to: message.to,
    from: message.from,
    dateCreated: message.dateCreated,
  };
};

/**
 * Send OTP via WhatsApp (Authentication template)
 * You must create and get approved an Authentication template in Twilio/Meta
 */
const sendOTP = async (to, otp, purpose = "Login") => {
  // Option 1: Using Content Template (recommended for production)
  if (process.env.TWILIO_OTP_CONTENT_SID) {
    return sendTemplateMessage(to, process.env.TWILIO_OTP_CONTENT_SID, {
      1: otp,
      2: purpose,
    });
  }

  // Option 2: Free-form (only works if user messaged you in last 24h)
  const body = `🔐 *Livinkey ${purpose} Verification*\n\nYour OTP is: *${otp}*\n\nThis code is valid for 5 minutes.\nDo not share this code with anyone.`;
  return sendTextMessage(to, body);
};

/**
 * Send Bill notification
 */
const sendBillNotification = async (to, tenantName, billDetails) => {
  if (process.env.TWILIO_BILL_CONTENT_SID) {
    return sendTemplateMessage(to, process.env.TWILIO_BILL_CONTENT_SID, {
      1: tenantName,
      2: billDetails.amount || "",
      3: billDetails.dueDate || "",
      4: billDetails.billId || "",
    });
  }

  const body = `📄 *New Bill Generated - Livinkey*\n\nHello ${tenantName},\n\nA new bill has been generated.\nAmount: ₹${billDetails.amount}\nDue Date: ${billDetails.dueDate}\nBill ID: ${billDetails.billId}\n\nPlease login to the app to view details and pay.`;
  return sendTextMessage(to, body);
};

/**
 * Send Fine notification
 */
const sendFineNotification = async (to, tenantName, fineDetails) => {
  if (process.env.TWILIO_FINE_CONTENT_SID) {
    return sendTemplateMessage(to, process.env.TWILIO_FINE_CONTENT_SID, {
      1: tenantName,
      2: fineDetails.amount || "",
      3: fineDetails.reason || "",
    });
  }

  const body = `⚠️ *Fine Notification - Livinkey*\n\nHello ${tenantName},\n\nA fine of ₹${fineDetails.amount} has been applied.\nReason: ${fineDetails.reason}\n\nPlease check the app for more details.`;
  return sendTextMessage(to, body);
};

/**
 * Send custom admin message
 */
const sendCustomMessage = async (to, title, message) => {
  const body = `📢 *${title}*\n\n${message}\n\n— Livinkey Admin`;
  return sendTextMessage(to, body);
};

/**
 * Send e-FRRO expiry alert
 */
const sendEFRROExpiry = async (to, tenantName, daysLeft) => {
  if (process.env.TWILIO_EFRRO_CONTENT_SID) {
    return sendTemplateMessage(to, process.env.TWILIO_EFRRO_CONTENT_SID, {
      1: tenantName,
      2: String(daysLeft),
    });
  }

  const body = `🛂 *e-FRRO Expiry Alert - Livinkey*\n\nHello ${tenantName},\n\nYour e-FRRO document is expiring in *${daysLeft} days*.\nPlease renew it at the earliest to avoid any issues.`;
  return sendTextMessage(to, body);
};

module.exports = {
  sendTextMessage,
  sendTemplateMessage,
  sendOTP,
  sendBillNotification,
  sendFineNotification,
  sendCustomMessage,
  sendEFRROExpiry,
  client, // exported for advanced use
};
