const OfferModel = require("../models/pg.offer.model");
const db = require("../config/db");

const TYPES = ["percent", "flat", "free", "custom"];

const clean = (v, max) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s ? s.slice(0, max) : null;
};
const asDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? String(v) : null);

function parseBody(b) {
    const errors = [];
    const title = clean(b.title, 150);
    if (!title) errors.push("Offer title is required.");
    const offer_type = TYPES.includes(b.offer_type) ? b.offer_type : "custom";
    let offer_value = null;
    if (offer_type === "percent" || offer_type === "flat") {
        offer_value = Number(b.offer_value);
        if (!isFinite(offer_value) || offer_value <= 0) errors.push("Enter a discount value greater than 0.");
        if (offer_type === "percent" && offer_value > 100) errors.push("A percentage discount cannot be more than 100%.");
    }
    const valid_from = asDate(b.valid_from);
    const valid_until = asDate(b.valid_until);
    if (valid_from && valid_until && valid_until < valid_from) errors.push("The end date cannot be before the start date.");
    return {
        errors,
        data: {
            title,
            description: clean(b.description, 1000),
            offer_type,
            offer_value,
            badge_text: clean(b.badge_text, 40),
            coupon_code: clean(b.coupon_code, 40) ? clean(b.coupon_code, 40).toUpperCase() : null,
            terms: clean(b.terms, 1000),
            valid_from, valid_until,
            is_active: b.is_active === undefined ? true : (b.is_active === true || b.is_active === 1 || b.is_active === "1" || b.is_active === "true"),
            sort_order: parseInt(b.sort_order, 10) || 0
        }
    };
}

async function pgExists(id) {
    const [r] = await db.execute("SELECT id, name FROM pgs WHERE id = ? LIMIT 1", [id]);
    return r[0] || null;
}

/** Tell guests (in-app + device push) that a PG has a new live offer. */
async function announce(pg, offer) {
    try {
        const [guests] = await db.execute(`SELECT id FROM tenants WHERE role='guest' AND is_active=1`);
        if (!guests.length) return;
        const guestSvc = require("../services/guest.notification.service");
        await guestSvc.sendNotificationsToGuests(guests.map(g => g.id), "PG_OFFER", {
            title: `${offer.headline} at ${pg.name}`,
            message: offer.title + (offer.valid_until ? ` · valid till ${offer.valid_until}` : ""),
            entity_id: pg.id, entity_type: "pg", link: `/public/pgs/${pg.id}`
        });
    } catch (e) { console.error("Offer announce failed:", e.message); }
}

exports.list = async (req, res) => {
    try {
        const pg = await pgExists(req.params.id);
        if (!pg) return res.status(404).json({ success: false, message: "PG not found." });
        res.json({ success: true, data: await OfferModel.listForPg(pg.id) });
    } catch (e) { console.error("List offers:", e); res.status(500).json({ success: false, message: "Could not load offers." }); }
};

exports.listAll = async (req, res) => {
    try { res.json({ success: true, data: await OfferModel.listAll() }); }
    catch (e) { console.error("List all offers:", e); res.status(500).json({ success: false, message: "Could not load offers." }); }
};

exports.create = async (req, res) => {
    try {
        const pg = await pgExists(req.params.id);
        if (!pg) return res.status(404).json({ success: false, message: "PG not found." });
        const { errors, data } = parseBody(req.body || {});
        if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });
        const id = await OfferModel.create(pg.id, data, req.admin.id);
        const offer = await OfferModel.getById(id);
        if (offer.is_live && req.body.notify_guests !== false) announce(pg, offer);
        res.status(201).json({ success: true, message: "Offer saved.", data: offer });
    } catch (e) { console.error("Create offer:", e); res.status(500).json({ success: false, message: "Could not save the offer." }); }
};

exports.update = async (req, res) => {
    try {
        const existing = await OfferModel.getById(req.params.offerId);
        if (!existing || String(existing.pg_id) !== String(req.params.id)) return res.status(404).json({ success: false, message: "Offer not found." });
        const { errors, data } = parseBody(req.body || {});
        if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });
        await OfferModel.update(existing.id, data, req.admin.id);
        res.json({ success: true, message: "Offer updated.", data: await OfferModel.getById(existing.id) });
    } catch (e) { console.error("Update offer:", e); res.status(500).json({ success: false, message: "Could not update the offer." }); }
};

exports.toggle = async (req, res) => {
    try {
        const existing = await OfferModel.getById(req.params.offerId);
        if (!existing || String(existing.pg_id) !== String(req.params.id)) return res.status(404).json({ success: false, message: "Offer not found." });
        const next = req.body && req.body.is_active !== undefined ? !!req.body.is_active : !existing.is_active;
        await OfferModel.setActive(existing.id, next, req.admin.id);
        const offer = await OfferModel.getById(existing.id);
        if (next && offer.is_live) { const pg = await pgExists(existing.pg_id); if (pg) announce(pg, offer); }
        res.json({ success: true, message: next ? "Offer is now ON." : "Offer turned OFF.", data: offer });
    } catch (e) { console.error("Toggle offer:", e); res.status(500).json({ success: false, message: "Could not change the offer." }); }
};

exports.remove = async (req, res) => {
    try {
        const existing = await OfferModel.getById(req.params.offerId);
        if (!existing || String(existing.pg_id) !== String(req.params.id)) return res.status(404).json({ success: false, message: "Offer not found." });
        await OfferModel.remove(existing.id);
        res.json({ success: true, message: "Offer deleted." });
    } catch (e) { console.error("Delete offer:", e); res.status(500).json({ success: false, message: "Could not delete the offer." }); }
};
