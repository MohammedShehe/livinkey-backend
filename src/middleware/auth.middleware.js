const {
    sendAuthError, verifyRequestToken, assertAccountActive, enforcePasswordChangeScope, AuthError
} = require("../utils/auth.core");

const authMiddleware = async (req, res, next) => {
    try {
        const decoded = verifyRequestToken(req);
        if (decoded.role !== "super_admin" && decoded.role !== "admin") {
            throw new AuthError(403, "FORBIDDEN", "You don't have access to this area.");
        }
        enforcePasswordChangeScope(decoded, req);
        const account = await assertAccountActive(decoded);
        // Trust the role stored in the database, not the one baked into an old token.
        decoded.role = account.role || decoded.role;
        req.admin = decoded;
        next();
    } catch (error) {
        return sendAuthError(res, error);
    }
};

module.exports = authMiddleware;
