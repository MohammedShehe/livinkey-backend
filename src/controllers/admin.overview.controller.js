/**
 * Admin console monitoring endpoints.
 *
 *   GET /api/admins/overview        -> dashboard numbers (permission aware)
 *   GET /api/admins/system-health   -> infrastructure status (super admin)
 *   GET /api/admins/login-history   -> recent admin sign-ins (super admin)
 *
 * Every metric is fetched independently and wrapped in safe(); one failing
 * query (e.g. a table that does not exist on an older database) never takes
 * the whole dashboard down — that metric is simply returned as null.
 */
const db = require("../config/db");

const safe = async (fn, fallback = null) => {
    try { return await fn(); } catch (e) { console.error("[overview]", e.message); return fallback; }
};
const one = async (sql, params = []) => { const [r] = await db.execute(sql, params); return r[0] || {}; };
const many = async (sql, params = []) => { const [r] = await db.execute(sql, params); return r; };
const num = v => Number(v || 0);

async function permittedModules(admin) {
    if (admin.role === "super_admin") return null; // null = everything
    const rows = await many(
        "SELECT module_name FROM admin_permissions WHERE admin_id = ? AND can_view = 1", [admin.id]
    );
    return new Set(rows.map(r => r.module_name));
}

exports.getOverview = async (req, res) => {
    try {
        const allowed = await permittedModules(req.admin);
        const can = (m) => allowed === null || allowed.has(m);
        const out = { generated_at: new Date().toISOString(), role: req.admin.role };
        const jobs = [];

        if (can("tenants")) jobs.push(safe(async () => {
            const r = await one(`
                SELECT
                  SUM(CASE WHEN t.role='tenant' AND (t.status IS NULL OR t.status='active') AND (t.is_active IS NULL OR t.is_active=1) THEN 1 ELSE 0 END) AS active,
                  SUM(CASE WHEN t.role='tenant' AND t.status='checked_out' THEN 1 ELSE 0 END) AS checked_out,
                  SUM(CASE WHEN t.role='tenant' AND t.status='archived' THEN 1 ELSE 0 END) AS archived,
                  SUM(CASE WHEN t.role='tenant' AND (t.status IS NULL OR t.status='active') AND t.residency='international' THEN 1 ELSE 0 END) AS international,
                  SUM(CASE WHEN t.role='tenant' AND (t.status IS NULL OR t.status='active') AND t.residency='national' THEN 1 ELSE 0 END) AS national,
                  SUM(CASE WHEN t.role='tenant' AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS new_30d
                FROM tenants t`);
            const ef = await safe(() => one(`
                SELECT COUNT(*) AS c FROM tenant_details d
                INNER JOIN tenants t ON t.id = d.tenant_id
                WHERE t.role='tenant' AND (t.status IS NULL OR t.status='active')
                  AND d.residency='international' AND d.efrro_till IS NOT NULL
                  AND d.efrro_till <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`), { c: 0 });
            out.tenants = {
                active: num(r.active), checked_out: num(r.checked_out), archived: num(r.archived),
                international: num(r.international), national: num(r.national),
                new_30d: num(r.new_30d), efrro_expiring_30d: num(ef.c)
            };
        }));

        if (can("guests")) jobs.push(safe(async () => {
            const r = await one(`SELECT COUNT(*) AS total,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS new_7d
                FROM tenants WHERE role='guest'`);
            out.guests = { total: num(r.total), new_7d: num(r.new_7d) };
        }));

        if (can("pgs")) jobs.push(safe(async () => {
            const p = await one(`SELECT COUNT(*) AS total, SUM(is_active=1) AS active FROM pgs`);
            const rows = await many(`
                SELECT p.id, p.name, p.is_active,
                  COALESCE(SUM(r.capacity),0) AS capacity,
                  COALESCE(SUM(ro.occupied_count),0) AS occupied
                FROM pgs p
                LEFT JOIN floors f ON f.pg_id = p.id
                LEFT JOIN rooms r ON r.floor_id = f.id AND r.is_active = 1
                LEFT JOIN room_occupancy ro ON ro.room_id = r.id
                GROUP BY p.id, p.name, p.is_active
                ORDER BY p.name`);
            const capacity = rows.reduce((a, x) => a + num(x.capacity), 0);
            const occupied = rows.reduce((a, x) => a + num(x.occupied), 0);
            out.pgs = {
                total: num(p.total), active: num(p.active), capacity, occupied,
                occupancy_pct: capacity ? Math.round((occupied / capacity) * 100) : 0,
                list: rows.map(x => ({
                    id: x.id, name: x.name, is_active: !!x.is_active,
                    capacity: num(x.capacity), occupied: num(x.occupied)
                }))
            };
        }));

        if (can("bills")) {
            jobs.push(safe(async () => {
                const r = await one(`
                    SELECT
                      SUM(status='unpaid') AS unpaid,
                      SUM(status='partially_paid') AS partially_paid,
                      SUM(status='paid') AS paid,
                      SUM(status IN ('overdue','delayed')) AS overdue,
                      COALESCE(SUM(CASE WHEN status <> 'paid' THEN GREATEST(total_amount + COALESCE(fine_amount,0) - COALESCE(paid_amount,0),0) ELSE 0 END),0) AS outstanding,
                      COALESCE(SUM(CASE WHEN billing_month = DATE_FORMAT(CURDATE(),'%Y-%m') THEN total_amount ELSE 0 END),0) AS billed_this_month
                    FROM bills WHERE deleted_at IS NULL`);
                const c = await one(`
                    SELECT COALESCE(SUM(amount),0) AS collected
                    FROM bill_payments
                    WHERE payment_date >= DATE_FORMAT(CURDATE(),'%Y-%m-01')`);
                out.bills = {
                    unpaid: num(r.unpaid), partially_paid: num(r.partially_paid), paid: num(r.paid),
                    overdue: num(r.overdue), outstanding: num(r.outstanding),
                    billed_this_month: num(r.billed_this_month), collected_this_month: num(c.collected)
                };
            }));
            jobs.push(safe(async () => {
                const r = await one(`SELECT COUNT(*) AS c FROM payment_proofs WHERE status='pending'`);
                out.proofs = { pending: num(r.c) };
            }));
            jobs.push(safe(async () => {
                const rows = await many(`
                    SELECT DATE_FORMAT(payment_date,'%Y-%m') AS month, COALESCE(SUM(amount),0) AS collected
                    FROM bill_payments
                    WHERE payment_date >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 5 MONTH)
                    GROUP BY month ORDER BY month`);
                out.revenue_trend = rows.map(x => ({ month: x.month, collected: num(x.collected) }));
            }));
        }

        if (can("maintenance")) jobs.push(safe(async () => {
            const r = await one(`SELECT
                SUM(status='pending') AS pending, SUM(status='in_progress') AS in_progress,
                SUM(status='completed' AND updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS completed_30d
                FROM maintenance_requests`);
            out.maintenance = { pending: num(r.pending), in_progress: num(r.in_progress), completed_30d: num(r.completed_30d) };
        }));

        if (can("feedbacks")) jobs.push(safe(async () => {
            const a = await one(`SELECT COUNT(*) AS c, AVG(overall_rating) AS avg_r,
                SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS new_7d FROM tenant_feedbacks`);
            const b = await safe(() => one(`SELECT COUNT(*) AS c, AVG(overall_rating) AS avg_r,
                SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS new_7d FROM public_feedbacks`), { c: 0, avg_r: 0, new_7d: 0 });
            const total = num(a.c) + num(b.c);
            const avg = total ? ((num(a.avg_r) * num(a.c)) + (num(b.avg_r) * num(b.c))) / total : 0;
            out.feedback = { total, avg_rating: Math.round(avg * 10) / 10, new_7d: num(a.new_7d) + num(b.new_7d) };
        }));

        if (can("conversations")) jobs.push(safe(async () => {
            const r = await one(`SELECT COALESCE(SUM(unread_count),0) AS unread, COUNT(*) AS open_total
                                 FROM conversations WHERE is_archived = 0`);
            out.conversations = { unread: num(r.unread), open: num(r.open_total) };
        }));

        if (can("documents")) jobs.push(safe(async () => {
            out.documents = await documentCompletion();
        }));

        // Recent admin actions
        if (req.admin.role === "super_admin" || can("activity_logs")) jobs.push(safe(async () => {
            const rows = await many(`
                SELECT id, actor_name, actor_position, action, module, entity_type, entity_id, created_at
                FROM activity_logs WHERE actor_type='admin'
                ORDER BY created_at DESC LIMIT 12`);
            out.recent_activity = rows;
        }));

        if (req.admin.role === "super_admin") jobs.push(safe(async () => {
            out.admins = await many(`
                SELECT id, name, email, role, is_active, last_login_at, last_login_ip, login_count
                FROM admins ORDER BY (last_login_at IS NULL), last_login_at DESC LIMIT 10`);
        }));

        await Promise.all(jobs);
        return res.json({ success: true, data: out });
    } catch (error) {
        console.error("Overview error:", error);
        return res.status(500).json({ success: false, message: "Could not build overview" });
    }
};

/** Tenants (active) that are missing at least one REQUIRED document. */
async function documentCompletion() {
    const { NATIONAL_DOCUMENTS, INTERNATIONAL_DOCUMENTS } = require("../config/document.types");
    const reqNat = NATIONAL_DOCUMENTS.filter(d => d.required).map(d => d.key);
    const reqInt = INTERNATIONAL_DOCUMENTS.filter(d => d.required).map(d => d.key);
    const summary = await buildDocumentSummary({ reqNat, reqInt });
    const list = Object.values(summary);
    return { tenants: list.length, complete: list.filter(x => x.complete).length, incomplete: list.filter(x => !x.complete).length };
}

async function buildDocumentSummary({ reqNat, reqInt }) {
    const tenants = await many(`
        SELECT t.id, COALESCE(t.residency, d.residency, 'national') AS residency
        FROM tenants t LEFT JOIN tenant_details d ON d.tenant_id = t.id
        WHERE t.role='tenant' AND (t.status IS NULL OR t.status='active') AND (t.is_active IS NULL OR t.is_active=1)`);
    const docs = await many(`SELECT tenant_id, document_type FROM tenant_documents`);
    const byTenant = {};
    docs.forEach(d => { (byTenant[d.tenant_id] ||= new Set()).add(d.document_type); });
    const out = {};
    tenants.forEach(t => {
        const required = t.residency === "international" ? reqInt : reqNat;
        const have = byTenant[t.id] || new Set();
        const missing = required.filter(k => !have.has(k));
        out[t.id] = { uploaded: have.size, required: required.length, missing, complete: missing.length === 0 };
    });
    return out;
}

/** GET /api/documents/admin/status-summary  — ONE query instead of one request per tenant. */
exports.getDocumentStatusSummary = async (req, res) => {
    try {
        const { NATIONAL_DOCUMENTS, INTERNATIONAL_DOCUMENTS } = require("../config/document.types");
        const reqNat = NATIONAL_DOCUMENTS.filter(d => d.required).map(d => d.key);
        const reqInt = INTERNATIONAL_DOCUMENTS.filter(d => d.required).map(d => d.key);
        const data = await buildDocumentSummary({ reqNat, reqInt });
        return res.json({ success: true, data });
    } catch (error) {
        console.error("Document status summary error:", error);
        return res.status(500).json({ success: false, message: "Could not build document summary" });
    }
};

exports.getSystemHealth = async (req, res) => {
    try {
        const started = Date.now();
        let dbOk = true, dbMs = null, dbVersion = null;
        try {
            const r = await one("SELECT VERSION() AS v");
            dbMs = Date.now() - started; dbVersion = r.v;
        } catch (e) { dbOk = false; }

        const has = (...keys) => keys.every(k => !!process.env[k]);
        const counts = {};
        for (const t of ["admins", "tenants", "pgs", "bills", "bill_payments", "payment_proofs", "tenant_documents", "activity_logs", "conversations"]) {
            counts[t] = await safe(async () => num((await one(`SELECT COUNT(*) AS c FROM \`${t}\``)).c), null);
        }
        const lastActivity = await safe(async () => (await one("SELECT MAX(created_at) AS m FROM activity_logs")).m, null);
        const mem = process.memoryUsage();

        return res.json({
            success: true,
            data: {
                checked_at: new Date().toISOString(),
                server: {
                    status: "online",
                    uptime_seconds: Math.round(process.uptime()),
                    node_version: process.version,
                    platform: process.platform,
                    environment: process.env.NODE_ENV || "production",
                    memory_mb: { rss: Math.round(mem.rss / 1048576), heap_used: Math.round(mem.heapUsed / 1048576) }
                },
                database: { connected: dbOk, latency_ms: dbMs, version: dbVersion, tables: counts },
                integrations: [
                    { key: "email", label: "Email (SMTP)", configured: has("EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS"), detail: "OTP, bills and reminders" },
                    { key: "cloudinary", label: "Cloudinary storage", configured: has("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"), detail: "Documents, images and QR codes" },
                    { key: "whatsapp", label: "WhatsApp (Twilio)", configured: has("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM"), detail: "Primary notification channel" },
                    { key: "push", label: "Push notifications", configured: String(process.env.ENABLE_PUSH_NOTIFICATIONS).toLowerCase() === "true" && !!process.env.FIREBASE_PROJECT_ID, detail: "Mobile app alerts" },
                    { key: "gateway", label: "Payment gateway", configured: String(process.env.ENABLE_PAYMENT_GATEWAY).toLowerCase() === "true", detail: "Online payment links" },
                    { key: "upi", label: "UPI merchant", configured: has("MERCHANT_UPI_ID"), detail: "QR code payments" }
                ],
                schedules: [
                    { time: "Every 10 min", job: "Maintenance completion reminders" },
                    { time: "00:00 daily", job: "Process delayed payments" },
                    { time: "08:00 daily", job: "Payment reminders" },
                    { time: "09:00 daily", job: "e-FRRO expiry emails" },
                    { time: "09:15 daily", job: "Tenant stay expiry reminders" },
                    { time: "09:30 daily", job: "Document reminders" },
                    { time: "10:00 daily", job: "e-FRRO expiry notifications" },
                    { time: "11:00 daily", job: "Overdue payment notifications" }
                ],
                last_activity_at: lastActivity
            }
        });
    } catch (error) {
        console.error("System health error:", error);
        return res.status(500).json({ success: false, message: "Could not read system health" });
    }
};

exports.getLoginHistory = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
        const rows = await many(`
            SELECT id, actor_name, actor_position, performed_by_admin_id AS admin_id,
                   ip_address, device_info, user_agent, metadata, created_at
            FROM activity_logs
            WHERE actor_type='admin' AND module='auth' AND action='login'
            ORDER BY created_at DESC LIMIT ${limit}`);
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Login history error:", error);
        return res.status(500).json({ success: false, message: "Could not read login history" });
    }
};
