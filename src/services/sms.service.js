/**
 * SMS (Twilio Programmable Messaging) – the second step of the delivery chain.
 *
 * SMS bodies are kept to the GSM-7 alphabet on purpose: one emoji or "₹" turns a message into
 * UCS-2 (70 chars/segment instead of 160) and triples the cost. Currency is written "Rs.".
 */
const { getClient, config, statusCallbackUrl } = require("./twilio.client");

const MAX_SMS_CHARS = 600; // ~4 segments

/** Convert any text into a short, GSM-friendly SMS. */
const toSmsText = (text) => {
    let s = String(text ?? "")
        .replace(/₹\s?/g, "Rs. ")
        .replace(/[“”«»]/g, '"')
        .replace(/[‘’`´]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/…/g, "...")
        .replace(/\*([^*\n]+)\*/g, "$1")      // WhatsApp *bold*
        .replace(/_([^_\n]+)_/g, "$1")         // WhatsApp _italic_
        // strip emoji / pictographs / variation selectors
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    if (s.length > MAX_SMS_CHARS) s = s.slice(0, MAX_SMS_CHARS - 3).trimEnd() + "...";
    return s;
};

const sendSms = async (to, body) => {
    const client = getClient();
    if (!client) throw new Error("Twilio is not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN).");
    const cfg = config();
    if (!cfg.smsFrom && !cfg.smsMessagingService) {
        throw new Error("SMS sender not configured (set TWILIO_SMS_FROM or TWILIO_MESSAGING_SERVICE_SID).");
    }
    const payload = { to, body: toSmsText(body), statusCallback: statusCallbackUrl() };
    if (cfg.smsMessagingService) payload.messagingServiceSid = cfg.smsMessagingService;
    else payload.from = cfg.smsFrom;

    const m = await client.messages.create(payload);
    return { sid: m.sid, status: m.status, to: m.to, from: m.from };
};

module.exports = { sendSms, toSmsText };
