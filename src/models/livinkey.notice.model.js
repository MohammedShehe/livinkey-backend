const db = require("../config/db");

const getAll = async () => {
    const [rows] = await db.execute(`
        SELECT id, image_url, public_id, resource_type, display_order, created_at, updated_at
        FROM livinkey_notices
        ORDER BY display_order ASC, id ASC
    `);
    return rows;
};

const getById = async (id) => {
    const [rows] = await db.execute(
        `SELECT id, image_url, public_id, resource_type, display_order, created_at, updated_at
         FROM livinkey_notices WHERE id = ? LIMIT 1`,
        [id]
    );
    return rows[0] || null;
};

const create = async (data) => {
    const [result] = await db.execute(`
        INSERT INTO livinkey_notices (image_url, public_id, resource_type, display_order, created_by)
        VALUES (?, ?, ?, ?, ?)
    `, [data.image_url, data.public_id, data.resource_type || "image", data.display_order, data.created_by]);
    return getById(result.insertId);
};

const update = async (id, data) => {
    await db.execute(`
        UPDATE livinkey_notices
        SET image_url = ?, public_id = ?, resource_type = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [data.image_url, data.public_id, data.resource_type || "image", id]);
    return getById(id);
};

const remove = async (id) => {
    await db.execute(`DELETE FROM livinkey_notices WHERE id = ?`, [id]);
};

const count = async () => {
    const [rows] = await db.execute(`SELECT COUNT(*) AS count FROM livinkey_notices`);
    return Number(rows[0]?.count || 0);
};

module.exports = { getAll, getById, create, update, remove, count };
