const db = require("../config/db");
const { BILL_PG_JOINS, BILL_PG_EXPR } = require("../utils/pg.scope");

const CATEGORIES = [
    { key: "rent", label: "Building rent / lease", icon: "bi-house-door" },
    { key: "electricity", label: "Electricity bill", icon: "bi-lightning-charge" },
    { key: "water", label: "Water & sewage", icon: "bi-droplet" },
    { key: "internet", label: "Wi-Fi & internet", icon: "bi-wifi" },
    { key: "salaries", label: "Staff salaries", icon: "bi-people" },
    { key: "housekeeping", label: "Cleaning & housekeeping", icon: "bi-stars" },
    { key: "food", label: "Groceries & kitchen", icon: "bi-basket" },
    { key: "repairs", label: "Repairs & maintenance", icon: "bi-tools" },
    { key: "furniture", label: "Furniture & appliances", icon: "bi-lamp" },
    { key: "laundry", label: "Laundry & linen", icon: "bi-droplet-half" },
    { key: "security", label: "Security & CCTV", icon: "bi-shield-check" },
    { key: "taxes", label: "Taxes & licences", icon: "bi-bank" },
    { key: "insurance", label: "Insurance", icon: "bi-umbrella" },
    { key: "marketing", label: "Marketing & ads", icon: "bi-megaphone" },
    { key: "software", label: "Software & subscriptions", icon: "bi-cloud" },
    { key: "transport", label: "Travel & transport", icon: "bi-truck" },
    { key: "other", label: "Other", icon: "bi-three-dots" }
];
const CATEGORY_KEYS = CATEGORIES.map(c => c.key);
const METHODS = ["cash", "upi", "bank_transfer", "card", "cheque", "other"];

/** Builds the WHERE clause shared by list + stats. */
function buildWhere(f = {}) {
    const where = ["e.deleted_at IS NULL"];
    const params = [];
    if (f.pg_id === "none") where.push("e.pg_id IS NULL");
    else if (f.pg_id) { where.push("e.pg_id = ?"); params.push(f.pg_id); }
    if (f.category) { where.push("e.category = ?"); params.push(f.category); }
    if (f.method) { where.push("e.payment_method = ?"); params.push(f.method); }
    if (f.from) { where.push("e.expense_date >= ?"); params.push(f.from); }
    if (f.to) { where.push("e.expense_date <= ?"); params.push(f.to); }
    if (f.q) {
        where.push("(e.title LIKE ? OR e.paid_to LIKE ? OR e.reference_no LIKE ? OR e.notes LIKE ?)");
        const like = `%${f.q}%`;
        params.push(like, like, like, like);
    }
    return { sql: where.join(" AND "), params };
}

const SELECT = `
    e.id, e.pg_id, p.name AS pg_name, e.category, e.title, e.amount,
    DATE_FORMAT(e.expense_date,'%Y-%m-%d') AS expense_date, e.payment_method, e.paid_to,
    e.reference_no, e.notes, e.receipt_url, e.receipt_public_id, e.receipt_resource_type,
    e.created_by, a.name AS created_by_name, e.created_at, e.updated_at
`;

exports.list = async (f, { page = 1, limit = 25, sort = "date_desc" } = {}) => {
    const w = buildWhere(f);
    const order = {
        date_desc: "e.expense_date DESC, e.id DESC",
        date_asc: "e.expense_date ASC, e.id ASC",
        amount_desc: "e.amount DESC, e.id DESC",
        amount_asc: "e.amount ASC, e.id ASC"
    }[sort] || "e.expense_date DESC, e.id DESC";
    const lim = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 1000);
    const off = (Math.max(parseInt(page, 10) || 1, 1) - 1) * lim;
    const [rows] = await db.query(
        `SELECT ${SELECT} FROM expenses e
         LEFT JOIN pgs p ON p.id = e.pg_id LEFT JOIN admins a ON a.id = e.created_by
         WHERE ${w.sql} ORDER BY ${order} LIMIT ${lim} OFFSET ${off}`, w.params);
    const [[tot]] = await db.query(
        `SELECT COUNT(*) AS c, COALESCE(SUM(e.amount),0) AS s FROM expenses e WHERE ${w.sql}`, w.params);
    return {
        rows: rows.map(r => ({ ...r, amount: Number(r.amount) })),
        total: Number(tot.c), total_amount: Number(tot.s), page: Math.floor(off / lim) + 1, limit: lim
    };
};

exports.getById = async (id) => {
    const [rows] = await db.execute(
        `SELECT ${SELECT} FROM expenses e LEFT JOIN pgs p ON p.id = e.pg_id LEFT JOIN admins a ON a.id = e.created_by
         WHERE e.id = ? AND e.deleted_at IS NULL LIMIT 1`, [id]);
    return rows[0] ? { ...rows[0], amount: Number(rows[0].amount) } : null;
};

exports.create = async (d, adminId) => {
    const [r] = await db.execute(
        `INSERT INTO expenses (pg_id, category, title, amount, expense_date, payment_method, paid_to, reference_no, notes,
                               receipt_url, receipt_public_id, receipt_resource_type, created_by, updated_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [d.pg_id, d.category, d.title, d.amount, d.expense_date, d.payment_method, d.paid_to, d.reference_no, d.notes,
         d.receipt_url || null, d.receipt_public_id || null, d.receipt_resource_type || null, adminId, adminId]);
    return r.insertId;
};

exports.update = async (id, d, adminId) => {
    await db.execute(
        `UPDATE expenses SET pg_id=?, category=?, title=?, amount=?, expense_date=?, payment_method=?, paid_to=?,
                reference_no=?, notes=?, receipt_url=?, receipt_public_id=?, receipt_resource_type=?, updated_by=? WHERE id=?`,
        [d.pg_id, d.category, d.title, d.amount, d.expense_date, d.payment_method, d.paid_to, d.reference_no, d.notes,
         d.receipt_url || null, d.receipt_public_id || null, d.receipt_resource_type || null, adminId, id]);
};

exports.softDelete = async (id, adminId) => {
    await db.execute(`UPDATE expenses SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`, [adminId, id]);
};

/**
 * Everything the Expenses page needs for its stat cards and charts, for the
 * chosen PG (or all PGs) and period. Income comes from real collected payments
 * so "net" is an honest cash-in minus cash-out figure.
 */
exports.stats = async (f) => {
    const w = buildWhere(f);
    const pgId = f.pg_id && f.pg_id !== "none" ? f.pg_id : null;

    const [[sum]] = await db.query(
        `SELECT COUNT(*) AS cnt, COALESCE(SUM(e.amount),0) AS total, COALESCE(AVG(e.amount),0) AS avg_amt,
                COALESCE(MAX(e.amount),0) AS max_amt FROM expenses e WHERE ${w.sql}`, w.params);

    const [byCategory] = await db.query(
        `SELECT e.category, COUNT(*) AS cnt, SUM(e.amount) AS total FROM expenses e WHERE ${w.sql}
         GROUP BY e.category ORDER BY total DESC`, w.params);

    const [byPg] = await db.query(
        `SELECT e.pg_id, COALESCE(p.name,'Shared / head office') AS pg_name, COUNT(*) AS cnt, SUM(e.amount) AS total
         FROM expenses e LEFT JOIN pgs p ON p.id = e.pg_id WHERE ${w.sql}
         GROUP BY e.pg_id, p.name ORDER BY total DESC`, w.params);

    const [byMethod] = await db.query(
        `SELECT e.payment_method AS method, COUNT(*) AS cnt, SUM(e.amount) AS total FROM expenses e WHERE ${w.sql}
         GROUP BY e.payment_method ORDER BY total DESC`, w.params);

    const [top] = await db.query(
        `SELECT e.id, e.title, e.category, e.amount, DATE_FORMAT(e.expense_date,'%Y-%m-%d') AS expense_date, p.name AS pg_name
         FROM expenses e LEFT JOIN pgs p ON p.id = e.pg_id WHERE ${w.sql} ORDER BY e.amount DESC LIMIT 5`, w.params);

    // 12-month trend (ignores the date filter on purpose so the chart always has context)
    const tw = buildWhere({ ...f, from: null, to: null });
    const [trendExp] = await db.query(
        `SELECT DATE_FORMAT(e.expense_date,'%Y-%m') AS month, SUM(e.amount) AS total FROM expenses e
         WHERE ${tw.sql} AND e.expense_date >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 11 MONTH)
         GROUP BY month ORDER BY month`, tw.params);

    const incParams = [];
    let incPg = "";
    if (pgId) { incPg = ` AND ${BILL_PG_EXPR} = ?`; incParams.push(pgId); }
    const [trendInc] = await db.query(
        `SELECT DATE_FORMAT(bp.payment_date,'%Y-%m') AS month, SUM(bp.amount) AS total
         FROM bill_payments bp JOIN bills b ON b.id = bp.bill_id ${BILL_PG_JOINS}
         WHERE bp.payment_date >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 11 MONTH) ${incPg}
         GROUP BY month ORDER BY month`, incParams);

    // Income for the selected period (defaults to the same window as the expenses)
    const incWhere = []; const incP2 = [];
    if (f.from) { incWhere.push("bp.payment_date >= ?"); incP2.push(f.from); }
    if (f.to) { incWhere.push("bp.payment_date < DATE_ADD(?, INTERVAL 1 DAY)"); incP2.push(f.to); }
    if (pgId) { incWhere.push(`${BILL_PG_EXPR} = ?`); incP2.push(pgId); }
    const [[inc]] = await db.query(
        `SELECT COALESCE(SUM(bp.amount),0) AS total FROM bill_payments bp JOIN bills b ON b.id = bp.bill_id ${BILL_PG_JOINS}
         ${incWhere.length ? "WHERE " + incWhere.join(" AND ") : ""}`, incP2);

    // This month vs last month (respecting PG/category filters)
    const mw = buildWhere({ ...f, from: null, to: null });
    const [[cm]] = await db.query(
        `SELECT
           COALESCE(SUM(CASE WHEN DATE_FORMAT(e.expense_date,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m') THEN e.amount END),0) AS this_month,
           COALESCE(SUM(CASE WHEN DATE_FORMAT(e.expense_date,'%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m') THEN e.amount END),0) AS last_month
         FROM expenses e WHERE ${mw.sql}`, mw.params);

    const total = Number(sum.total);
    const income = Number(inc.total);
    return {
        summary: {
            count: Number(sum.cnt), total, average: Number(sum.avg_amt), largest: Number(sum.max_amt),
            income, net: income - total,
            expense_ratio: income > 0 ? Math.round((total / income) * 1000) / 10 : null,
            this_month: Number(cm.this_month), last_month: Number(cm.last_month)
        },
        by_category: byCategory.map(r => ({ category: r.category, count: Number(r.cnt), total: Number(r.total), pct: total ? Math.round(Number(r.total) / total * 1000) / 10 : 0 })),
        by_pg: byPg.map(r => ({ pg_id: r.pg_id, pg_name: r.pg_name, count: Number(r.cnt), total: Number(r.total), pct: total ? Math.round(Number(r.total) / total * 1000) / 10 : 0 })),
        by_method: byMethod.map(r => ({ method: r.method, count: Number(r.cnt), total: Number(r.total) })),
        top_expenses: top.map(r => ({ ...r, amount: Number(r.amount) })),
        trend: { expenses: trendExp.map(r => ({ month: r.month, total: Number(r.total) })), income: trendInc.map(r => ({ month: r.month, total: Number(r.total) })) }
    };
};

exports.CATEGORIES = CATEGORIES;
exports.CATEGORY_KEYS = CATEGORY_KEYS;
exports.METHODS = METHODS;
