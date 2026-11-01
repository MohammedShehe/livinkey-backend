/**
 * GET /api/admins/analytics?pg_id=<id|all>&period=<key>
 *
 * PG-wise analytics for the admin dashboard. Everything is scoped to the chosen
 * PG (or all PGs) and period, permission-aware, and each block is fetched
 * independently so one failing query never blanks the whole dashboard.
 */
const db = require("../config/db");
const { BILL_PG_JOINS, BILL_PG_EXPR, parsePgId } = require("../utils/pg.scope");

const safe = async (fn, fallback = null) => { try { return await fn(); } catch (e) { console.error("[dashboard]", e.message); return fallback; } };
const many = async (sql, params = []) => { const [r] = await db.query(sql, params); return r; };
const one = async (sql, params = []) => (await many(sql, params))[0] || {};
const num = (v) => Number(v || 0);
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

function resolvePeriod(key) {
    const now = new Date();
    const first = (y, m) => new Date(y, m, 1);
    const last = (y, m) => new Date(y, m + 1, 0);
    switch (key) {
        case "last_month": { const f = first(now.getFullYear(), now.getMonth() - 1), t = last(now.getFullYear(), now.getMonth() - 1); return { key, label: f.toLocaleString("en-IN", { month: "long", year: "numeric" }), from: ymd(f), to: ymd(t) }; }
        case "last_3m": { const f = first(now.getFullYear(), now.getMonth() - 2); return { key, label: "Last 3 months", from: ymd(f), to: ymd(now) }; }
        case "last_6m": { const f = first(now.getFullYear(), now.getMonth() - 5); return { key, label: "Last 6 months", from: ymd(f), to: ymd(now) }; }
        case "this_year": { const f = first(now.getFullYear(), 0); return { key, label: `${now.getFullYear()}`, from: ymd(f), to: ymd(now) }; }
        case "all": return { key, label: "All time", from: "2000-01-01", to: ymd(now) };
        default: { const f = first(now.getFullYear(), now.getMonth()); return { key: "this_month", label: "This month", from: ymd(f), to: ymd(now) }; }
    }
}

async function permittedModules(admin) {
    if (admin.role === "super_admin") return null;
    const rows = await many("SELECT module_name FROM admin_permissions WHERE admin_id = ? AND can_view = 1", [admin.id]);
    return new Set(rows.map(r => r.module_name));
}

exports.getDashboard = async (req, res) => {
    try {
        const allowed = await permittedModules(req.admin);
        const can = (m) => allowed === null || allowed.has(m);
        const pgId = parsePgId(req.query.pg_id);
        const period = resolvePeriod(req.query.period);
        const out = { generated_at: new Date().toISOString(), role: req.admin.role, period };

        const pgs = await many("SELECT id, name, is_active FROM pgs ORDER BY name");
        out.pg_options = pgs.map(p => ({ id: p.id, name: p.name, is_active: !!p.is_active }));
        if (pgId) {
            const found = pgs.find(p => p.id === pgId);
            if (!found) return res.status(404).json({ success: false, message: "That PG was not found." });
            out.scope = { pg_id: pgId, pg_name: found.name };
        } else out.scope = { pg_id: null, pg_name: "All PGs" };

        // Reusable scope pieces ------------------------------------------------
        const tPg = pgId ? " AND td.pg_id = ?" : "";
        const tP = pgId ? [pgId] : [];
        const bPg = pgId ? ` AND ${BILL_PG_EXPR} = ?` : "";
        const bP = pgId ? [pgId] : [];
        const jobs = [];

        // ---- Occupancy ---------------------------------------------------------
        if (can("pgs")) jobs.push(safe(async () => {
            const rows = await many(`
                SELECT p.id, p.name, p.is_active,
                       COUNT(DISTINCT r.id) AS rooms,
                       COALESCE(SUM(r.capacity),0) AS capacity,
                       COALESCE(SUM(ro.occupied_count),0) AS occupied,
                       COUNT(DISTINCT CASE WHEN COALESCE(ro.occupied_count,0) >= r.capacity THEN r.id END) AS rooms_full,
                       COUNT(DISTINCT CASE WHEN COALESCE(ro.occupied_count,0) = 0 THEN r.id END) AS rooms_empty
                FROM pgs p
                LEFT JOIN floors f ON f.pg_id = p.id AND f.deleted_at IS NULL
                LEFT JOIN rooms r ON r.floor_id = f.id AND r.is_active = 1 AND r.deleted_at IS NULL
                LEFT JOIN room_occupancy ro ON ro.room_id = r.id
                ${pgId ? "WHERE p.id = ?" : ""}
                GROUP BY p.id, p.name, p.is_active ORDER BY p.name`, pgId ? [pgId] : []);
            const cap = rows.reduce((a, x) => a + num(x.capacity), 0);
            const occ = rows.reduce((a, x) => a + num(x.occupied), 0);
            out.occupancy = {
                capacity: cap, occupied: occ, vacant: Math.max(cap - occ, 0), pct: pct(occ, cap),
                rooms: rows.reduce((a, x) => a + num(x.rooms), 0),
                rooms_full: rows.reduce((a, x) => a + num(x.rooms_full), 0),
                rooms_empty: rows.reduce((a, x) => a + num(x.rooms_empty), 0),
                list: rows.map(x => ({ id: x.id, name: x.name, is_active: !!x.is_active, capacity: num(x.capacity), occupied: num(x.occupied), pct: pct(num(x.occupied), num(x.capacity)) }))
            };
        }));

        // ---- Tenants -----------------------------------------------------------
        if (can("tenants")) jobs.push(safe(async () => {
            const r = await one(`
                SELECT
                  SUM(CASE WHEN t.status='active' AND t.is_active=1 THEN 1 ELSE 0 END) AS active,
                  SUM(CASE WHEN t.status='checked_out' THEN 1 ELSE 0 END) AS checked_out,
                  SUM(CASE WHEN t.status='active' AND t.is_active=1 AND td.residency='international' THEN 1 ELSE 0 END) AS international,
                  SUM(CASE WHEN t.status='active' AND t.is_active=1 AND td.residency='national' THEN 1 ELSE 0 END) AS national,
                  SUM(CASE WHEN t.status='active' AND t.is_active=1 AND t.gender='male' THEN 1 ELSE 0 END) AS male,
                  SUM(CASE WHEN t.status='active' AND t.is_active=1 AND t.gender='female' THEN 1 ELSE 0 END) AS female,
                  SUM(CASE WHEN t.status='active' AND t.is_active=1 AND td.has_vehicle=1 THEN 1 ELSE 0 END) AS with_vehicle,
                  SUM(CASE WHEN DATE(t.created_at) BETWEEN ? AND ? THEN 1 ELSE 0 END) AS joined,
                  SUM(CASE WHEN t.status='active' AND t.is_active=1 AND td.residency='international' AND td.efrro_till IS NOT NULL
                           AND td.efrro_till <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS efrro,
                  SUM(CASE WHEN t.status='active' AND t.is_active=1 AND td.paid_till IS NOT NULL
                           AND td.paid_till BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS rent_due_soon
                FROM tenants t JOIN tenant_details td ON td.tenant_id = t.id
                WHERE t.role='tenant' ${tPg}`, [period.from, period.to, ...tP]);
            out.tenants = {
                active: num(r.active), checked_out: num(r.checked_out), international: num(r.international), national: num(r.national),
                male: num(r.male), female: num(r.female), with_vehicle: num(r.with_vehicle), joined: num(r.joined),
                efrro_expiring_30d: num(r.efrro), rent_due_soon: num(r.rent_due_soon)
            };
        }));

        if (can("guests")) jobs.push(safe(async () => {
            const r = await one(`SELECT COUNT(*) AS total, SUM(DATE(created_at) BETWEEN ? AND ?) AS joined FROM tenants WHERE role='guest'`, [period.from, period.to]);
            out.guests = { total: num(r.total), joined: num(r.joined) };
        }));

        // ---- Billing & collections --------------------------------------------
        if (can("bills")) {
            jobs.push(safe(async () => {
                const m1 = period.from.slice(0, 7), m2 = period.to.slice(0, 7);
                const b = await one(`
                    SELECT COALESCE(SUM(b.total_amount),0) AS billed,
                           COUNT(*) AS bill_count,
                           COALESCE(SUM(b.electricity_amount),0) AS electricity,
                           COALESCE(SUM(b.units_consumed),0) AS units
                    FROM bills b ${BILL_PG_JOINS}
                    WHERE b.deleted_at IS NULL AND b.billing_month BETWEEN ? AND ? ${bPg}`, [m1, m2, ...bP]);
                const c = await one(`
                    SELECT COALESCE(SUM(bp.amount),0) AS collected, COUNT(*) AS txns
                    FROM bill_payments bp JOIN bills b ON b.id = bp.bill_id ${BILL_PG_JOINS}
                    WHERE b.deleted_at IS NULL AND bp.payment_date >= ? AND bp.payment_date < DATE_ADD(?, INTERVAL 1 DAY) ${bPg}`, [period.from, period.to, ...bP]);
                const o = await one(`
                    SELECT COALESCE(SUM(GREATEST(b.total_amount + COALESCE(b.fine_amount,0) - COALESCE(b.paid_amount,0),0)),0) AS outstanding,
                           COALESCE(SUM(COALESCE(b.fine_amount,0)),0) AS fines,
                           SUM(b.status='paid') AS paid, SUM(b.status='partially_paid') AS partially_paid,
                           SUM(b.status='unpaid') AS unpaid, SUM(b.status IN ('overdue','delayed')) AS overdue
                    FROM bills b ${BILL_PG_JOINS}
                    WHERE b.deleted_at IS NULL AND b.status <> 'paid' ${bPg}`, bP);
                const st = await one(`
                    SELECT SUM(b.status='paid') AS paid, SUM(b.status='partially_paid') AS partially_paid,
                           SUM(b.status='unpaid') AS unpaid, SUM(b.status IN ('overdue','delayed')) AS overdue
                    FROM bills b ${BILL_PG_JOINS}
                    WHERE b.deleted_at IS NULL AND b.billing_month BETWEEN ? AND ? ${bPg}`, [m1, m2, ...bP]);
                out.billing = {
                    billed: num(b.billed), bill_count: num(b.bill_count), collected: num(c.collected), payments: num(c.txns),
                    collection_rate: pct(num(c.collected), num(b.billed)),
                    outstanding: num(o.outstanding), fines_outstanding: num(o.fines), overdue_bills: num(o.overdue),
                    electricity_billed: num(b.electricity), units_consumed: num(b.units),
                    status: { paid: num(st.paid), partially_paid: num(st.partially_paid), unpaid: num(st.unpaid), overdue: num(st.overdue) }
                };
            }));
            jobs.push(safe(async () => {
                const r = await one(`SELECT COUNT(*) AS c FROM payment_proofs pp JOIN bills b ON b.id = pp.bill_id ${BILL_PG_JOINS}
                                     WHERE pp.status='pending' ${bPg}`, bP);
                out.proofs = { pending: num(r.c) };
            }));
            jobs.push(safe(async () => {
                const rows = await many(`
                    SELECT t.id AS tenant_id, t.full_name, p.name AS pg_name, rm.room_number,
                           SUM(GREATEST(b.total_amount + COALESCE(b.fine_amount,0) - COALESCE(b.paid_amount,0),0)) AS due,
                           MIN(b.valid_until) AS oldest_due
                    FROM bills b ${BILL_PG_JOINS}
                    JOIN tenants t ON t.id = b.tenant_id
                    LEFT JOIN pgs p ON p.id = ${BILL_PG_EXPR}
                    LEFT JOIN rooms rm ON rm.id = COALESCE(b.room_id, _btd.room_id)
                    WHERE b.deleted_at IS NULL AND b.status <> 'paid' ${bPg}
                    GROUP BY t.id, t.full_name, p.name, rm.room_number
                    HAVING due > 0 ORDER BY due DESC LIMIT 6`, bP);
                out.top_dues = rows.map(r => ({ tenant_id: r.tenant_id, name: r.full_name, pg_name: r.pg_name, room: r.room_number, due: num(r.due), oldest_due: r.oldest_due }));
            }));
        }

        // ---- 12-month trend: billed vs collected vs expenses ----------------
        if (can("bills") || can("expenses")) jobs.push(safe(async () => {
            const months = []; const now = new Date();
            for (let i = 11; i >= 0; i--) months.push(ym(new Date(now.getFullYear(), now.getMonth() - i, 1)));
            const start = months[0] + "-01";
            const trend = {}; months.forEach(m => { trend[m] = { month: m, billed: 0, collected: 0, expenses: 0 }; });
            if (can("bills")) {
                (await many(`SELECT b.billing_month AS m, SUM(b.total_amount) AS v FROM bills b ${BILL_PG_JOINS}
                             WHERE b.deleted_at IS NULL AND b.billing_month >= ? ${bPg} GROUP BY m`, [start.slice(0, 7), ...bP]))
                    .forEach(r => { if (trend[r.m]) trend[r.m].billed = num(r.v); });
                (await many(`SELECT DATE_FORMAT(bp.payment_date,'%Y-%m') AS m, SUM(bp.amount) AS v FROM bill_payments bp JOIN bills b ON b.id = bp.bill_id ${BILL_PG_JOINS}
                             WHERE bp.payment_date >= ? ${bPg} GROUP BY m`, [start, ...bP]))
                    .forEach(r => { if (trend[r.m]) trend[r.m].collected = num(r.v); });
            }
            if (can("expenses")) {
                (await many(`SELECT DATE_FORMAT(e.expense_date,'%Y-%m') AS m, SUM(e.amount) AS v FROM expenses e
                             WHERE e.deleted_at IS NULL AND e.expense_date >= ? ${pgId ? "AND e.pg_id = ?" : ""} GROUP BY m`, [start, ...(pgId ? [pgId] : [])]))
                    .forEach(r => { if (trend[r.m]) trend[r.m].expenses = num(r.v); });
            }
            out.trend = months.map(m => trend[m]);
        }));

        // ---- Expenses & profit --------------------------------------------------
        if (can("expenses")) jobs.push(safe(async () => {
            const ePg = pgId ? " AND e.pg_id = ?" : "";
            const eP = pgId ? [pgId] : [];
            const t = await one(`SELECT COALESCE(SUM(e.amount),0) AS total, COUNT(*) AS cnt FROM expenses e
                                 WHERE e.deleted_at IS NULL AND e.expense_date BETWEEN ? AND ? ${ePg}`, [period.from, period.to, ...eP]);
            const cats = await many(`SELECT e.category, SUM(e.amount) AS total FROM expenses e
                                     WHERE e.deleted_at IS NULL AND e.expense_date BETWEEN ? AND ? ${ePg} GROUP BY e.category ORDER BY total DESC LIMIT 5`, [period.from, period.to, ...eP]);
            out.expenses = { total: num(t.total), count: num(t.cnt), top_categories: cats.map(c => ({ category: c.category, total: num(c.total) })) };
        }));

        // ---- Maintenance -------------------------------------------------------
        if (can("maintenance")) jobs.push(safe(async () => {
            const r = await one(`
                SELECT SUM(m.status='pending') AS pending, SUM(m.status='in_progress') AS in_progress,
                       SUM(m.status='completed' AND DATE(m.updated_at) BETWEEN ? AND ?) AS completed
                FROM maintenance_requests m
                LEFT JOIN rooms mr ON mr.id = m.room_id LEFT JOIN floors mf ON mf.id = mr.floor_id
                WHERE 1=1 ${pgId ? "AND mf.pg_id = ?" : ""}`, [period.from, period.to, ...(pgId ? [pgId] : [])]);
            out.maintenance = { pending: num(r.pending), in_progress: num(r.in_progress), completed: num(r.completed) };
        }));

        // ---- Feedback ----------------------------------------------------------
        if (can("feedbacks")) jobs.push(safe(async () => {
            const w = pgId ? "WHERE pg_id = ?" : ""; const p = pgId ? [pgId] : [];
            const a = await one(`SELECT COUNT(*) AS c, AVG(overall_rating) AS r FROM tenant_feedbacks ${w}`, p);
            const b = await safe(() => one(`SELECT COUNT(*) AS c, AVG(overall_rating) AS r FROM public_feedbacks ${w}`, p), { c: 0, r: 0 });
            const total = num(a.c) + num(b.c);
            const avg = total ? (num(a.r) * num(a.c) + num(b.r) * num(b.c)) / total : 0;
            out.feedback = { total, avg_rating: Math.round(avg * 10) / 10 };
        }));

        // ---- Documents ---------------------------------------------------------
        if (can("documents")) jobs.push(safe(async () => {
            const r = await one(`
                SELECT SUM(d.review_status='pending') AS pending, SUM(d.review_status='rejected') AS rejected,
                       SUM(d.review_status='approved') AS approved
                FROM tenant_documents d JOIN tenant_details td ON td.tenant_id = d.tenant_id
                WHERE d.deleted_at IS NULL ${tPg}`, tP);
            out.documents = { pending_review: num(r.pending), rejected: num(r.rejected), approved: num(r.approved) };
        }));

        // ---- PG comparison (shown when "All PGs") -----------------------------
        if (!pgId && (can("pgs") || can("bills"))) jobs.push(safe(async () => {
            const m1 = period.from.slice(0, 7), m2 = period.to.slice(0, 7);
            const base = await many(`
                SELECT p.id, p.name, p.is_active,
                       COALESCE(SUM(r.capacity),0) AS capacity, COALESCE(SUM(ro.occupied_count),0) AS occupied
                FROM pgs p LEFT JOIN floors f ON f.pg_id = p.id AND f.deleted_at IS NULL
                LEFT JOIN rooms r ON r.floor_id = f.id AND r.is_active = 1 AND r.deleted_at IS NULL
                LEFT JOIN room_occupancy ro ON ro.room_id = r.id GROUP BY p.id, p.name, p.is_active ORDER BY p.name`);
            const map = {}; base.forEach(x => { map[x.id] = { pg_id: x.id, name: x.name, is_active: !!x.is_active, capacity: num(x.capacity), occupied: num(x.occupied), collected: 0, billed: 0, outstanding: 0, expenses: 0 }; });
            if (can("bills")) {
                (await many(`SELECT ${BILL_PG_EXPR} AS pg, SUM(b.total_amount) AS v FROM bills b ${BILL_PG_JOINS}
                             WHERE b.deleted_at IS NULL AND b.billing_month BETWEEN ? AND ? GROUP BY pg`, [m1, m2])).forEach(r => { if (map[r.pg]) map[r.pg].billed = num(r.v); });
                (await many(`SELECT ${BILL_PG_EXPR} AS pg, SUM(bp.amount) AS v FROM bill_payments bp JOIN bills b ON b.id = bp.bill_id ${BILL_PG_JOINS}
                             WHERE b.deleted_at IS NULL AND bp.payment_date >= ? AND bp.payment_date < DATE_ADD(?, INTERVAL 1 DAY) GROUP BY pg`, [period.from, period.to])).forEach(r => { if (map[r.pg]) map[r.pg].collected = num(r.v); });
                (await many(`SELECT ${BILL_PG_EXPR} AS pg, SUM(GREATEST(b.total_amount + COALESCE(b.fine_amount,0) - COALESCE(b.paid_amount,0),0)) AS v
                             FROM bills b ${BILL_PG_JOINS} WHERE b.deleted_at IS NULL AND b.status <> 'paid' GROUP BY pg`)).forEach(r => { if (map[r.pg]) map[r.pg].outstanding = num(r.v); });
            }
            if (can("expenses")) {
                (await many(`SELECT e.pg_id AS pg, SUM(e.amount) AS v FROM expenses e WHERE e.deleted_at IS NULL AND e.expense_date BETWEEN ? AND ? AND e.pg_id IS NOT NULL GROUP BY e.pg_id`, [period.from, period.to]))
                    .forEach(r => { if (map[r.pg]) map[r.pg].expenses = num(r.v); });
            }
            out.pg_compare = Object.values(map).map(x => ({ ...x, occupancy_pct: pct(x.occupied, x.capacity), net: x.collected - x.expenses }));
        }));

        await Promise.all(jobs);
        return res.json({ success: true, data: out });
    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({ success: false, message: "Could not build the dashboard." });
    }
};
