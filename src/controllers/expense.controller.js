const Expense = require("../models/expense.model");
const uploadService = require("../services/upload.service");
const db = require("../config/db");
const { parsePgId } = require("../utils/pg.scope");

const clean = (v, max) => { if (v === undefined || v === null) return null; const s = String(v).trim(); return s ? s.slice(0, max) : null; };
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ""));

function filtersFrom(q) {
    return {
        pg_id: q.pg_id === "none" ? "none" : parsePgId(q.pg_id),
        category: Expense.CATEGORY_KEYS.includes(q.category) ? q.category : null,
        method: Expense.METHODS.includes(q.method) ? q.method : null,
        from: isDate(q.from) ? q.from : null,
        to: isDate(q.to) ? q.to : null,
        q: clean(q.q, 80)
    };
}

function parse(body) {
    const errors = [];
    const title = clean(body.title, 200);
    if (!title) errors.push("Please enter what this expense was for.");
    const amount = Number(body.amount);
    if (!isFinite(amount) || amount <= 0) errors.push("Enter an amount greater than 0.");
    if (amount > 99999999) errors.push("That amount looks too large. Please check it.");
    const category = Expense.CATEGORY_KEYS.includes(body.category) ? body.category : null;
    if (!category) errors.push("Choose a category.");
    if (!isDate(body.expense_date)) errors.push("Choose the date you paid this.");
    else if (body.expense_date > new Date(Date.now() + 86400000).toISOString().slice(0, 10)) errors.push("The date cannot be in the future.");
    const payment_method = Expense.METHODS.includes(body.payment_method) ? body.payment_method : "cash";
    return {
        errors,
        data: {
            pg_id: body.pg_id === "" || body.pg_id === undefined || body.pg_id === null || body.pg_id === "none" ? null : parsePgId(body.pg_id),
            category, title, amount: Math.round(amount * 100) / 100,
            expense_date: body.expense_date, payment_method,
            paid_to: clean(body.paid_to, 150), reference_no: clean(body.reference_no, 100), notes: clean(body.notes, 2000)
        }
    };
}

async function checkPg(pgId) {
    if (!pgId) return true;
    const [r] = await db.execute("SELECT id FROM pgs WHERE id = ? LIMIT 1", [pgId]);
    return !!r.length;
}

exports.meta = async (req, res) => {
    try {
        const [pgs] = await db.execute("SELECT id, name FROM pgs ORDER BY name");
        res.json({ success: true, data: { categories: Expense.CATEGORIES, methods: Expense.METHODS, pgs } });
    } catch (e) { console.error("Expense meta:", e); res.status(500).json({ success: false, message: "Could not load expense options." }); }
};

exports.list = async (req, res) => {
    try {
        const data = await Expense.list(filtersFrom(req.query), { page: req.query.page, limit: req.query.limit, sort: req.query.sort });
        res.json({ success: true, data });
    } catch (e) { console.error("Expense list:", e); res.status(500).json({ success: false, message: "Could not load expenses." }); }
};

exports.stats = async (req, res) => {
    try { res.json({ success: true, data: await Expense.stats(filtersFrom(req.query)) }); }
    catch (e) { console.error("Expense stats:", e); res.status(500).json({ success: false, message: "Could not calculate expense statistics." }); }
};

exports.create = async (req, res) => {
    let uploaded = null;
    try {
        const { errors, data } = parse(req.body || {});
        if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });
        if (!(await checkPg(data.pg_id))) return res.status(400).json({ success: false, message: "That PG no longer exists." });
        if (req.file) {
            uploaded = await uploadService.uploadFile(req.file, "livinkey/expenses");
            data.receipt_url = uploaded.secure_url; data.receipt_public_id = uploaded.public_id; data.receipt_resource_type = uploaded.resource_type;
        }
        const id = await Expense.create(data, req.admin.id);
        res.status(201).json({ success: true, message: "Expense recorded.", data: await Expense.getById(id) });
    } catch (e) {
        if (uploaded) uploadService.deleteFile(uploaded.public_id, uploaded.resource_type).catch(() => {});
        console.error("Expense create:", e); res.status(500).json({ success: false, message: "Could not save the expense." });
    }
};

exports.update = async (req, res) => {
    let uploaded = null;
    try {
        const existing = await Expense.getById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: "Expense not found." });
        const { errors, data } = parse(req.body || {});
        if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });
        if (!(await checkPg(data.pg_id))) return res.status(400).json({ success: false, message: "That PG no longer exists." });
        data.receipt_url = existing.receipt_url; data.receipt_public_id = existing.receipt_public_id; data.receipt_resource_type = existing.receipt_resource_type;
        const removeReceipt = req.body.remove_receipt === "1" || req.body.remove_receipt === "true";
        if (req.file) {
            uploaded = await uploadService.uploadFile(req.file, "livinkey/expenses");
            data.receipt_url = uploaded.secure_url; data.receipt_public_id = uploaded.public_id; data.receipt_resource_type = uploaded.resource_type;
        } else if (removeReceipt) { data.receipt_url = null; data.receipt_public_id = null; data.receipt_resource_type = null; }
        await Expense.update(existing.id, data, req.admin.id);
        if ((req.file || removeReceipt) && existing.receipt_public_id) uploadService.deleteFile(existing.receipt_public_id, existing.receipt_resource_type || "image").catch(() => {});
        res.json({ success: true, message: "Expense updated.", data: await Expense.getById(existing.id) });
    } catch (e) {
        if (uploaded) uploadService.deleteFile(uploaded.public_id, uploaded.resource_type).catch(() => {});
        console.error("Expense update:", e); res.status(500).json({ success: false, message: "Could not update the expense." });
    }
};

exports.remove = async (req, res) => {
    try {
        const existing = await Expense.getById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: "Expense not found." });
        await Expense.softDelete(existing.id, req.admin.id);
        res.json({ success: true, message: "Expense deleted." });
    } catch (e) { console.error("Expense delete:", e); res.status(500).json({ success: false, message: "Could not delete the expense." }); }
};
