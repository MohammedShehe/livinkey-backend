/**
 * "Send this at most once every N hours" – race-safe, backed by notification_throttle.
 *   if (await claim("tenant", id, "document_reminder", 24 * 7)) { …send… }
 */
const db = require("../config/db");

const claim = async (userType, userId, kind, minHours) => {
    try {
        const [upd] = await db.execute(
            `UPDATE notification_throttle SET last_sent_at = NOW()
             WHERE user_type = ? AND user_id = ? AND kind = ? AND last_sent_at < DATE_SUB(NOW(), INTERVAL ? HOUR)`,
            [userType, userId, kind, Math.max(0, Math.floor(minHours))]
        );
        if (upd.affectedRows > 0) return true;
        const [ins] = await db.execute(
            `INSERT IGNORE INTO notification_throttle (user_type, user_id, kind, last_sent_at) VALUES (?, ?, ?, NOW())`,
            [userType, userId, kind]
        );
        return ins.affectedRows > 0;
    } catch (err) {
        // Never block a notification because the throttle table is unavailable.
        console.error("[throttle] claim failed, allowing send:", err.message);
        return true;
    }
};

module.exports = { claim };
