/**
 * Messaging service – ONE place that delivers every OTP, bill, fine, reminder, notice,
 * inbox reply and forwarded maintenance request.
 *
 *   WhatsApp  ->  (failed?)  SMS  ->  (failed?)  e-mail
 *
 * "Failed" is detected in two ways:
 *   1. Twilio rejects the request straight away (bad number, sender/template misconfigured,
 *      account problem ...)                                    -> next channel is tried immediately.
 *   2. Twilio accepts the request but the message later fails (recipient is not on WhatsApp,
 *      24-hour window closed, template not approved, SMS blocked ...). That is only known when
 *      Twilio calls our status webhook -> processStatusCallback() sends it on the next channel.
 *
 * The text for each channel comes from messaging.templates.js so the wording is identical
 * everywhere. Secrets (OTPs) are never written to the database in plain text: the conversation
 * inbox gets a safe preview, and the "what to send if this fails" payload is encrypted and wiped
 * as soon as the message is delivered or the chain ends.
 */

const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const Delivery = require("../models/message.delivery.model");
const { compose } = require("./messaging.templates");
const { sendWhatsApp } = require("./whatsapp.service");
const { sendSms } = require("./sms.service");
const twilioClient = require("./twilio.client");
const mailService = require("./mail.service");
const { resolveContact } = require("./contacts.service");
const { normalizePhone, maskPhone, digitsOnly } = require("../utils/phone");
const secretBox = require("../utils/secret.box");

const ALL_CHANNELS = ["whatsapp", "sms", "email"];
const DEDUP_WINDOW_MS = 8000;
const recentSends = new Map(); // key -> timestamp

const LABEL = { whatsapp: "WhatsApp", sms: "SMS", email: "Email" };

/* ------------------------------------------------------------------ helpers */

const configuredOrder = () => {
    // MESSAGING_CHANNELS=whatsapp,sms,email  (remove one to switch a channel off, e.g. while SMS
    // sender registration is pending). Unknown names are ignored; order is the fallback order.
    const raw = String(process.env.MESSAGING_CHANNELS || "").toLowerCase().split(",").map((s) => s.trim());
    const list = raw.filter((c) => ALL_CHANNELS.includes(c));
    return list.length ? [...new Set(list)] : ALL_CHANNELS;
};

const userTypeOf = (user = {}) => {
    const r = String(user.userType || user.user_type || user.role || "").toLowerCase();
    if (r === "super_admin" || r === "admin") return "admin";
    if (r === "guest") return "guest";
    return "tenant";
};

const normalizeUserType = (t) => {
    const s = String(t || "").toLowerCase();
    if (s === "super_admin") return "admin";
    return ["tenant", "guest", "admin"].includes(s) ? s : "tenant";
};

const isDuplicateSend = (key) => {
    const now = Date.now();
    for (const [k, ts] of recentSends.entries()) if (now - ts > DEDUP_WINDOW_MS) recentSends.delete(k);
    if (recentSends.has(key)) return true;
    recentSends.set(key, now);
    return false;
};

const mapTwilioStatus = (s) => {
    const v = String(s || "").toLowerCase();
    if (["failed", "undelivered", "canceled"].includes(v)) return "failed";
    if (v === "read") return "read";
    if (v === "delivered") return "delivered";
    if (["sent", "partially_delivered"].includes(v)) return "sent";
    return "queued"; // queued | accepted | scheduled | sending | receiving
};

const tail8 = (v) => digitsOnly(v).slice(-8);

/** Fill in country code / e-mail / name from the user's own record when the caller didn't pass them. */
const resolveRecipient = async ({ userId, userType, phone, countryCode, email, name }) => {
    let ph = phone, cc = countryCode, em = email, nm = name;
    if (userId && Number(userId) > 0 && (!cc || !ph || !em || !nm)) {
        const c = await resolveContact(userId, userType);
        if (c) {
            if (!ph) ph = c.phone;
            if (!cc && c.countryCode && (!phone || tail8(phone) === tail8(c.phone))) cc = c.countryCode;
            if (!em) em = c.email;
            if (!nm) nm = c.name;
        }
    }
    return { e164: normalizePhone(ph, cc), email: em || null, name: nm || "there" };
};

const buildChain = ({ e164, email, preference, skipEmail }) => {
    const order = configuredOrder();
    const chain = [];
    for (const ch of order) {
        if (ch === "whatsapp" && preference !== "email" && e164 && twilioClient.isWhatsAppConfigured()) chain.push(ch);
        if (ch === "sms" && preference !== "email" && e164 && twilioClient.isSmsConfigured()) chain.push(ch);
        if (ch === "email" && email && !skipEmail) chain.push(ch);
    }
    return chain;
};

const safeTemplateData = (td = {}) => {
    const { otp, billData, ...rest } = td || {};
    return rest;
};

const iso = () => new Date().toISOString();

const failureSummary = (attempts) =>
    attempts.filter((a) => !a.ok).map((a) => `${LABEL[a.channel] || a.channel}: ${a.error || "failed"}`).join("; ");

/* --------------------------------------------------------------- one channel */

const sendEmailStep = async (payload, richEmail) => {
    if (!payload.emailTo) throw new Error("No e-mail address.");
    if (payload.emailKind === "otp" && payload.otp) {
        return mailService.sendOTPEmail(payload.emailTo, payload.otp, payload.purpose || "Login");
    }
    if (richEmail) return richEmail();
    return mailService.sendCustomAdminNotificationEmail(
        payload.emailTo,
        payload.name || "there",
        payload.email.title,
        payload.email.text,
        "Livinkey"
    );
};

const executeStep = async (channel, payload, richEmail) => {
    if (channel === "whatsapp") return sendWhatsApp(payload.e164, payload.whatsapp);
    if (channel === "sms") return sendSms(payload.e164, payload.sms);
    if (channel === "email") return sendEmailStep(payload, richEmail);
    throw new Error(`Unknown channel ${channel}`);
};

/**
 * Walk the chain until one channel accepts the message.
 * @returns {{channel, status, sid, pending:string[], attempts, ok:boolean}}
 */
const runChain = async ({ chain, payload, attempts = [], richEmail = null }) => {
    for (let i = 0; i < chain.length; i++) {
        const channel = chain[i];
        try {
            const r = await executeStep(channel, payload, richEmail);
            attempts.push({ channel, ok: true, sid: r?.sid || null, mode: r?.mode || null, at: iso() });
            if (channel === "email") return { ok: true, channel, status: "sent", sid: null, pending: [], attempts };
            return { ok: true, channel, status: mapTwilioStatus(r.status), sid: r.sid, pending: chain.slice(i + 1), attempts };
        } catch (err) {
            const d = twilioClient.describeError(err);
            attempts.push({ channel, ok: false, error: d.message, code: d.code || null, at: iso() });
            console.error(`[messaging] ${LABEL[channel]} failed${payload.tag ? ` (${payload.tag})` : ""}:`, d.code ? `${d.code} ` : "", d.message);
        }
    }
    return { ok: false, channel: null, status: "failed", sid: null, pending: [], attempts };
};

/* ----------------------------------------------------- persistence of a result */

const sealPending = (pending, payload) => (pending.length ? secretBox.seal({ chain: pending, payload }) : null);

/**
 * Record the outcome on the message row / delivery row / forward row.
 * `target` is { messageId } or { forwardId }.
 */
const persistOutcome = async ({ target, outcome, payload, deliveryId = null }) => {
    const lastErr = outcome.attempts.filter((a) => !a.ok).slice(-1)[0] || null;

    let id = deliveryId;
    if (outcome.ok && outcome.channel !== "email") {
        const fields = {
            channel: outcome.channel,
            status: outcome.status,
            external_id: outcome.sid,
            pending_chain: sealPending(outcome.pending, payload),
            attempts: outcome.attempts,
            error_code: null,
            error_message: null,
        };
        if (id) await Delivery.update(id, fields);
        else id = await Delivery.create({ message_id: target.messageId, forward_id: target.forwardId, ...fields });
    } else if (id) {
        // chain finished on e-mail, or everything failed: close the delivery row and wipe the payload
        await Delivery.update(id, {
            channel: outcome.channel || "email",
            status: outcome.ok ? "sent" : "failed",
            pending_chain: null,
            attempts: outcome.attempts,
            error_code: outcome.ok ? null : lastErr?.code || null,
            error_message: outcome.ok ? null : lastErr?.error || null,
        });
    }

    if (target.messageId) {
        const row = await Message.findOne({ id: target.messageId });
        const meta = { ...Message.parseMetadata(row?.metadata), attempts: outcome.attempts, fallbackUsed: outcome.attempts.some((a) => !a.ok) };
        await Message.update(target.messageId, {
            channel: outcome.channel || row?.channel || "email",
            status: outcome.ok ? outcome.status : "failed",
            external_id: outcome.sid || null,
            metadata: meta,
        });
    }
    if (target.forwardId) {
        const MaintenanceForward = require("../models/maintenance.forward.model");
        await MaintenanceForward.update(target.forwardId, {
            channel: outcome.channel || null,
            status: outcome.ok ? outcome.status : "failed",
            error_message: outcome.ok ? null : failureSummary(outcome.attempts).slice(0, 500),
        });
    }
    return id;
};

/* ------------------------------------------------------------------ main API */

/**
 * Send one message to a Livinkey user.
 * Rejects only when NO channel could take the message.
 */
const sendMessage = async ({
    userId = null,
    userType = "tenant", // tenant | guest | admin
    phone = null,
    countryCode = null,
    email = null,
    name = null,
    channelPreference = "auto", // auto (WhatsApp -> SMS -> e-mail) | email
    type = "text", // otp | bill | fine | efrro | custom | reminder | text
    subject = null,
    title = null,
    body = null,
    templateData = {},
    metadata = {},
    skipEmail = false, // the caller sends its own, richer e-mail separately
    richEmail = null, // optional () => Promise – dedicated e-mail used if the chain reaches e-mail synchronously
}) => {
    const kind = normalizeUserType(userType);
    const results = {
        whatsapp: null, sms: null, email: null,
        channel: null, primaryChannel: null, fallbackUsed: false,
        status: null, attempts: [],
        conversationId: null, messageId: null, skippedDuplicate: false,
    };

    const rcpt = await resolveRecipient({ userId, userType: kind, phone, countryCode, email, name });
    const data = { ...(templateData || {}), title: title || subject || templateData?.title, body: body ?? templateData?.body ?? templateData?.message };
    const composed = compose(type, data, { name: rcpt.name });

    const dedupKey = [userId || "", rcpt.e164 || "", rcpt.email || "", type, composed.whatsapp.text.slice(0, 120)].join("|");
    if (isDuplicateSend(dedupKey)) {
        results.skippedDuplicate = true;
        console.warn("[messaging] duplicate send skipped:", type, userId || rcpt.e164);
        return results;
    }

    const chain = buildChain({ e164: rcpt.e164, email: rcpt.email, preference: channelPreference, skipEmail });

    // ---- conversation + message row (so the admin inbox shows it, and deliveries can link to it)
    let messageId = null;
    try {
        if (userId) {
            let conv = await Conversation.findOne({ user_id: userId, user_type: kind });
            if (!conv) {
                conv = await Conversation.create({
                    user_id: userId, user_type: kind, phone: rcpt.e164, email: rcpt.email,
                    name: rcpt.name === "there" ? null : rcpt.name, last_message_at: new Date(), unread_count: 0,
                });
            } else {
                await Conversation.update(conv.id, {
                    last_message_at: new Date(),
                    phone: rcpt.e164 || conv.phone,
                    email: rcpt.email || conv.email,
                });
            }
            results.conversationId = conv.id;
            const rec = await Message.create({
                conversation_id: conv.id,
                direction: "outbound",
                channel: chain[0] || "email",
                message_type: type,
                content: type === "otp" ? composed.preview : composed.whatsapp.text || composed.preview,
                status: "queued",
                metadata: { ...metadata, type, chain, templateData: safeTemplateData(templateData) },
            });
            messageId = rec.id;
            results.messageId = messageId;
        }
    } catch (logErr) {
        console.error("[messaging] could not log to conversation:", logErr.message);
    }

    const payload = {
        tag: `${type}${userId ? `#${userId}` : ""}`,
        type, name: rcpt.name, e164: rcpt.e164,
        emailTo: rcpt.email, email: composed.email,
        whatsapp: composed.whatsapp, sms: composed.sms,
        emailKind: type === "otp" ? "otp" : null,
        ...(type === "otp" ? { otp: data.otp, purpose: data.purpose || "Login" } : {}),
    };

    if (!chain.length) {
        const why = !rcpt.e164 && !rcpt.email ? "no valid phone number or e-mail on file"
            : skipEmail && !twilioClient.isWhatsAppConfigured() && !twilioClient.isSmsConfigured() ? "WhatsApp/SMS are not configured"
            : "no usable channel";
        if (messageId) await Message.update(messageId, { status: "failed", metadata: { ...metadata, type, error: why } }).catch(() => {});
        throw new Error(`Message not sent: ${why}.`);
    }

    const outcome = await runChain({ chain, payload, richEmail });
    if (messageId) {
        try { await persistOutcome({ target: { messageId }, outcome, payload }); }
        catch (e) { console.error("[messaging] could not save delivery state:", e.message); }
    }

    for (const a of outcome.attempts) results[a.channel] = a.ok ? { success: true, sid: a.sid || undefined, status: outcome.status } : { success: false, error: a.error };
    results.channel = results.primaryChannel = outcome.channel;
    results.status = outcome.status;
    results.attempts = outcome.attempts;
    results.fallbackUsed = outcome.attempts.some((a) => !a.ok);

    if (!outcome.ok) throw new Error(`Could not deliver the message. ${failureSummary(outcome.attempts)}`);
    return results;
};

/**
 * Send to any phone number (not a Livinkey user) – used to forward maintenance details.
 * WhatsApp -> SMS only (there is no e-mail address). Tracked through message_deliveries.forward_id.
 */
const sendToNumber = async ({ phone, countryCode = null, name = null, type = "custom", data = {}, forwardId = null }) => {
    const e164 = normalizePhone(phone, countryCode);
    if (!e164) throw Object.assign(new Error("That phone number is not valid."), { status: 400 });
    const composed = compose(type, data, { name: name || "there" });
    const chain = buildChain({ e164, email: null, preference: "auto", skipEmail: true });
    if (!chain.length) throw Object.assign(new Error("WhatsApp and SMS are not configured on the server (Twilio settings missing)."), { status: 503 });

    const payload = { tag: `${type}->${maskPhone(e164)}`, type, name: name || "there", e164, whatsapp: composed.whatsapp, sms: composed.sms, email: composed.email };
    const outcome = await runChain({ chain, payload });
    if (forwardId) await persistOutcome({ target: { forwardId }, outcome, payload });
    return {
        ok: outcome.ok, to: e164, channel: outcome.channel, status: outcome.status,
        attempts: outcome.attempts, fallbackUsed: outcome.attempts.some((a) => !a.ok),
        error: outcome.ok ? null : failureSummary(outcome.attempts),
    };
};

/* ------------------------------------------------ Twilio status webhook logic */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Called for every delivery-status callback Twilio posts.
 *  - progress (sent / delivered / read) updates the message tick marks;
 *  - failure (failed / undelivered) hands the message to the next channel in the chain.
 */
const processStatusCallback = async ({ sid, status, errorCode = null, errorMessage = null }) => {
    if (!sid) return { handled: false };
    const mapped = mapTwilioStatus(status);

    // The callback can (rarely) beat our own database insert – give it a moment.
    let d = await Delivery.findByExternalId(sid);
    for (let i = 0; !d && i < 3; i++) {
        await sleep(800);
        d = await Delivery.findByExternalId(sid);
    }

    if (!d) {
        // older rows sent before deliveries existed
        const m = await Message.findOne({ external_id: sid });
        if (m) await Message.advanceStatus(m.id, mapped, { statusCallback: { status, errorCode, errorMessage, at: iso() } });
        return { handled: !!m };
    }

    if (mapped !== "failed") {
        const rank = Delivery.RANK;
        if ((rank[mapped] ?? 0) > (rank[d.status] ?? 0)) {
            const fields = { status: mapped };
            if (mapped === "delivered" || mapped === "read") fields.pending_chain = null; // done – wipe the parked payload
            await Delivery.update(d.id, fields);
        }
        if (d.message_id) await Message.advanceStatus(d.message_id, mapped);
        if (d.forward_id) {
            const MaintenanceForward = require("../models/maintenance.forward.model");
            await MaintenanceForward.advance(d.forward_id, mapped);
        }
        return { handled: true, status: mapped };
    }

    // ---------- failure: try the next channel (exactly one worker wins the claim)
    if (!(await Delivery.claimFallback(d.id, sid))) return { handled: true, duplicate: true };

    let attempts = [];
    try { attempts = JSON.parse(d.attempts || "[]"); } catch { attempts = []; }
    attempts.push({ channel: d.channel, ok: false, async: true, error: errorMessage || `Twilio status: ${status}`, code: errorCode ? String(errorCode) : null, at: iso() });
    console.error(`[messaging] ${LABEL[d.channel] || d.channel} delivery failed (${errorCode || status}) – falling back`, d.message_id ? `message ${d.message_id}` : `forward ${d.forward_id}`);

    const sealed = secretBox.open(d.pending_chain);
    const target = { messageId: d.message_id || null, forwardId: d.forward_id || null };

    if (!sealed || !Array.isArray(sealed.chain) || !sealed.chain.length) {
        await persistOutcome({ target, outcome: { ok: false, channel: d.channel, status: "failed", sid, pending: [], attempts }, payload: null, deliveryId: d.id });
        return { handled: true, exhausted: true };
    }

    const outcome = await runChain({ chain: sealed.chain, payload: sealed.payload, attempts });
    await persistOutcome({ target, outcome, payload: sealed.payload, deliveryId: d.id });
    return { handled: true, fellBackTo: outcome.channel, ok: outcome.ok };
};

/* ------------------------------------------------------------ convenience API */

const contactFields = (user) => ({
    userId: user.id,
    userType: userTypeOf(user),
    phone: user.phone,
    countryCode: user.country_code || user.countryCode || null,
    email: user.email,
    name: user.full_name || user.name || null,
});

const sendOTP = (user, otp, purpose = "Login") =>
    sendMessage({ ...contactFields(user), type: "otp", templateData: { otp, purpose } });

const sendBill = (user, billData, opts = {}) =>
    sendMessage({ ...contactFields(user), type: "bill", templateData: billData, ...opts });

const sendFine = (user, fineData, opts = {}) =>
    sendMessage({ ...contactFields(user), type: "fine", templateData: fineData, ...opts });

const sendCustom = (user, title, message, opts = {}) =>
    sendMessage({ ...contactFields(user), type: "custom", title, body: message, ...opts });

module.exports = {
    sendMessage,
    sendToNumber,
    sendOTP,
    sendBill,
    sendFine,
    sendCustom,
    processStatusCallback,
    normalizePhone,
    userTypeOf,
    // exported for tests
    _internals: { buildChain, runChain, mapTwilioStatus, configuredOrder },
};
