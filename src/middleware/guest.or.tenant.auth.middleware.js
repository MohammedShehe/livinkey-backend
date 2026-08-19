// middleware/guest.or.tenant.auth.middleware.js
const jwt = require("jsonwebtoken");

/**
 * Middleware that accepts both guest AND tenant tokens.
 * - Sets req.guest for guest tokens
 * - Sets req.tenant for tenant tokens
 * - Rejects admin tokens (admins shouldn't access guest routes)
 * 
 * This is used for guest routes that need to work for both:
 * 1. Real guests (role = 'guest')
 * 2. Tenants using "Enter as Guest" feature (role = 'tenant')
 */
const guestOrTenantAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        // Check both headers AND query params (for downloads opened in new tab)
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Validate required fields
        if (!decoded.id || !decoded.role) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload."
            });
        }

        // Set appropriate property based on role
        if (decoded.role === 'guest') {
            req.guest = decoded;
        } else if (decoded.role === 'tenant') {
            req.tenant = decoded;
        } else {
            // Admin tokens are not allowed to access guest routes
            return res.status(403).json({
                success: false,
                message: "Access denied. Invalid user role."
            });
        }

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please login again."
            });
        }
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please login again."
        });
    }
};

module.exports = guestOrTenantAuthMiddleware;