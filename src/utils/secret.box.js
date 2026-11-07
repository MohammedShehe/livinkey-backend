/**
 * Tiny AES-256-GCM helper. Used to park the "what do we send if WhatsApp fails?" payload (which can
 * contain an OTP) in the database encrypted instead of in plain text.
 */
const crypto = require("crypto");

const key = () => crypto.createHash("sha256").update(`${process.env.JWT_SECRET || "livinkey"}::msg-chain`).digest();

const seal = (obj) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
    const enc = Buffer.concat([cipher.update(JSON.stringify(obj), "utf8"), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64");
};

const open = (b64) => {
    if (!b64) return null;
    try {
        const raw = Buffer.from(b64, "base64");
        const iv = raw.subarray(0, 12), tag = raw.subarray(12, 28), enc = raw.subarray(28);
        const d = crypto.createDecipheriv("aes-256-gcm", key(), iv);
        d.setAuthTag(tag);
        return JSON.parse(Buffer.concat([d.update(enc), d.final()]).toString("utf8"));
    } catch {
        return null;
    }
};

module.exports = { seal, open };
