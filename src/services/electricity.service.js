/**
 * Electricity bill calculator.
 *
 * Every PG can have its own tariff:
 *   billing_mode  flat -> units x rate_per_unit
 *                 slab -> each block of units charged at its own rate
 *                         (slabs = [{ upto: 100, rate: 5 }, { upto: 300, rate: 7 }, { upto: null, rate: 9 }])
 *   multiplier    meter multiplying factor (MF / CT ratio), usually 1
 *   fixed_charge  fixed monthly charge added once per meter
 *   min_charge    the bill never goes below this (applied before tax)
 *   tax_percent   electricity duty / GST etc. on top
 *   round_to_rupee  round the final amount to a whole rupee
 *
 * An admin only types the previous and current meter readings.
 */
const db = require("../config/db");

const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function normaliseSlabs(raw) {
    let slabs = raw;
    if (typeof slabs === "string") { try { slabs = JSON.parse(slabs); } catch (_) { slabs = []; } }
    if (!Array.isArray(slabs)) return [];
    return slabs
        .map(s => ({ upto: s.upto === null || s.upto === "" || s.upto === undefined ? null : Number(s.upto), rate: Number(s.rate) }))
        .filter(s => isFinite(s.rate) && s.rate >= 0 && (s.upto === null || (isFinite(s.upto) && s.upto > 0)))
        .sort((a, b) => (a.upto === null ? Infinity : a.upto) - (b.upto === null ? Infinity : b.upto));
}

/** Validates + cleans a settings payload. Returns { errors, data }. */
function validateSettings(b) {
    const errors = [];
    const billing_mode = b.billing_mode === "slab" ? "slab" : "flat";
    const num = (v, def = 0) => (v === "" || v === undefined || v === null ? def : Number(v));
    const rate_per_unit = num(b.rate_per_unit);
    const fixed_charge = num(b.fixed_charge);
    const min_charge = num(b.min_charge);
    const multiplier = num(b.multiplier, 1);
    const tax_percent = num(b.tax_percent);
    if (![rate_per_unit, fixed_charge, min_charge, multiplier, tax_percent].every(isFinite)) errors.push("All values must be numbers.");
    if (rate_per_unit < 0 || fixed_charge < 0 || min_charge < 0) errors.push("Rates and charges cannot be negative.");
    if (multiplier <= 0 || multiplier > 1000) errors.push("The meter multiplier must be more than 0 (usually 1).");
    if (tax_percent < 0 || tax_percent > 100) errors.push("Tax must be between 0 and 100%.");
    let slabs = [];
    if (billing_mode === "slab") {
        slabs = normaliseSlabs(b.slabs);
        if (!slabs.length) errors.push("Add at least one slab (units up to … at rate …).");
        else if (slabs[slabs.length - 1].upto !== null) errors.push("The last slab must have no upper limit (\"and above\").");
        const uptos = slabs.filter(s => s.upto !== null).map(s => s.upto);
        if (new Set(uptos).size !== uptos.length) errors.push("Two slabs cannot end at the same unit.");
    } else if (!(rate_per_unit > 0)) errors.push("Enter the cost per unit (₹ per unit).");
    return {
        errors,
        data: {
            billing_mode, rate_per_unit, slabs, fixed_charge, min_charge, multiplier, tax_percent,
            round_to_rupee: b.round_to_rupee === undefined ? 1 : (b.round_to_rupee === true || b.round_to_rupee === 1 || b.round_to_rupee === "1" || b.round_to_rupee === "true" ? 1 : 0),
            is_active: b.is_active === undefined ? 1 : (b.is_active === true || b.is_active === 1 || b.is_active === "1" || b.is_active === "true" ? 1 : 0)
        }
    };
}

/** Pure calculation – used by the API, the bill creator and unit tests. */
function calculate(settings, previous, current, { splitCount = 1 } = {}) {
    const prev = Number(previous), cur = Number(current);
    if (!isFinite(prev) || !isFinite(cur) || prev < 0 || cur < 0) throw new Error("Meter readings must be valid numbers.");
    if (cur < prev) throw new Error("The current reading cannot be lower than the previous reading.");
    const multiplier = Number(settings.multiplier || 1);
    const rawUnits = cur - prev;
    const units = r2(rawUnits * multiplier);

    let energy = 0;
    const lines = [];
    if (settings.billing_mode === "slab") {
        const slabs = normaliseSlabs(settings.slabs);
        let from = 0, left = units;
        for (const s of slabs) {
            if (left <= 0) break;
            const cap = s.upto === null ? Infinity : s.upto - from;
            const used = Math.min(left, cap);
            if (used > 0) { lines.push({ label: `${r2(from)}–${s.upto === null ? "above" : s.upto} units`, units: r2(used), rate: s.rate, amount: r2(used * s.rate) }); energy += used * s.rate; }
            left -= used; from = s.upto === null ? from : s.upto;
        }
    } else {
        energy = units * Number(settings.rate_per_unit || 0);
        lines.push({ label: "Energy charge", units, rate: Number(settings.rate_per_unit || 0), amount: r2(energy) });
    }
    energy = r2(energy);

    const fixed = r2(settings.fixed_charge || 0);
    let subtotal = r2(energy + fixed);
    const min = r2(settings.min_charge || 0);
    let minApplied = false;
    if (min > 0 && subtotal < min) { subtotal = min; minApplied = true; }
    const tax = r2(subtotal * (Number(settings.tax_percent || 0) / 100));
    let total = r2(subtotal + tax);
    if (Number(settings.round_to_rupee)) total = Math.round(total);

    const split = Math.max(1, parseInt(splitCount, 10) || 1);
    return {
        previous: prev, current: cur, raw_units: r2(rawUnits), multiplier, units,
        energy_charge: energy, fixed_charge: fixed, min_charge_applied: minApplied, min_charge: min,
        subtotal, tax_percent: Number(settings.tax_percent || 0), tax, total,
        split_count: split, per_person: split > 1 ? r2(total / split) : total,
        effective_rate: units > 0 ? r2(total / units) : 0,
        lines
    };
}

const DEFAULTS = { billing_mode: "flat", rate_per_unit: 0, slabs: [], fixed_charge: 0, min_charge: 0, multiplier: 1, tax_percent: 0, round_to_rupee: 1, is_active: 1 };

async function getSettings(pgId) {
    const [rows] = await db.execute("SELECT * FROM pg_electricity_settings WHERE pg_id = ? LIMIT 1", [pgId]);
    if (!rows.length) return { ...DEFAULTS, pg_id: Number(pgId), configured: false };
    const r = rows[0];
    return {
        pg_id: r.pg_id, configured: true, billing_mode: r.billing_mode,
        rate_per_unit: Number(r.rate_per_unit), slabs: normaliseSlabs(r.slabs),
        fixed_charge: Number(r.fixed_charge), min_charge: Number(r.min_charge), multiplier: Number(r.multiplier),
        tax_percent: Number(r.tax_percent), round_to_rupee: Number(r.round_to_rupee), is_active: Number(r.is_active),
        updated_at: r.updated_at
    };
}

async function getAllSettings() {
    const [pgs] = await db.execute("SELECT id, name, is_active FROM pgs ORDER BY name");
    const [rows] = await db.execute("SELECT * FROM pg_electricity_settings");
    const map = new Map(rows.map(r => [r.pg_id, r]));
    return pgs.map(p => {
        const r = map.get(p.id);
        const base = r ? {
            configured: true, billing_mode: r.billing_mode, rate_per_unit: Number(r.rate_per_unit), slabs: normaliseSlabs(r.slabs),
            fixed_charge: Number(r.fixed_charge), min_charge: Number(r.min_charge), multiplier: Number(r.multiplier),
            tax_percent: Number(r.tax_percent), round_to_rupee: Number(r.round_to_rupee), is_active: Number(r.is_active), updated_at: r.updated_at
        } : { ...DEFAULTS, configured: false };
        return { pg_id: p.id, pg_name: p.name, pg_active: !!p.is_active, ...base };
    });
}

async function saveSettings(pgId, data, adminId) {
    await db.execute(
        `INSERT INTO pg_electricity_settings
           (pg_id, billing_mode, rate_per_unit, slabs, fixed_charge, min_charge, multiplier, tax_percent, round_to_rupee, is_active, updated_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE billing_mode=VALUES(billing_mode), rate_per_unit=VALUES(rate_per_unit), slabs=VALUES(slabs),
           fixed_charge=VALUES(fixed_charge), min_charge=VALUES(min_charge), multiplier=VALUES(multiplier), tax_percent=VALUES(tax_percent),
           round_to_rupee=VALUES(round_to_rupee), is_active=VALUES(is_active), updated_by=VALUES(updated_by)`,
        [pgId, data.billing_mode, data.rate_per_unit, JSON.stringify(data.slabs || []), data.fixed_charge, data.min_charge,
         data.multiplier, data.tax_percent, data.round_to_rupee, data.is_active, adminId || null]
    );
}

/**
 * Last known meter reading for a tenant (or a whole room), so the bill form can
 * pre-fill "previous reading" and the admin only types the new one.
 */
async function lastReading({ tenantId, roomId }) {
    let rows;
    if (roomId) {
        [rows] = await db.execute(
            `SELECT current_reading, billing_month FROM bills WHERE room_id = ? AND current_reading IS NOT NULL AND deleted_at IS NULL
             ORDER BY created_at DESC, id DESC LIMIT 1`, [roomId]);
    } else if (tenantId) {
        [rows] = await db.execute(
            `SELECT current_reading, billing_month FROM bills WHERE tenant_id = ? AND current_reading IS NOT NULL AND deleted_at IS NULL
             ORDER BY created_at DESC, id DESC LIMIT 1`, [tenantId]);
    } else rows = [];
    return rows[0] ? { reading: Number(rows[0].current_reading), billing_month: rows[0].billing_month } : null;
}

/** Resolve the PG a bill is being created for. */
async function resolvePgId({ pgId, roomId, tenantIds }) {
    if (pgId) return Number(pgId);
    if (roomId) {
        const [r] = await db.execute("SELECT f.pg_id FROM rooms r JOIN floors f ON f.id = r.floor_id WHERE r.id = ? LIMIT 1", [roomId]);
        if (r[0]) return r[0].pg_id;
    }
    if (tenantIds && tenantIds.length) {
        const [r] = await db.execute("SELECT pg_id FROM tenant_details WHERE tenant_id = ? LIMIT 1", [tenantIds[0]]);
        if (r[0]) return r[0].pg_id;
    }
    return null;
}

module.exports = { calculate, validateSettings, getSettings, getAllSettings, saveSettings, lastReading, resolvePgId, normaliseSlabs, r2 };
