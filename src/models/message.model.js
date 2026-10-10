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

    sql += ` ORDER BY created_at ${order === "DESC" ? "DESC" : "ASC"}`;

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

    if (fields.length === 0) return;

    params.push(id);
    await db.execute(`UPDATE messages SET ${fields.join(", ")} WHERE id = ?`, params);
};

module.exports = {
    create,
    findAll,
    findOne,
    update,
};
