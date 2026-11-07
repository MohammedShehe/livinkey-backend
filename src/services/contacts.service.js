/**
 * Resolve contact details (country code, phone, e-mail, name) for a Livinkey user and find the
 * user behind an incoming phone number.
 */
const db = require("../config/db");
const { normalizePhone, digitsOnly } = require("../utils/phone");

/** @returns {Promise<{name,email,phone,countryCode,userType}|null>} */
const resolveContact = async (userId, userType) => {
    if (!userId) return null;
    try {
        if (userType === "admin") {
            const [rows] = await db.execute(`SELECT name, email, phone FROM admins WHERE id = ? LIMIT 1`, [userId]);
            if (!rows[0]) return null;
            return { name: rows[0].name, email: rows[0].email, phone: rows[0].phone, countryCode: null, userType: "admin" };
        }
        const [rows] = await db.execute(
            `SELECT full_name, email, phone, country_code, international_phone, role FROM tenants WHERE id = ? LIMIT 1`,
            [userId]
        );
        if (!rows[0]) return null;
        const r = rows[0];
        return {
            name: r.full_name,
            email: r.email,
            phone: r.phone,
            countryCode: r.country_code,
            userType: r.role === "guest" ? "guest" : "tenant",
        };
    } catch (err) {
        console.error("resolveContact failed:", err.message);
        return null;
    }
};

/** Find the user (tenant / guest / admin) who owns an E.164 number. */
const findUserByE164 = async (e164) => {
    const digits = digitsOnly(e164);
    if (digits.length < 8) return null;
    const tail = digits.slice(-8);
    try {
        const [tenants] = await db.execute(
            `SELECT id, full_name, email, phone, country_code, role FROM tenants WHERE phone LIKE ? LIMIT 25`,
            [`%${tail}`]
        );
        for (const t of tenants) {
            if (normalizePhone(t.phone, t.country_code) === e164) {
                return { userId: t.id, userType: t.role === "guest" ? "guest" : "tenant", name: t.full_name, email: t.email };
            }
        }
        const [admins] = await db.execute(`SELECT id, name, email, phone FROM admins WHERE phone LIKE ? LIMIT 25`, [`%${tail}`]);
        for (const a of admins) {
            if (normalizePhone(a.phone) === e164) return { userId: a.id, userType: "admin", name: a.name, email: a.email };
        }
    } catch (err) {
        console.error("findUserByE164 failed:", err.message);
    }
    return null;
};

module.exports = { resolveContact, findUserByE164 };
