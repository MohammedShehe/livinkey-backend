/**
 * Phone helpers – every number that reaches Twilio goes through here.
 *
 * Livinkey stores tenant/guest numbers as TWO columns: `country_code` ("+91", "+255", "91"…)
 * and `phone` (the local number, usually without the code). Treating a 10-digit local number
 * as Indian regardless of its country code would message the wrong person, so the country
 * code is always applied when we know it.
 */

const DEFAULT_COUNTRY_CODE = () => String(process.env.DEFAULT_COUNTRY_CODE || "+91").replace(/[^\d]/g, "") || "91";

const digitsOnly = (v) => String(v ?? "").replace(/[^\d]/g, "");

/** Strict E.164: "+" then 8-15 digits, first digit non-zero. */
const isValidE164 = (v) => /^\+[1-9]\d{7,14}$/.test(String(v || ""));

/**
 * Build an E.164 number.
 * @param {string} phone        number as stored (local, national or already international)
 * @param {string} [countryCode] e.g. "+91" / "91" / "+255"
 * @returns {string|null} "+9198xxxxxxxx" or null when the number cannot be made valid
 */
const normalizePhone = (phone, countryCode = null) => {
    if (phone === null || phone === undefined) return null;
    let raw = String(phone).trim().replace(/^whatsapp:/i, "");
    if (!raw) return null;

    // Already international: "+…" or "00…"
    if (raw.startsWith("+")) {
        const out = "+" + digitsOnly(raw);
        return isValidE164(out) ? out : null;
    }
    if (raw.startsWith("00")) {
        const out = "+" + digitsOnly(raw).replace(/^0+/, "");
        return isValidE164(out) ? out : null;
    }

    let national = digitsOnly(raw);
    if (!national) return null;

    const cc = digitsOnly(countryCode) || DEFAULT_COUNTRY_CODE();

    // The local part already carries the country code (e.g. cc 91, phone 919876543210)
    if (national.startsWith(cc) && national.length >= cc.length + 8 && national.length <= 15) {
        const out = "+" + national;
        // Only trust this when removing the code leaves a plausible national number
        if (isValidE164(out) && national.length - cc.length >= 8) return out;
    }

    national = national.replace(/^0+/, ""); // trunk prefix
    const out = "+" + cc + national;
    return isValidE164(out) ? out : null;
};

/** "+9198••••••10" – safe for logs and admin UI */
const maskPhone = (e164) => {
    const s = String(e164 || "");
    if (s.length < 7) return s;
    return s.slice(0, 3) + "•".repeat(Math.max(s.length - 5, 2)) + s.slice(-2);
};

module.exports = { normalizePhone, isValidE164, maskPhone, digitsOnly, DEFAULT_COUNTRY_CODE };
