const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.admin || !req.admin.role) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized. Admin role not found."
            });
        }

        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to perform this action."
            });
        }

        next();
    };
};

module.exports = roleMiddleware;