const ActivityLog = require("../models/activity.log.model");

const roleLabel = role => role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : role === "guest" ? "Guest" : "Tenant";

const getRequestIp = req => {
    const forwarded = req.headers["x-forwarded-for"];
    return (forwarded ? forwarded.split(",")[0].trim() : req.ip || "").replace("::ffff:", "") || null;
};

const log = async (req, data = {}) => {
    try {
        const actor = req.actor || {};
        const admin = req.admin;
        const tenant = req.tenant;
        const actorType = data.actorType || (admin ? "admin" : tenant?.role === "guest" ? "guest" : "tenant");
        let actorName = data.actorName || admin?.name || tenant?.full_name || tenant?.name || null;
        if (!actorName && admin?.id) {
            try {
                const db = require("../config/db");
                const [rows] = await db.execute("SELECT name FROM admins WHERE id=? LIMIT 1", [admin.id]);
                actorName = rows[0]?.name || null;
            } catch (_) {}
        }
        const actorPosition = data.actorPosition || (admin ? roleLabel(admin.role) : roleLabel(tenant?.role));
        return await ActivityLog.create({
            ...data,
            actorType,
            actorName,
            actorPosition,
            ipAddress: data.ipAddress || getRequestIp(req),
            userAgent: data.userAgent || req.get("user-agent"),
            performedByAdminId: data.performedByAdminId || admin?.id || null
        });
    } catch (error) {
        console.error("Activity log error:", error.message);
        return null;
    }
};

const adminAction = (req, action, module, entity = {}) =>
    log(req, {
        actorType: "admin",
        action, module,
        entityType: entity.entityType || null,
        entityId: entity.entityId || null,
        tenantId: entity.tenantId || null,
        guestId: entity.guestId || null,
        pgId: entity.pgId || null,
        metadata: entity.metadata || {}
    });

module.exports = { log, adminAction, roleLabel };
