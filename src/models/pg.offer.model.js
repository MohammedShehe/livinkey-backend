const db = require("../config/db");

/**
 * Offers attached to a PG. An offer is "live" (visible on the public website
 * and in the guest app) when it is switched on AND today is inside its
 * optional valid_from / valid_until window.
 */
const LIVE_SQL = `
    o.is_active = 1
    AND (o.valid_from IS NULL OR o.valid_from <= CURDATE())
    AND (o.valid_until IS NULL OR o.valid_until >= CURDATE())
`;

const shape = (r) => ({
    id: r.id,
    pg_id: r.pg_id,
    title: r.title,
    description: r.description || "",
    offer_type: r.offer_type,
    offer_value: r.offer_value === null || r.offer_value === undefined ? null : Number(r.offer_value),
    badge_text: r.badge_text || "",
    coupon_code: r.coupon_code || "",
    terms: r.terms || "",
    valid_from: r.valid_from ? String(r.valid_from).slice(0, 10) : null,
    valid_until: r.valid_until ? String(r.valid_until).slice(0, 10) : null,
    is_active: !!r.is_active,
    is_live: r.is_live === undefined ? undefined : !!r.is_live,
    sort_order: Number(r.sort_order || 0),
    created_at: r.created_at,
    updated_at: r.updated_at,
    // Convenience label used by every client so they all show the same wording
    headline: headline(r)
});

function headline(r) {
    if (r.badge_text) return r.badge_text;
    const v = r.offer_value === null || r.offer_value === undefined ? null : Number(r.offer_value);
    if (r.offer_type === "percent" && v) return `${v % 1 === 0 ? v : v.toFixed(1)}% OFF`;
    if (r.offer_type === "flat" && v) return `₹${v.toLocaleString("en-IN")} OFF`;
    if (r.offer_type === "free") return "FREE";
    return "OFFER";
}

const DATE_COLS = `o.*, DATE_FORMAT(o.valid_from,'%Y-%m-%d') AS valid_from, DATE_FORMAT(o.valid_until,'%Y-%m-%d') AS valid_until,
    (${LIVE_SQL}) AS is_live`;

exports.listForPg = async (pgId) => {
    const [rows] = await db.execute(
        `SELECT ${DATE_COLS} FROM pg_offers o WHERE o.pg_id = ? ORDER BY o.is_active DESC, o.sort_order ASC, o.created_at DESC`,
        [pgId]
    );
    return rows.map(shape);
};

exports.listAll = async () => {
    const [rows] = await db.execute(
        `SELECT ${DATE_COLS}, p.name AS pg_name FROM pg_offers o JOIN pgs p ON p.id = o.pg_id
         ORDER BY o.is_active DESC, p.name ASC, o.sort_order ASC, o.created_at DESC`
    );
    return rows.map(r => ({ ...shape(r), pg_name: r.pg_name }));
};

exports.getById = async (id) => {
    const [rows] = await db.execute(`SELECT ${DATE_COLS} FROM pg_offers o WHERE o.id = ? LIMIT 1`, [id]);
    return rows[0] ? shape(rows[0]) : null;
};

/** Live offers for one PG (public). */
exports.liveForPg = async (pgId) => {
    const [rows] = await db.execute(
        `SELECT ${DATE_COLS} FROM pg_offers o WHERE o.pg_id = ? AND ${LIVE_SQL} ORDER BY o.sort_order ASC, o.created_at DESC`,
        [pgId]
    );
    return rows.map(shape);
};

/** Live offers for many PGs at once -> { [pgId]: Offer[] } (public list pages). */
exports.liveForPgs = async (pgIds) => {
    const out = {};
    if (!pgIds || !pgIds.length) return out;
    const [rows] = await db.query(
        `SELECT ${DATE_COLS} FROM pg_offers o WHERE o.pg_id IN (?) AND ${LIVE_SQL} ORDER BY o.sort_order ASC, o.created_at DESC`,
        [pgIds]
    );
    rows.forEach(r => { (out[r.pg_id] ||= []).push(shape(r)); });
    return out;
};

exports.create = async (pgId, d, adminId) => {
    const [r] = await db.execute(
        `INSERT INTO pg_offers (pg_id, title, description, offer_type, offer_value, badge_text, coupon_code, terms,
                                valid_from, valid_until, is_active, sort_order, created_by, updated_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [pgId, d.title, d.description, d.offer_type, d.offer_value, d.badge_text, d.coupon_code, d.terms,
         d.valid_from, d.valid_until, d.is_active ? 1 : 0, d.sort_order || 0, adminId || null, adminId || null]
    );
    return r.insertId;
};

exports.update = async (id, d, adminId) => {
    await db.execute(
        `UPDATE pg_offers SET title=?, description=?, offer_type=?, offer_value=?, badge_text=?, coupon_code=?, terms=?,
                valid_from=?, valid_until=?, is_active=?, sort_order=?, updated_by=? WHERE id=?`,
        [d.title, d.description, d.offer_type, d.offer_value, d.badge_text, d.coupon_code, d.terms,
         d.valid_from, d.valid_until, d.is_active ? 1 : 0, d.sort_order || 0, adminId || null, id]
    );
};

exports.setActive = async (id, active, adminId) => {
    await db.execute(`UPDATE pg_offers SET is_active=?, updated_by=? WHERE id=?`, [active ? 1 : 0, adminId || null, id]);
};

exports.remove = async (id) => {
    await db.execute(`DELETE FROM pg_offers WHERE id=?`, [id]);
};
