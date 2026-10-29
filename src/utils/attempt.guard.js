/**
 * Brute-force protection for logins and OTP verification.
 *
 * Counts failed attempts per (scope + identifier) in memory and temporarily
 * locks the identifier once the limit is reached. Successful attempts reset
 * the counter. Works together with the IP based rate limiters in
 * middleware/rate.limit.js.
 */
const db = require("../config/db");

const store = new Map();

const norm = (v) => String(v || "").trim().toLowerCase();
const k = (scope, id) => `${scope}:${norm(id)}`;

const minutesLeft = (ms) => Math.max(1, Math.ceil(ms / 60000));

/** Throws {status:429} if the identifier is currently locked. */
const check = (scope, id) => {
    const rec = store.get(k(scope, id));
    if (rec && rec.lockedUntil && rec.lockedUntil > Date.now()) {
        throw {
            status: 429,
            message: `Too many attempts. Please try again in ${minutesLeft(rec.lockedUntil - Date.now())} minute(s).`
        };
    }
};

const fail = (scope, id, { max = 5, lockMs = 15 * 60 * 1000, windowMs = 15 * 60 * 1000, onLock } = {}) => {
    const key = k(scope, id);
    const now = Date.now();
    let rec = store.get(key);
    if (!rec || (rec.firstAt && now - rec.firstAt > windowMs && !(rec.lockedUntil > now))) {
        rec = { count: 0, firstAt: now, lockedUntil: 0 };
    }
    rec.count += 1;
    if (rec.count >= max) {
        rec.lockedUntil = now + lockMs;
        rec.count = 0;
        rec.firstAt = 0;
        if (typeof onLock === "function") {
            Promise.resolve().then(onLock).catch(() => {});
        }
    }
    store.set(key, rec);
};

const success = (scope, id) => store.delete(k(scope, id));

/**
 * Attach to a response: counts a failure for 4xx auth responses, resets on 2xx.
 * `failStatuses` = which status codes count as a failed attempt.
 */
const track = (res, scope, id, opts = {}) => {
    const failStatuses = opts.failStatuses || [400, 401];
    res.on("finish", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) success(scope, id);
        else if (failStatuses.includes(res.statusCode)) fail(scope, id, opts);
    });
};

/** Helper to wipe a stored OTP once an account is locked. */
const clearOtpFor = (table, email) => () =>
    db.execute(`UPDATE ${table} SET otp = NULL, otp_expiry = NULL WHERE email = ?`, [email]);

// periodic cleanup so the map never grows forever
setInterval(() => {
    const now = Date.now();
    for (const [key, rec] of store) {
        if ((!rec.lockedUntil || rec.lockedUntil < now) && (!rec.firstAt || now - rec.firstAt > 60 * 60 * 1000)) {
            store.delete(key);
        }
    }
}, 10 * 60 * 1000).unref();

module.exports = { check, fail, success, track, clearOtpFor };

/**
 * One-call helper for controllers: blocks the request with a friendly 429 when
 * locked, otherwise starts tracking the outcome. Returns true if it responded.
 */
const guard = (res, scope, id, opts = {}) => {
    try {
        check(scope, id);
    } catch (e) {
        res.status(429).json({ success: false, code: "RATE_LIMITED", message: e.message });
        return true;
    }
    track(res, scope, id, opts);
    return false;
};
module.exports.guard = guard;
