/**
 * Shared authentication core used by every auth middleware.
 *
 * - Bearer tokens are the normal way to authenticate.
 * - `?token=` is accepted ONLY for short-lived, GET-only "download" tokens
 *   (purpose = "download"), so long-lived session tokens never end up in
 *   URLs, server logs, browser history or Referer headers.
 * - Every request re-checks that the account still exists and is active
 *   (cached for a short time) so disabled accounts lose access immediately.
 * - Failures carry a machine-readable `code` so clients can tell a real
 *   session end (TOKEN_EXPIRED / TOKEN_INVALID / ACCOUNT_DISABLED) apart
 *   from any other error and avoid logging users out unnecessarily.
 */
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const ACCOUNT_CACHE_TTL_MS = 60 * 1000;
const accountCache = new Map(); // key -> { at, value }

class AuthError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

const sendAuthError = (res, err) => {
    const status = err.status || 401;
    return res.status(status).json({
        success: false,
        code: err.code || "AUTH_ERROR",
        message: err.message || "Authentication failed."
    });
};

const extractToken = (req) => {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
        return { token: header.slice(7).trim(), fromQuery: false };
    }
    if (req.query && typeof req.query.token === "string" && req.query.token) {
        return { token: req.query.token, fromQuery: true };
    }
    return { token: null, fromQuery: false };
};

/** Verify the JWT and enforce the download-token rules. Returns decoded payload. */
const verifyRequestToken = (req) => {
    const { token, fromQuery } = extractToken(req);
    if (!token) {
        throw new AuthError(401, "NO_TOKEN", "Please sign in to continue.");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new AuthError(401, "TOKEN_EXPIRED", "Your session has ended. Please sign in again.");
        }
        throw new AuthError(401, "TOKEN_INVALID", "We couldn't verify your sign-in. Please sign in again.");
    }

    if (!decoded || !decoded.id || !decoded.role) {
        throw new AuthError(401, "TOKEN_INVALID", "We couldn't verify your sign-in. Please sign in again.");
    }

    const isDownloadToken = decoded.purpose === "download";
    if (fromQuery) {
        if (!isDownloadToken || !["GET", "HEAD"].includes(req.method)) {
            throw new AuthError(401, "TOKEN_INVALID", "This link is no longer valid. Please try again from the app.");
        }
    } else if (isDownloadToken) {
        // download tokens are not valid as session tokens
        throw new AuthError(401, "TOKEN_INVALID", "We couldn't verify your sign-in. Please sign in again.");
    }

    return decoded;
};

/** Confirm the account behind the token still exists and is active. */
const assertAccountActive = async (decoded) => {
    const isAdmin = decoded.role === "super_admin" || decoded.role === "admin";
    const key = `${isAdmin ? "a" : "t"}:${decoded.id}`;
    const cached = accountCache.get(key);
    if (cached && Date.now() - cached.at < ACCOUNT_CACHE_TTL_MS) {
        if (!cached.value.ok) throw new AuthError(401, "ACCOUNT_DISABLED", cached.value.message);
        return cached.value;
    }

    let rows;
    try {
        if (isAdmin) {
            [rows] = await db.execute("SELECT id, role, is_active FROM admins WHERE id = ? LIMIT 1", [decoded.id]);
        } else {
            [rows] = await db.execute("SELECT id, role, is_active FROM tenants WHERE id = ? LIMIT 1", [decoded.id]);
        }
    } catch (dbError) {
        // Never treat a database hiccup as an authentication failure.
        console.error("Auth account check failed:", dbError.message);
        throw new AuthError(503, "SERVICE_UNAVAILABLE", "We're having trouble reaching the server. Please try again in a moment.");
    }

    let value;
    if (!rows.length) {
        value = { ok: false, message: "This account is no longer available. Please contact support." };
    } else if (rows[0].is_active === 0 || rows[0].is_active === false) {
        value = { ok: false, message: "This account has been deactivated. Please contact support." };
    } else {
        value = { ok: true, role: rows[0].role };
    }
    accountCache.set(key, { at: Date.now(), value });
    if (!value.ok) throw new AuthError(401, "ACCOUNT_DISABLED", value.message);
    return value;
};

const invalidateAccount = (id, isAdmin) => accountCache.delete(`${isAdmin ? "a" : "t"}:${id}`);

/** Limit a `must_change_password` token to the endpoints needed to change it. */
const PASSWORD_CHANGE_ALLOWED = [
    "/api/auth/change-password",
    "/api/auth/validate",
    "/api/tenants/auth/change-password",
    "/api/guests/change-password"
];
const enforcePasswordChangeScope = (decoded, req) => {
    if (decoded.must_change_password) {
        const path = (req.originalUrl || "").split("?")[0];
        if (!PASSWORD_CHANGE_ALLOWED.includes(path)) {
            throw new AuthError(403, "PASSWORD_CHANGE_REQUIRED", "Please change your password before continuing.");
        }
    }
};

const signDownloadToken = (subject, expiresIn = "5m") =>
    jwt.sign(
        { id: subject.id, role: subject.role, email: subject.email, purpose: "download" },
        process.env.JWT_SECRET,
        { expiresIn }
    );

module.exports = {
    AuthError,
    sendAuthError,
    verifyRequestToken,
    assertAccountActive,
    invalidateAccount,
    enforcePasswordChangeScope,
    signDownloadToken
};
