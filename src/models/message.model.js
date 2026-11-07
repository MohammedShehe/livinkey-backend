/**
 * Message Model - Raw MySQL (matches project style)
 */

const db = require("../config/db");

const create = async (data) => {
    const [result] = await db.execute(
        `INSERT INTO messages 
         (conversation_id, direction, channel, message_type, content, media_url, status, external_id, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.conversation_id,
            data.direction,
            data.channel || "whatsapp",
            data.message_type || null,
            data.content || null,
            data.media_url || null,
            data.status || "queued",
            data.external_id || null,
            data.metadata ? JSON.stringify(data.metadata) : null,
        ]
    );
    return { id: result.insertId, ...data };
};

const findAll = async ({ where = {}, order = "ASC" } = {}) => {
    let sql = `SELECT * FROM messages WHERE 1=1`;
    const params = [];

    if (where.conversation_id) {
        sql += ` AND conversation_id = ?`;
        params.push(where.conversation_id);
    }
    if (where.external_id) {
        sql += ` AND external_id = ?`;
        params.push(where.external_id);
    }

    if (where.after_id) {
        sql += ` AND id > ?`;
        params.push(Number(where.after_id) || 0);
    }

    sql += ` ORDER BY created_at ${order === "DESC" ? "DESC" : "ASC"}, id ${order === "DESC" ? "DESC" : "ASC"}`;

    const [rows] = await db.execute(sql, params);
    return rows;
};

const findOne = async (where = {}) => {
    let sql = `SELECT * FROM messages WHERE 1=1`;
    const params = [];

    if (where.external_id) {
        sql += ` AND external_id = ?`;
        params.push(where.external_id);
    }
    if (where.id) {
        sql += ` AND id = ?`;
        params.push(where.id);
    }

    sql += ` LIMIT 1`;
    const [rows] = await db.execute(sql, params);
    return rows[0] || null;
};

const update = async (id, data) => {
    const fields = [];
    const params = [];

    if (data.status !== undefined) {
        fields.push("status = ?");
        params.push(data.status);
    }
    if (data.metadata !== undefined) {
        fields.push("metadata = ?");
        params.push(JSON.stringify(data.metadata));
    }
    if (data.content !== undefined) {
        fields.push("content = ?");
        params.push(data.content);
    }
    if (data.channel !== undefined) {
        fields.push("channel = ?");
        params.push(data.channel);
    }
    if (data.external_id !== undefined) {
        fields.push("external_id = ?");
        params.push(data.external_id);
    }

    if (fields.length === 0) return;

    params.push(id);
    await db.execute(`UPDATE messages SET ${fields.join(", ")} WHERE id = ?`, params);
};

const parseMetadata = (m) => {
    if (!m) return {};
    if (typeof m === "object") return m;
    try { return JSON.parse(m); } catch { return {}; }
};

/** Only ever move a message "forward" (queued -> sent -> delivered -> read); failed can be set from anything but read/delivered. */
const RANK = { queued: 0, sent: 1, delivered: 2, read: 3 };
const advanceStatus = async (id, next, metadataPatch = null) => {
    const row = await findOne({ id });
    if (!row) return null;
    const cur = row.status;
    let status = next;
    if (next !== "failed" && RANK[cur] !== undefined && RANK[next] !== undefined && RANK[next] < RANK[cur]) status = cur;
    if (next === "failed" && (cur === "delivered" || cur === "read")) status = cur;
    const meta = metadataPatch ? { ...parseMetadata(row.metadata), ...metadataPatch } : undefined;
    await update(id, { status, ...(meta ? { metadata: meta } : {}) });
    return { ...row, status };
};

module.exports = {
    parseMetadata,
    advanceStatus,
    create,
    findAll,
    findOne,
    update,
};
