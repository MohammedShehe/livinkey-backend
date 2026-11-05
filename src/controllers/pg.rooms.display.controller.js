const db = require("../config/db");

/**
 * Manual room counts for a PG.
 * By default the website and guest app show the live room data. An admin can
 * switch on "manual" and type the numbers that visitors should see instead
 * (same idea as the manual Properties / Happy Tenants counters).
 */
async function realCounts(pgId) {
    const [r] = await db.execute(
        `SELECT COUNT(r.id) AS total_rooms,
                SUM(CASE WHEN COALESCE(ro.occupied_count,0) = 0 THEN 1 ELSE 0 END) AS vacant_rooms
         FROM floors f
         JOIN rooms r ON f.id = r.floor_id AND r.is_active = 1
         LEFT JOIN room_occupancy ro ON r.id = ro.room_id
         WHERE f.pg_id = ?`, [pgId]);
    return { total_rooms: Number(r[0].total_rooms) || 0, vacant_rooms: Number(r[0].vacant_rooms) || 0 };
}

exports.get = async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT id, name, manual_rooms_enabled, manual_total_rooms, manual_vacant_rooms FROM pgs WHERE id = ? LIMIT 1", [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: "PG not found." });
        const p = rows[0];
        res.json({
            success: true,
            data: {
                pg_id: p.id, pg_name: p.name,
                manual_enabled: Number(p.manual_rooms_enabled) === 1,
                manual_total_rooms: p.manual_total_rooms,
                manual_vacant_rooms: p.manual_vacant_rooms,
                real: await realCounts(p.id)
            }
        });
    } catch (e) { console.error("Room display get:", e); res.status(500).json({ success: false, message: "Could not load room counts." }); }
};

exports.save = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT id FROM pgs WHERE id = ? LIMIT 1", [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: "PG not found." });
        const b = req.body || {};
        const enabled = b.manual_enabled === true || b.manual_enabled === 1 || b.manual_enabled === "1" || b.manual_enabled === "true";
        const toInt = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
        const total = toInt(b.manual_total_rooms), vacant = toInt(b.manual_vacant_rooms);
        if (enabled) {
            if (total === null || vacant === null || !Number.isInteger(total) || !Number.isInteger(vacant))
                return res.status(400).json({ success: false, message: "Enter whole numbers for total rooms and vacant rooms." });
            if (total < 0 || vacant < 0 || total > 10000) return res.status(400).json({ success: false, message: "Room counts cannot be negative." });
            if (vacant > total) return res.status(400).json({ success: false, message: "Vacant rooms cannot be more than total rooms." });
        }
        await db.execute(
            "UPDATE pgs SET manual_rooms_enabled = ?, manual_total_rooms = ?, manual_vacant_rooms = ? WHERE id = ?",
            [enabled ? 1 : 0, enabled ? total : (Number.isInteger(total) && total >= 0 ? total : null), enabled ? vacant : (Number.isInteger(vacant) && vacant >= 0 ? vacant : null), req.params.id]);
        res.json({ success: true, message: enabled ? "Visitors will now see the room counts you entered." : "Visitors will see the live room counts." });
    } catch (e) { console.error("Room display save:", e); res.status(500).json({ success: false, message: "Could not save room counts." }); }
};
