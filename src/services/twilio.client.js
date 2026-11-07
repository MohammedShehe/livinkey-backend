/**
 * One shared Twilio client + configuration helpers.
 * The client is created lazily so a credential change (new .env) is picked up on restart
 * and a missing credential never crashes the server at import time.
 */
const twilio = require("twilio");
const { API_URL } = require("../utils/links");

let cached = null;
let cachedKey = "";

const getClient = () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) return null;
    const key = `${sid}:${token}`;
    if (cached && cachedKey === key) return cached;
    try {
        cached = twilio(sid, token);
        cachedKey = key;
    } catch (err) {
        console.error("Twilio client init failed:", err.message);
        cached = null;
        cachedKey = "";
    }
    return cached;
};

const withWhatsAppPrefix = (n) => {
    const s = String(n || "").trim();
    if (!s) return "";
    return /^whatsapp:/i.test(s) ? s : `whatsapp:${s.startsWith("+") ? s : "+" + s.replace(/[^\d]/g, "")}`;
};

const config = () => ({
    whatsappFrom: withWhatsAppPrefix(process.env.TWILIO_WHATSAPP_FROM),
    whatsappMessagingService: process.env.TWILIO_WHATSAPP_MESSAGING_SERVICE_SID || "",
    smsFrom: String(process.env.TWILIO_SMS_FROM || "").trim(),
    smsMessagingService: process.env.TWILIO_MESSAGING_SERVICE_SID || "",
});

const statusCallbackUrl = () => process.env.TWILIO_STATUS_CALLBACK_URL || `${API_URL}/api/webhooks/twilio/status`;

const isWhatsAppConfigured = () => {
    const c = config();
    return !!(getClient() && (c.whatsappFrom || c.whatsappMessagingService));
};
const isSmsConfigured = () => {
    const c = config();
    return !!(getClient() && (c.smsFrom || c.smsMessagingService));
};

/** Twilio returns SDK errors with .code / .status / .moreInfo – keep the useful part only. */
const describeError = (err) => {
    if (!err) return { message: "Unknown error" };
    return {
        message: err.message || String(err),
        code: err.code || null,
        status: err.status || null,
    };
};

module.exports = { getClient, config, statusCallbackUrl, isWhatsAppConfigured, isSmsConfigured, withWhatsAppPrefix, describeError };
