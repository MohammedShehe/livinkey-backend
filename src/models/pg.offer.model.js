const db = require("../config/db");

/**
 * Offers attached to a PG. An offer is "live" (visible on the public website
 * and in the guest app) when it is switched on AND today is inside its
 * optional valid_from / valid_until window.
 */
// An offer with an end date also has an end *time* (defaults to the very end of
// that day) so the apps can show a live "ends in 7h 20m" counter.
const END_AT = `TIMESTAMP(o.valid_until, COALESCE(o.valid_until_time, '23:59:59'))`;
const LIVE_SQL = `
    o.is_active = 1
    AND (o.valid_from IS NULL OR o.valid_from <= CURDATE())
    AND (o.valid_until IS NULL OR ${END_AT} >= NOW())
`;

/**
 * Price after the offer. Only percentage / flat offers change the price; "free"
 * and "custom" offers are perks and leave the rent alone.
 * Returns null when no price cut applies.
 */
function priceCut(type, value, rent) {
    const rentN = Number(rent), v = Number(value);
    if (!(rentN > 0) || !(v > 0)) return null;
    let off = 0;
    if (type === "percent") off = (rentN * Math.min(v, 100)) / 100;
    else if (type === "flat") off = v;
    else return null;
    off = Math.min(Math.round(off), rentN);
    if (off <= 0) return null;
    return { original_price: rentN, offer_price: rentN - off, discount_amount: off };
}

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
    pg_rent: r.pg_rent === null || r.pg_rent === undefined ? null : Number(r.pg_rent),
    valid_until_time: r.valid_until_time ? String(r.valid_until_time).slice(0, 5) : null,
    is_live: r.is_live === undefined ? undefined : !!r.is_live,
    sort_order: Number(r.sort_order || 0),
    created_at: r.created_at,
    updated_at: r.updated_at,
    // Convenience label used by every client so they all show the same wording
    headline: headline(r),
    // Price strike-through: show original_price crossed out and offer_price as the new price
    ...(() => {
        const c = priceCut(r.offer_type, r.offer_value, r.pg_rent);
        return c ? { has_price_cut: true, ...c } : { has_price_cut: false, original_price: null, offer_price: null, discount_amount: null };
    })(),
    // Countdown. seconds_left comes from the database clock, so it is correct
    // whatever the phone/browser clock says. null = no end date (no counter).
    seconds_left: r.seconds_left === null || r.seconds_left === undefined ? null : Math.max(0, Number(r.seconds_left)),
    ends_at_label: r.valid_until ? `${String(r.valid_until).slice(0, 10)} ${r.valid_until_time ? String(r.valid_until_time).slice(0, 5) : "23:59"}` : null
});

/** Best deal first: biggest price cut, then the admin's own ordering. */
const bestFirst = (list) => list.slice().sort((a, b) => {
    const da = a.discount_amount || 0, db_ = b.discount_amount || 0;
    if (da !== db_) return db_ - da;
    return (a.sort_order - b.sort_order);
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
    TIME_FORMAT(o.valid_until_time,'%H:%i') AS valid_until_time,
    (SELECT rent FROM pgs WHERE id = o.pg_id) AS pg_rent,
    CASE WHEN o.valid_until IS NULL THEN NULL ELSE TIMESTAMPDIFF(SECOND, NOW(), ${END_AT}) END AS seconds_left,
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
    return bestFirst(rows.map(shape));
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
    Object.keys(out).forEach(k => { out[k] = bestFirst(out[k]); });
    return out;
};

exports.create = async (pgId, d, adminId) => {
    const [r] = await db.execute(
        `INSERT INTO pg_offers (pg_id, title, description, offer_type, offer_value, badge_text, coupon_code, terms,
                                valid_from, valid_until, valid_until_time, is_active, sort_order, created_by, updated_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [pgId, d.title, d.description, d.offer_type, d.offer_value, d.badge_text, d.coupon_code, d.terms,
         d.valid_from, d.valid_until, d.valid_until_time || null, d.is_active ? 1 : 0, d.sort_order || 0, adminId || null, adminId || null]
    );
    return r.insertId;
};

exports.update = async (id, d, adminId) => {
    await db.execute(
        `UPDATE pg_offers SET title=?, description=?, offer_type=?, offer_value=?, badge_text=?, coupon_code=?, terms=?,
                valid_from=?, valid_until=?, valid_until_time=?, is_active=?, sort_order=?, updated_by=? WHERE id=?`,
        [d.title, d.description, d.offer_type, d.offer_value, d.badge_text, d.coupon_code, d.terms,
         d.valid_from, d.valid_until, d.valid_until_time || null, d.is_active ? 1 : 0, d.sort_order || 0, adminId || null, id]
    );
};

exports.setActive = async (id, active, adminId) => {
    await db.execute(`UPDATE pg_offers SET is_active=?, updated_by=? WHERE id=?`, [active ? 1 : 0, adminId || null, id]);
};

exports.remove = async (id) => {
    await db.execute(`DELETE FROM pg_offers WHERE id=?`, [id]);
};

exports.priceCut = priceCut;
