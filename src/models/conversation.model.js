/**
 * Conversation Model - Raw MySQL (matches project style)
 */

const db = require("../config/db");

const create = async (data) => {
    const [result] = await db.execute(
        `INSERT INTO conversations 
         (user_id, user_type, phone, email, name, last_message_at, unread_count, is_archived, assigned_to)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.user_id,
            data.user_type || "tenant",
            data.phone || null,
            data.email || null,
            data.name || null,
            data.last_message_at || new Date(),
            data.unread_count || 0,
            data.is_archived ? 1 : 0,
            data.assigned_to || null,
        ]
    );
    return { id: result.insertId, ...data };
};

const findOne = async (where = {}) => {
    let sql = `SELECT * FROM conversations WHERE 1=1`;
    const params = [];

    if (where.user_id !== undefined) {
        sql += ` AND user_id = ?`;
        params.push(where.user_id);
    }
    if (where.user_type) {
        sql += ` AND user_type = ?`;
        params.push(where.user_type);
    }
    if (where.phone) {
        sql += ` AND phone = ?`;
        params.push(where.phone);
    }
    if (where.id) {
        sql += ` AND id = ?`;
        params.push(where.id);
    }

    sql += ` LIMIT 1`;
    const [rows] = await db.execute(sql, params);
    return rows[0] || null;
};

const findByPk = async (id) => {
    const [rows] = await db.execute(`SELECT * FROM conversations WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
};

const LAST_MSG = (col) => `(SELECT m.${col} FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.id DESC LIMIT 1)`;

const findAndCountAll = async ({ where = {}, limit = 20, offset = 0 } = {}) => {
    let cond = ` WHERE 1=1`;
    const params = [];

    if (where.is_archived !== undefined) {
        cond += ` AND c.is_archived = ?`;
        params.push(where.is_archived ? 1 : 0);
    }
    if (where.unread) cond += ` AND c.unread_count > 0`;
    if (where.user_type && ["tenant", "guest", "admin", "unknown"].includes(where.user_type)) {
        // unknown contacts (people who messaged us but are not in Livinkey) are stored with a negative user_id
        if (where.user_type === "unknown") cond += ` AND c.user_id < 0`;
        else { cond += ` AND c.user_type = ? AND c.user_id >= 0`; params.push(where.user_type); }
    }
    if (where.search) {
        cond += ` AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)`;
        const s = `%${String(where.search).replace(/[%_]/g, "\\$&")}%`;
        params.push(s, s, s);
    }

    // mysql2 prepared LIMIT/OFFSET parameters can fail on some MySQL-compatible
    // production deployments. Normalize them to safe integers and interpolate
    // only these validated numeric values; all user-provided filters remain bound.
    const safeLimit = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 20));
    const safeOffset = Math.max(0, Number.parseInt(offset, 10) || 0);

    const sql = `SELECT c.*,
                   ${LAST_MSG("content")}     AS last_message,
                   ${LAST_MSG("direction")}   AS last_direction,
                   ${LAST_MSG("channel")}     AS last_channel,
                   ${LAST_MSG("status")}      AS last_status,
                   ${LAST_MSG("message_type")} AS last_type
                 FROM conversations c${cond}
                 ORDER BY c.last_message_at DESC, c.id DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    const [rows] = await db.execute(sql, params);
    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM conversations c${cond}`, params);

    return { count: countRows[0].total, rows };
};

/** Timestamp of the contact's latest inbound message (drives WhatsApp's 24-hour reply window). */
const lastInboundAt = async (conversationId) => {
    const [rows] = await db.execute(
        `SELECT created_at FROM messages WHERE conversation_id = ? AND direction = 'inbound' ORDER BY created_at DESC, id DESC LIMIT 1`,
        [conversationId]
    );
    return rows[0]?.created_at || null;
};

const update = async (id, data) => {
    const fields = [];
    const params = [];

    if (data.last_message_at !== undefined) {
        fields.push("last_message_at = ?");
        params.push(data.last_message_at);
    }
    if (data.unread_count !== undefined) {
        fields.push("unread_count = ?");
        params.push(data.unread_count);
    }
    if (data.phone !== undefined) {
        fields.push("phone = ?");
        params.push(data.phone);
    }
    if (data.email !== undefined) {
        fields.push("email = ?");
        params.push(data.email);
    }
    if (data.name !== undefined) {
        fields.push("name = ?");
        params.push(data.name);
    }
    if (data.is_archived !== undefined) {
        fields.push("is_archived = ?");
        params.push(data.is_archived ? 1 : 0);
    }
    if (data.assigned_to !== undefined) {
        fields.push("assigned_to = ?");
        params.push(data.assigned_to);
    }

    if (fields.length === 0) return;

    params.push(id);
    await db.execute(`UPDATE conversations SET ${fields.join(", ")} WHERE id = ?`, params);
};

const getTotalUnread = async () => {
    const [rows] = await db.execute(
        `SELECT COALESCE(SUM(unread_count), 0) as total FROM conversations WHERE is_archived = 0`
    );
    return Number(rows[0]?.total || 0);
};

module.exports = {
    lastInboundAt,
    getTotalUnread,
    create,
    findOne,
    findByPk,
    findAndCountAll,
    update,
};
