// middleware/guest.auth.middleware.js
const {
    sendAuthError, verifyRequestToken, assertAccountActive, enforcePasswordChangeScope, AuthError
} = require("../utils/auth.core");

const guestAuthMiddleware = async (req, res, next) => {
    try {
        const decoded = verifyRequestToken(req);
        if (decoded.role !== "guest") {
            throw new AuthError(403, "FORBIDDEN", "You don't have access to this area.");
        }
        enforcePasswordChangeScope(decoded, req);
        await assertAccountActive(decoded);
        req.guest = decoded;
        next();
    } catch (error) {
        return sendAuthError(res, error);
    }
};

module.exports = guestAuthMiddleware;
