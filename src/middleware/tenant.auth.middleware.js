// middleware/tenant.auth.middleware.js
const {
    sendAuthError, verifyRequestToken, assertAccountActive, enforcePasswordChangeScope, AuthError
} = require("../utils/auth.core");

const tenantAuthMiddleware = async (req, res, next) => {
    try {
        const decoded = verifyRequestToken(req);
        if (decoded.role !== "tenant") {
            throw new AuthError(403, "FORBIDDEN", "You don't have access to this area.");
        }
        enforcePasswordChangeScope(decoded, req);
        await assertAccountActive(decoded);
        req.tenant = decoded;
        next();
    } catch (error) {
        return sendAuthError(res, error);
    }
};

module.exports = tenantAuthMiddleware;
