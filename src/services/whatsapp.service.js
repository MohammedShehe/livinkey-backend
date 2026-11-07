/**
 * WhatsApp (Twilio) – the first step of the delivery chain.
 *
 *   sendWhatsApp(to, { text, template })
 *     - template + matching TWILIO_*_CONTENT_SID set -> approved Content Template (works any time)
 *     - otherwise                                      -> free-form text (only delivered inside
 *                                                         WhatsApp's 24-hour customer-service window;
 *                                                         outside it Twilio reports a failure through
 *                                                         the status callback and the chain falls
 *                                                         through to SMS and then e-mail)
 *
 * Every send carries a statusCallback so a *late* failure (user not on WhatsApp, template not
 * approved, 24h window closed ...) is noticed and the next channel is tried automatically.
 */
const { getClient, config, statusCallbackUrl, withWhatsAppPrefix } = require("./twilio.client");

// Twilio Content SIDs are "HX" + 32 hex characters. A placeholder such as HXxxxxxxxx is ignored (with one warning)
// instead of making every WhatsApp message fail.
const warned = new Set();
const contentSidFor = (envKey) => {
    const v = String(process.env[envKey] || "").trim();
    if (!v) return "";
    if (/^HX[0-9a-fA-F]{32}$/.test(v)) return v;
    if (!warned.has(envKey)) {
        warned.add(envKey);
        console.warn(`[whatsapp] ${envKey} is not a valid Twilio Content SID ("${v.slice(0, 6)}...") - sending free-form text instead.`);
    }
    return "";
};

const buildPayload = (to, { text, template } = {}) => {
    const cfg = config();
    if (!cfg.whatsappFrom && !cfg.whatsappMessagingService) {
        throw new Error("WhatsApp sender not configured (set TWILIO_WHATSAPP_FROM or TWILIO_WHATSAPP_MESSAGING_SERVICE_SID).");
    }
    const payload = { to: withWhatsAppPrefix(to), statusCallback: statusCallbackUrl() };
    if (cfg.whatsappMessagingService) payload.messagingServiceSid = cfg.whatsappMessagingService;
    else payload.from = cfg.whatsappFrom;

    const contentSid = template?.envKey ? contentSidFor(template.envKey) : "";
    if (contentSid) {
        payload.contentSid = contentSid;
        payload.contentVariables = JSON.stringify(template.variables || {});
        payload.__mode = "template";
    } else {
        if (!String(text || "").trim()) throw new Error("WhatsApp message body is empty.");
        payload.body = text;
        payload.__mode = "text";
    }
    return payload;
};

/**
 * @returns {Promise<{sid,status,to,from,mode}>}
 */
const sendWhatsApp = async (to, content) => {
    const client = getClient();
    if (!client) throw new Error("Twilio is not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN).");
    const payload = buildPayload(to, content);
    const mode = payload.__mode;
    delete payload.__mode;
    const m = await client.messages.create(payload);
    return { sid: m.sid, status: m.status, to: m.to, from: m.from, mode };
};

/* ---- thin helper kept for older call sites ---- */
const sendTextMessage = (to, body) => sendWhatsApp(to, { text: body });

module.exports = { sendWhatsApp, sendTextMessage, buildPayload };
