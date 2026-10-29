/**
 * Short-lived (5 min), GET-only download tokens.
 * Clients exchange their normal session token for one of these before opening
 * a PDF / receipt / export in a browser or external viewer, so the real
 * session token never appears in a URL.
 */
const express = require("express");
const router = express.Router();
const { signDownloadToken } = require("../utils/auth.core");
const authMiddleware = require("../middleware/auth.middleware");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const guestOrTenantAuthMiddleware = require("../middleware/guest.or.tenant.auth.middleware");

const issue = (getUser) => (req, res) => {
    const user = getUser(req);
    return res.json({
        success: true,
        token: signDownloadToken({ id: user.id, role: user.role, email: user.email }),
        expires_in: 300
    });
};

router.post("/admin", authMiddleware, issue((req) => req.admin));
router.post("/tenant", tenantAuthMiddleware, issue((req) => req.tenant));
router.post("/guest", guestOrTenantAuthMiddleware, issue((req) => req.guest || req.tenant));

module.exports = router;
