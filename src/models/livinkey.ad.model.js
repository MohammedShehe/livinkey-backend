const db = require("../config/db");

const parseImages = row => {
  if (!row) return row;
  let images = [];
  try { images = Array.isArray(row.images) ? row.images : JSON.parse(row.images || "[]"); } catch (_) { images = []; }
  return { ...row, images };
};

const getAll = async () => {
  const [rows] = await db.execute(`
    SELECT id, title, images, valid_till, is_enabled, display_order, link_url, created_by, created_at, updated_at
    FROM livinkey_ads
    ORDER BY display_order ASC, id ASC
  `);
  return rows.map(parseImages);
};

const getById = async id => {
  const [rows] = await db.execute(
    `SELECT id,title,images,valid_till,is_enabled,display_order,link_url,created_by,created_at,updated_at FROM livinkey_ads WHERE id=? LIMIT 1`,
    [id]
  );
  return parseImages(rows[0] || null);
};

const getActive = async () => {
  const [rows] = await db.execute(`
    SELECT id,title,images,valid_till,display_order,link_url,created_at,updated_at
    FROM livinkey_ads
    WHERE is_enabled=1 AND valid_till >= CURDATE()
    ORDER BY display_order ASC, id ASC
    LIMIT 5
  `);
  return rows.map(parseImages);
};

const countActive = async (excludeId = null) => {
  const params = [];
  let sql = `SELECT COUNT(*) AS count FROM livinkey_ads WHERE is_enabled=1 AND valid_till >= CURDATE()`;
  if (excludeId) { sql += ` AND id <> ?`; params.push(excludeId); }
  const [rows] = await db.execute(sql, params);
  return Number(rows[0]?.count || 0);
};

const create = async data => {
  const [result] = await db.execute(`
    INSERT INTO livinkey_ads (title, images, valid_till, is_enabled, display_order, link_url, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    data.title,
    JSON.stringify(data.images || []),
    data.valid_till,
    data.is_enabled ? 1 : 0,
    data.display_order || 0,
    data.link_url || null,
    data.created_by || null
  ]);
  return getById(result.insertId);
};

const update = async (id, data) => {
  const fields = [];
  const params = [];
  if (data.title !== undefined) { fields.push('title=?'); params.push(data.title); }
  if (data.images !== undefined) { fields.push('images=?'); params.push(JSON.stringify(data.images)); }
  if (data.valid_till !== undefined) { fields.push('valid_till=?'); params.push(data.valid_till); }
  if (data.is_enabled !== undefined) { fields.push('is_enabled=?'); params.push(data.is_enabled ? 1 : 0); }
  if (data.display_order !== undefined) { fields.push('display_order=?'); params.push(data.display_order); }
  if (data.link_url !== undefined) { fields.push('link_url=?'); params.push(data.link_url || null); }
  fields.push('updated_at=CURRENT_TIMESTAMP');
  params.push(id);
  await db.execute(`UPDATE livinkey_ads SET ${fields.join(', ')} WHERE id=?`, params);
  return getById(id);
};

const remove = async id => { await db.execute(`DELETE FROM livinkey_ads WHERE id=?`, [id]); };

const reorder = async ids => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (let i = 0; i < ids.length; i++) {
      await connection.execute(
        `UPDATE livinkey_ads SET display_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        [i + 1, ids[i]]
      );
    }
    await connection.commit();
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
};

module.exports = { getAll, getById, getActive, countActive, create, update, remove, reorder };
