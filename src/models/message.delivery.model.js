/**
 * message_deliveries – one row per logical outbound message, tracking which channel
 * (WhatsApp → SMS → e-mail) it is currently on and what is left to try if that channel fails.
 */
const db = require("../config/db");

const RANK = { queued: 0, sent: 1, delivered: 2, read: 3, failed: -1 };

const create = async (d) => {
    const [r] = await db.execute(
        `INSERT INTO message_deliveries
         (message_id, forward_id, channel, status, external_id, pending_chain, attempts, error_code, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            d.message_id || null,
            d.forward_id || null,
            d.channel,
            d.status || "queued",
            d.external_id || null,
            d.pending_chain || null,
            JSON.stringify(d.attempts || []),
            d.error_code ? String(d.error_code).slice(0, 20) : null,
            d.error_message ? String(d.error_message).slice(0, 500) : null,
        ]
    );
    return r.insertId;
};

const findByExternalId = async (sid) => {
    if (!sid) return null;
    const [rows] = await db.execute(`SELECT * FROM message_deliveries WHERE external_id = ? ORDER BY id DESC LIMIT 1`, [sid]);
    return rows[0] || null;
};

const findById = async (id) => {
    const [rows] = await db.execute(`SELECT * FROM message_deliveries WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
};

const update = async (id, d) => {
    const f = [], p = [];
    const set = (col, v) => { f.push(`${col} = ?`); p.push(v); };
    if (d.channel !== undefined) set("channel", d.channel);
    if (d.status !== undefined) set("status", d.status);
    if (d.external_id !== undefined) set("external_id", d.external_id);
    if (d.pending_chain !== undefined) set("pending_chain", d.pending_chain);
    if (d.attempts !== undefined) set("attempts", JSON.stringify(d.attempts));
    if (d.error_code !== undefined) set("error_code", d.error_code ? String(d.error_code).slice(0, 20) : null);
    if (d.error_message !== undefined) set("error_message", d.error_message ? String(d.error_message).slice(0, 500) : null);
    if (!f.length) return;
    p.push(id);
    await db.execute(`UPDATE message_deliveries SET ${f.join(", ")} WHERE id = ?`, p);
};

/**
 * Atomically "claim" the right to run the next fallback step for this delivery, so two
 * duplicate Twilio callbacks can never trigger two SMS/e-mails. Returns true for exactly one caller.
 */
const claimFallback = async (id, expectedSid) => {
    const [r] = await db.execute(
        `UPDATE message_deliveries SET status = 'failed'
         WHERE id = ? AND external_id = ? AND status <> 'failed' AND status <> 'delivered' AND status <> 'read'`,
        [id, expectedSid]
    );
    return r.affectedRows === 1;
};

module.exports = { create, findByExternalId, findById, update, claimFallback, RANK };
