// middleware/guest.or.tenant.auth.middleware.js
/**
 * Accepts both guest AND tenant tokens.
 * - Sets req.guest for guest tokens, req.tenant for tenant tokens
 * - Rejects admin tokens (admins shouldn't access guest routes)
 * Used by guest routes that also work for tenants using "Enter as Guest".
 */
const {
    sendAuthError, verifyRequestToken, assertAccountActive, enforcePasswordChangeScope, AuthError
} = require("../utils/auth.core");

const guestOrTenantAuthMiddleware = async (req, res, next) => {
    try {
        const decoded = verifyRequestToken(req);
        if (decoded.role !== "guest" && decoded.role !== "tenant") {
            throw new AuthError(403, "FORBIDDEN", "You don't have access to this area.");
        }
        enforcePasswordChangeScope(decoded, req);
        await assertAccountActive(decoded);
        if (decoded.role === "guest") req.guest = decoded;
        else req.tenant = decoded;
        next();
    } catch (error) {
        return sendAuthError(res, error);
    }
};

module.exports = guestOrTenantAuthMiddleware;
