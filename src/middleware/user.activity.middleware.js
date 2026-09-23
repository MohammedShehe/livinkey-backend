const db = require("../config/db");
const ActivityService = require("../services/activity.log.service");

const moduleFrom = p => {
    p = p.toLowerCase();
    if (p.includes("document")) return "documents";
    if (p.includes("bill")) return "bills";
    if (p.includes("payment")) return "payments";
    if (p.includes("maintenance")) return "maintenance";
    if (p.includes("feedback")) return "feedbacks";
    if (p.includes("notification")) return "notifications";
    if (p.includes("profile")) return "profile";
    if (p.includes("home")) return "home";
    return "app";
};
const actionFrom = (req) => {
    const m=req.method.toUpperCase(), p=req.path.toLowerCase();
    if (p.includes("fcm-token")) return m==="DELETE" ? "device_deactivated" : "device_registered";
    if (p.includes("download")) return "document_downloaded";
    if (p.includes("read")) return "notification_read";
    if (p.includes("password")) return "password_changed";
    if (m==="POST") return "created";
    if (m==="PUT"||m==="PATCH") return "updated";
    if (m==="DELETE") return "deleted";
    return "viewed";
};
module.exports = function userActivity(req,res,next) {
    const user = req.tenant || req.guest;
    if (!user) return next();
    const m=req.method.toUpperCase();
    const p=req.path.toLowerCase();
    const shouldLog = ["POST","PUT","PATCH","DELETE"].includes(m) ||
        (m==="GET" && !p.includes("/stats") && !p.includes("/device/fcm-token"));
    if (!shouldLog) return next();
    res.on("finish", async () => {
        if (res.statusCode >= 400) return;
        try {
            const [rows] = await db.execute(
                `SELECT t.id,t.full_name,t.role,td.pg_id FROM tenants t LEFT JOIN tenant_details td ON td.tenant_id=t.id WHERE t.id=? LIMIT 1`,
                [user.id]
            );
            const person=rows[0];
            if (!person) return;
            await ActivityService.log(req,{
                actorType: person.role==="guest"?"guest":"tenant",
                actorName: person.full_name,
                actorPosition: person.role==="guest"?"Guest":"Tenant",
                tenantId: person.role==="tenant"?person.id:null,
                guestId: person.role==="guest"?person.id:null,
                pgId: person.pg_id || null,
                action: actionFrom(req),
                module: moduleFrom(req.originalUrl),
                entityId: req.params?.id || null,
                entityType: moduleFrom(req.originalUrl),
                metadata:{method:m,path:req.originalUrl,status:res.statusCode}
            });
        } catch(e) { console.error("User activity log error:",e.message); }
    });
    next();
};
