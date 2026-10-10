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

const findAndCountAll = async ({ where = {}, order = [], limit = 20, offset = 0 } = {}) => {
    let sql = `SELECT * FROM conversations WHERE 1=1`;
    let countSql = `SELECT COUNT(*) as total FROM conversations WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (where.is_archived !== undefined) {
        sql += ` AND is_archived = ?`;
        countSql += ` AND is_archived = ?`;
        params.push(where.is_archived ? 1 : 0);
        countParams.push(where.is_archived ? 1 : 0);
    }

    // Simple search support
    if (where.search) {
        sql += ` AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)`;
        countSql += ` AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)`;
        const s = `%${where.search}%`;
        params.push(s, s, s);
        countParams.push(s, s, s);
    }

    sql += ` ORDER BY last_message_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.execute(sql, params);
    const [countRows] = await db.execute(countSql, countParams);

    return {
        count: countRows[0].total,
        rows,
    };
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
    getTotalUnread,
    create,
    findOne,
    findByPk,
    findAndCountAll,
    update,
};
