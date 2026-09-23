const ActivityService = require("../services/activity.log.service");

const moduleFromPath = path => {
    const p = path.toLowerCase();
    if (p.includes("tenant")) return "tenants";
    if (p.includes("guest")) return "guests";
    if (p.includes("bill") || p.includes("payment")) return "payments";
    if (p.includes("maintenance")) return "maintenance";
    if (p.includes("document")) return "documents";
    if (p.includes("feedback")) return "feedbacks";
    if (p.includes("pg")) return "pgs";
    if (p.includes("notification")) return "messaging";
    if (p.includes("admin")) return "admins";
    return "system";
};

const actionFrom = (req) => {
    const method = req.method.toUpperCase();
    const p = req.path.toLowerCase();
    if (p.includes("message")) return "message_sent";
    if (p.includes("permissions")) return "permissions_updated";
    if (p.includes("export")) return "exported";
    if (method === "POST") return "created";
    if (method === "PUT" || method === "PATCH") return "updated";
    if (method === "DELETE") return "deleted";
    if (method === "GET") return "viewed";
    return method.toLowerCase();
};

module.exports = function activityAudit(req, res, next) {
    if (!req.admin) return next();
    const method = req.method.toUpperCase();
    const shouldLog = ["POST","PUT","PATCH","DELETE"].includes(method);
    if (!shouldLog) return next();

    res.on("finish", () => {
        if (res.statusCode >= 400) return;
        ActivityService.adminAction(req, actionFrom(req), moduleFromPath(req.originalUrl), {
            entityId: req.params?.id || null,
            entityType: moduleFromPath(req.originalUrl).replace(/s$/,""),
            metadata: {
                method,
                path: req.originalUrl,
                status: res.statusCode
            }
        });
    });
    next();
};
