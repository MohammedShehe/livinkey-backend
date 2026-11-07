/**
 * maintenance_forwards – a log of every time an admin forwarded a maintenance request to a phone number
 * (plumber, electrician, caretaker ...), including whether it was delivered.
 */
const db = require("../config/db");

const RANK = { queued: 0, sent: 1, delivered: 2, read: 3 };

const create = async ({ request_id, admin_id = null, to_phone, to_name = null, note = null }) => {
    const [r] = await db.execute(
        `INSERT INTO maintenance_forwards (request_id, admin_id, to_phone, to_name, note, status) VALUES (?, ?, ?, ?, ?, 'queued')`,
        [request_id, admin_id, to_phone, to_name ? String(to_name).slice(0, 120) : null, note ? String(note).slice(0, 500) : null]
    );
    return r.insertId;
};

const findById = async (id) => {
    const [rows] = await db.execute(`SELECT * FROM maintenance_forwards WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
};

const update = async (id, d) => {
    const f = [], p = [];
    if (d.channel !== undefined) { f.push("channel = ?"); p.push(d.channel); }
    if (d.status !== undefined) { f.push("status = ?"); p.push(d.status); }
    if (d.error_message !== undefined) { f.push("error_message = ?"); p.push(d.error_message ? String(d.error_message).slice(0, 500) : null); }
    if (!f.length) return;
    p.push(id);
    await db.execute(`UPDATE maintenance_forwards SET ${f.join(", ")} WHERE id = ?`, p);
};

/** Move the status forward only (a late "sent" callback must not undo "delivered"). */
const advance = async (id, next) => {
    const row = await findById(id);
    if (!row) return;
    if (next === "failed") { if (!["delivered", "read"].includes(row.status)) await update(id, { status: "failed" }); return; }
    if ((RANK[next] ?? 0) > (RANK[row.status] ?? 0)) await update(id, { status: next, error_message: null });
};

const listByRequest = async (requestId, limit = 20) => {
    const [rows] = await db.execute(
        `SELECT f.id, f.request_id, f.to_phone, f.to_name, f.note, f.channel, f.status, f.error_message, f.created_at, a.name AS admin_name
         FROM maintenance_forwards f LEFT JOIN admins a ON a.id = f.admin_id
         WHERE f.request_id = ? ORDER BY f.id DESC LIMIT ${Math.max(1, Math.min(50, Number(limit) || 20))}`,
        [requestId]
    );
    return rows;
};

/** Numbers admins forwarded to recently (for one-tap re-use in the UI). */
const recentRecipients = async (limit = 8) => {
    const [rows] = await db.execute(
        `SELECT to_phone, MAX(to_name) AS to_name, MAX(created_at) AS last_used, COUNT(*) AS times
         FROM maintenance_forwards GROUP BY to_phone ORDER BY last_used DESC LIMIT ${Math.max(1, Math.min(20, Number(limit) || 8))}`
    );
    return rows;
};

module.exports = { create, findById, update, advance, listByRequest, recentRecipients };
