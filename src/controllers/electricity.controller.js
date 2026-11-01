const Electricity = require("../services/electricity.service");
const db = require("../config/db");

exports.listSettings = async (req, res) => {
    try { res.json({ success: true, data: await Electricity.getAllSettings() }); }
    catch (e) { console.error("Electricity list:", e); res.status(500).json({ success: false, message: "Could not load electricity settings." }); }
};

exports.getSettings = async (req, res) => {
    try {
        const pgId = parseInt(req.params.pgId, 10);
        const [r] = await db.execute("SELECT id, name FROM pgs WHERE id = ?", [pgId]);
        if (!r.length) return res.status(404).json({ success: false, message: "PG not found." });
        res.json({ success: true, data: { pg_name: r[0].name, ...(await Electricity.getSettings(pgId)) } });
    } catch (e) { console.error("Electricity get:", e); res.status(500).json({ success: false, message: "Could not load electricity settings." }); }
};

exports.saveSettings = async (req, res) => {
    try {
        const pgId = parseInt(req.params.pgId, 10);
        const [r] = await db.execute("SELECT id FROM pgs WHERE id = ?", [pgId]);
        if (!r.length) return res.status(404).json({ success: false, message: "PG not found." });
        const { errors, data } = Electricity.validateSettings(req.body || {});
        if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });
        await Electricity.saveSettings(pgId, data, req.admin.id);
        res.json({ success: true, message: "Electricity formula saved.", data: await Electricity.getSettings(pgId) });
    } catch (e) { console.error("Electricity save:", e); res.status(500).json({ success: false, message: "Could not save the formula." }); }
};

/** Copy one PG's formula onto other PGs (many PGs share the same tariff). */
exports.copySettings = async (req, res) => {
    try {
        const from = parseInt(req.params.pgId, 10);
        const targets = (Array.isArray(req.body.target_pg_ids) ? req.body.target_pg_ids : []).map(Number).filter(n => n > 0 && n !== from);
        if (!targets.length) return res.status(400).json({ success: false, message: "Choose at least one PG to copy to." });
        const src = await Electricity.getSettings(from);
        if (!src.configured) return res.status(400).json({ success: false, message: "Save a formula for the source PG first." });
        for (const id of targets) await Electricity.saveSettings(id, src, req.admin.id);
        res.json({ success: true, message: `Formula copied to ${targets.length} PG${targets.length === 1 ? "" : "s"}.` });
    } catch (e) { console.error("Electricity copy:", e); res.status(500).json({ success: false, message: "Could not copy the formula." }); }
};

exports.calculate = async (req, res) => {
    try {
        const b = req.body || {};
        const pgId = await Electricity.resolvePgId({ pgId: b.pg_id, roomId: b.room_id, tenantIds: b.tenant_id ? [b.tenant_id] : [] });
        if (!pgId) return res.status(400).json({ success: false, message: "Choose a PG or tenant first so the right tariff can be used." });
        const settings = await Electricity.getSettings(pgId);
        if (!settings.configured || !settings.is_active) {
            return res.status(409).json({ success: false, code: "NO_TARIFF", message: "No electricity formula is set for this PG yet. A Super Admin can set it under PGs → Electricity formula." });
        }
        const result = Electricity.calculate(settings, b.previous_reading, b.current_reading, { splitCount: b.split_count });
        res.json({ success: true, data: { pg_id: pgId, ...result } });
    } catch (e) {
        if (/reading|lower|valid/i.test(e.message)) return res.status(400).json({ success: false, message: e.message });
        console.error("Electricity calc:", e); res.status(500).json({ success: false, message: "Could not calculate the bill." });
    }
};

exports.lastReading = async (req, res) => {
    try {
        const data = await Electricity.lastReading({ tenantId: parseInt(req.query.tenant_id, 10) || null, roomId: parseInt(req.query.room_id, 10) || null });
        res.json({ success: true, data });
    } catch (e) { console.error("Last reading:", e); res.status(500).json({ success: false, message: "Could not fetch the last reading." }); }
};
