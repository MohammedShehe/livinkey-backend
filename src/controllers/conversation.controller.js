/**
 * Conversation Controller – admin inbox (WhatsApp / SMS / e-mail history, replies)
 */

const axios = require("axios");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const messagingService = require("../services/messaging.service");

const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_REPLY = 1500;

const withMetaParsed = (m) => ({ ...m, metadata: Message.parseMetadata(m.metadata) });

/** WhatsApp lets us send free-form text only for 24h after the contact last wrote to us. */
const windowInfo = async (conversationId) => {
    const last = await Conversation.lastInboundAt(conversationId);
    if (!last) return { open: false, last_inbound_at: null, expires_at: null };
    const expires = new Date(new Date(last).getTime() + WINDOW_MS);
    return { open: expires.getTime() > Date.now(), last_inbound_at: last, expires_at: expires };
};

/** GET /api/conversations?page&limit&search&filter=all|unread|tenant|guest|admin|unknown */
exports.listConversations = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
        const search = String(req.query.search || "").trim().slice(0, 100);
        const filter = String(req.query.filter || "all");
        const archived = req.query.archived === "1" || req.query.archived === "true";

        const where = { is_archived: archived, search };
        if (filter === "unread") where.unread = true;
        else if (["tenant", "guest", "admin", "unknown"].includes(filter)) where.user_type = filter;

        const { count, rows } = await Conversation.findAndCountAll({ where, limit, offset: (page - 1) * limit });
        const unreadTotal = await Conversation.getTotalUnread();

        return res.json({
            success: true,
            data: {
                conversations: rows,
                unread_total: unreadTotal,
                pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
            },
        });
    } catch (error) {
        console.error("List conversations error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch conversations" });
    }
};

/** GET /api/conversations/:id  (marks the conversation as read) */
exports.getConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findByPk(req.params.id);
        if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });

        const rows = await Message.findAll({ where: { conversation_id: conversation.id }, order: "ASC" });
        const win = await windowInfo(conversation.id);
        if (conversation.unread_count > 0) await Conversation.update(conversation.id, { unread_count: 0 });

        return res.json({
            success: true,
            data: { conversation: { ...conversation, unread_count: 0 }, messages: rows.map(withMetaParsed), whatsapp_window: win },
        });
    } catch (error) {
        console.error("Get conversation error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch conversation" });
    }
};

/** POST /api/conversations/:id/reply  { message } */
exports.replyToConversation = async (req, res) => {
    try {
        const text = String(req.body?.message || "").replace(/\r\n/g, "\n").trim();
        if (!text) return res.status(400).json({ success: false, message: "Please type a message first." });
        if (text.length > MAX_REPLY) return res.status(400).json({ success: false, message: `Messages can be at most ${MAX_REPLY} characters.` });

        const conversation = await Conversation.findByPk(req.params.id);
        if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });

        const result = await messagingService.sendMessage({
            userId: conversation.user_id,
            userType: conversation.user_type,
            phone: conversation.phone,
            email: conversation.email,
            name: conversation.name,
            type: "text",
            body: text,
            metadata: { replied_by_admin: req.admin?.id || null, replied_by_name: req.admin?.name || null },
        });

        const win = await windowInfo(conversation.id);
        return res.json({
            success: true,
            message: result.skippedDuplicate ? "That message was just sent." : "Reply sent.",
            data: {
                message_id: result.messageId,
                channel: result.channel,
                status: result.status,
                fallback_used: result.fallbackUsed,
                whatsapp_window: win,
            },
        });
    } catch (error) {
        console.error("Reply error:", error.message);
        return res.status(502).json({
            success: false,
            message: "The message could not be delivered on WhatsApp, SMS or email. Check the contact's phone number and try again.",
        });
    }
};

/** PATCH /api/conversations/:id/archive   body { archived?: boolean } (default true) */
exports.archiveConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findByPk(req.params.id);
        if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });
        const archived = req.body?.archived === false ? false : true;
        await Conversation.update(conversation.id, { is_archived: archived });
        return res.json({ success: true, message: archived ? "Conversation archived" : "Conversation restored" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to archive conversation" });
    }
};

/** GET /api/conversations/unread-count */
exports.unreadCount = async (req, res) => {
    try {
        const count = await Conversation.getTotalUnread();
        return res.json({ success: true, unreadCount: count });
    } catch (error) {
        console.error("Unread count error:", error);
        return res.status(500).json({ success: false, message: "Failed to get unread count", unreadCount: 0 });
    }
};

/**
 * GET /api/conversations/:id/messages/:messageId/media
 * Twilio media links need our Twilio login, so the browser cannot open them directly. We fetch the
 * file server-side (only from twilio.com) and stream it to the signed-in admin.
 */
exports.getMessageMedia = async (req, res) => {
    try {
        const msg = await Message.findOne({ id: req.params.messageId });
        if (!msg || String(msg.conversation_id) !== String(req.params.id) || !msg.media_url) {
            return res.status(404).json({ success: false, message: "Attachment not found" });
        }
        let host = "";
        try { host = new URL(msg.media_url).hostname; } catch { /* invalid */ }
        if (!/(^|\.)twilio\.com$/i.test(host)) return res.status(400).json({ success: false, message: "Unsupported attachment" });

        const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN;
        if (!sid || !token) return res.status(503).json({ success: false, message: "Twilio is not configured" });

        const upstream = await axios.get(msg.media_url, { auth: { username: sid, password: token }, responseType: "stream", timeout: 20000, maxContentLength: 25 * 1024 * 1024 });
        const type = String(upstream.headers["content-type"] || Message.parseMetadata(msg.metadata).mediaType || "application/octet-stream");
        // inline only for safe types; everything else downloads
        const inline = /^(image\/(png|jpe?g|gif|webp)|application\/pdf)$/i.test(type);
        res.setHeader("Content-Type", type);
        res.setHeader("Content-Disposition", inline ? "inline" : "attachment");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Cache-Control", "private, max-age=3600");
        upstream.data.pipe(res);
    } catch (error) {
        console.error("Media proxy error:", error.message);
        if (!res.headersSent) res.status(502).json({ success: false, message: "Could not load the attachment" });
    }
};
