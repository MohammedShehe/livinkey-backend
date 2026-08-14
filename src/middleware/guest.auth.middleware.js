const jwt = require("jsonwebtoken");

const guestAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token is for a guest
        if (decoded.role !== 'guest') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Invalid user role."
            });
        }

        req.guest = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

module.exports = guestAuthMiddleware;