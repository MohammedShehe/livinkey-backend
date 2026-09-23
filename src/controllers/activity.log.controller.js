const db = require("../config/db");
const ActivityLog = require("../models/activity.log.model");
const ActivityService = require("../services/activity.log.service");
const TenantNotificationService = require("../services/tenant.notification.service");
const GuestNotificationService = require("../services/guest.notification.service");
const Firebase = require("../config/firebase");
const MailService = require("../services/mail.service");

const can = async (req, action) => {
    if (req.admin.role === "super_admin") return true;
    const [rows] = await db.execute(
        `SELECT can_view, can_message, can_export FROM admin_permissions WHERE admin_id = ? AND module_name = 'activity_logs' LIMIT 1`,
        [req.admin.id]
    );
    return !!rows[0]?.[`can_${action}`];
};

const getUsers = async (req, res) => {
    try {
        if (!await can(req, "view")) return res.status(403).json({success:false,message:"You don't have permission to view activity logs."});
        const {search = "", role = "", pg_id = "", module = "", action = "", from = "", to = ""} = req.query;
        const [rows] = await db.execute(`
            SELECT t.id, t.full_name, t.email, t.phone, t.role, t.is_active,
                   td.pg_id, p.name AS pg_name,
                   EXISTS(SELECT 1 FROM tenant_devices d WHERE d.tenant_id=t.id AND d.is_active=1) AS installed,
                   (SELECT MAX(d.updated_at) FROM tenant_devices d WHERE d.tenant_id=t.id AND d.is_active=1) AS last_app_activity,
                   (SELECT al.action FROM activity_logs al WHERE (al.tenant_id=t.id OR al.guest_id=t.id) ORDER BY al.created_at DESC, al.id DESC LIMIT 1) AS recent_action,
                   (SELECT al.created_at FROM activity_logs al WHERE (al.tenant_id=t.id OR al.guest_id=t.id) ORDER BY al.created_at DESC, al.id DESC LIMIT 1) AS recent_activity_at,
                   (SELECT COALESCE(al.actor_name, a.name, 'System') FROM activity_logs al LEFT JOIN admins a ON a.id=al.performed_by_admin_id WHERE (al.tenant_id=t.id OR al.guest_id=t.id) ORDER BY al.created_at DESC, al.id DESC LIMIT 1) AS recent_actor_name,
                   (SELECT COALESCE(al.actor_position, CASE WHEN a.role='super_admin' THEN 'Super Admin' WHEN a.role='admin' THEN 'Admin' ELSE 'System' END, 'System') FROM activity_logs al LEFT JOIN admins a ON a.id=al.performed_by_admin_id WHERE (al.tenant_id=t.id OR al.guest_id=t.id) ORDER BY al.created_at DESC, al.id DESC LIMIT 1) AS recent_actor_position
            FROM tenants t
            LEFT JOIN tenant_details td ON td.tenant_id=t.id
            LEFT JOIN pgs p ON p.id=td.pg_id
            WHERE t.role IN ('tenant','guest')
              AND (? = '' OR t.full_name LIKE ? OR t.email LIKE ? OR t.phone LIKE ?)
              AND (? = '' OR t.role = ?)
              AND (? = '' OR td.pg_id = ?)
              AND (? = '' OR EXISTS (SELECT 1 FROM activity_logs al WHERE (al.tenant_id=t.id OR al.guest_id=t.id) AND al.module=?))
              AND (? = '' OR EXISTS (SELECT 1 FROM activity_logs al WHERE (al.tenant_id=t.id OR al.guest_id=t.id) AND al.action=?))
              AND (? = '' OR EXISTS (SELECT 1 FROM activity_logs al WHERE (al.tenant_id=t.id OR al.guest_id=t.id) AND al.created_at >= CONCAT(?, ' 00:00:00')))
              AND (? = '' OR EXISTS (SELECT 1 FROM activity_logs al WHERE (al.tenant_id=t.id OR al.guest_id=t.id) AND al.created_at <= CONCAT(?, ' 23:59:59')))
            ORDER BY t.full_name
        `, [search, `%${search}%`, `%${search}%`, `%${search}%`, role, role, pg_id, pg_id,
            module, module, action, action, from, from, to, to]);
        res.json({success:true,data:rows});
    } catch (e) {
        console.error("Activity users error:", e);
        res.status(500).json({success:false,message:"Internal server error"});
    }
};

const getActivities = async (req, res) => {
    try {
        if (!await can(req, "view")) return res.status(403).json({success:false,message:"You don't have permission to view activity logs."});
        const data = {...req.query};
        const [rows,total] = await Promise.all([ActivityLog.list(data), ActivityLog.count(data)]);
        res.json({success:true,data:rows,total});
    } catch (e) {
        console.error("Activity list error:", e);
        res.status(500).json({success:false,message:"Internal server error"});
    }
};

const getStats = async (req,res) => {
    try {
        if (!await can(req,"view")) return res.status(403).json({success:false,message:"You don't have permission to view activity logs."});
        res.json({success:true,data:await ActivityLog.getStats()});
    } catch(e) {
        console.error("Activity stats error:",e);
        res.status(500).json({success:false,message:"Internal server error"});
    }
};

const sendMessage = async (req,res) => {
    try {
        if (!await can(req,"message")) return res.status(403).json({success:false,message:"You don't have permission to message tenants."});
        const id = Number(req.params.id);
        const {title, message, subject = ""} = req.body;
        if (!id || !title?.trim() || !message?.trim()) return res.status(400).json({success:false,message:"Title and message are required."});

        const [rows] = await db.execute(`
            SELECT t.id, t.full_name, t.email, t.role, t.is_active
            FROM tenants t WHERE t.id=? AND t.role IN ('tenant','guest') LIMIT 1`, [id]);
        if (!rows.length) return res.status(404).json({success:false,message:"Tenant or guest not found."});
        const person = rows[0];
        if (!person.is_active) return res.status(400).json({success:false,message:"This account is inactive."});

        const data = {
            title: title.trim(), message: message.trim(), entity_id: null,
            entity_type: "admin_message", link: "/tenant-notifications",
            icon: "📢", color: "#3498db"
        };

        let inAppSent = 0, pushSent = 0, emailSent = 0;
        if (person.role === "guest") {
            inAppSent = await GuestNotificationService.sendGuestNotification(id, "ADMIN_MESSAGE", data);
        } else {
            inAppSent = await TenantNotificationService.sendTenantNotification(id, "ADMIN_MESSAGE", data, {title:data.title, body:data.message});
        }

        // Guests use the same tenants table/device infrastructure, so FCM works for both roles.
        const tokens = await Firebase.getTenantFCMTokens(id);
        if (tokens.length && process.env.ENABLE_PUSH_NOTIFICATIONS === "true") {
            const result = await Firebase.sendPushNotificationToMultiple(tokens, {title:data.title, body:data.message}, {type:"admin_message",action:"open"});
            if (Array.isArray(result)) pushSent = result.reduce((n,r)=>n+(r.successCount||0),0);
        }

        let adminName = req.admin.name || null;
        if (!adminName) {
            const [adminRows] = await db.execute("SELECT name FROM admins WHERE id=? LIMIT 1", [req.admin.id]);
            adminName = adminRows[0]?.name || "Livinkey Admin";
        }

        if (person.email) {
            try {
                await MailService.sendCustomAdminNotificationEmail(person.email, person.full_name, subject.trim() || title.trim(), message.trim(), adminName);
                emailSent = 1;
            } catch (e) {
                console.error("Activity message email failed:", e.message);
            }
        }

        await ActivityService.adminAction(req, "admin_message_sent", "messaging", {
            tenantId: person.role === "tenant" ? id : null,
            guestId: person.role === "guest" ? id : null,
            entityType: "person", entityId: id,
            metadata: {title:title.trim(), subject:(subject||"").trim(), channels:{in_app:!!inAppSent,push:pushSent,email:!!emailSent}}
        });

        res.json({success:true,message:"Message sent successfully.",data:{in_app_sent:inAppSent,push_sent:pushSent,email_sent:emailSent}});
    } catch(e) {
        console.error("Activity message error:",e);
        res.status(500).json({success:false,message:"Internal server error"});
    }
};

const exportCsv = async (req,res) => {
    try {
        if (!await can(req,"export")) return res.status(403).json({success:false,message:"You don't have permission to export activity data."});
        const rows = await ActivityLog.list({...req.query,limit:500});
        const headers = ["Date","Person","Position","Action","Module","PG","Performed By","Metadata"];
        const esc = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
        const lines = [headers.join(","), ...rows.map(r => [
            r.created_at, r.tenant_name || r.actor_name, r.actor_position, r.action, r.module, r.pg_name,
            r.admin_name ? `${r.admin_name}, ${r.admin_role === "super_admin" ? "Super Admin" : "Admin"}` : "",
            JSON.stringify(r.metadata)
        ].map(esc).join(","))];
        res.setHeader("Content-Type","text/csv; charset=utf-8");
        res.setHeader("Content-Disposition",'attachment; filename="livinkey-activity-logs.csv"');
        res.send(lines.join("\n"));
        ActivityService.adminAction(req,"activity_exported","activity_logs",{metadata:{rows:rows.length}});
    } catch(e) {
        console.error("Activity export error:",e);
        res.status(500).json({success:false,message:"Internal server error"});
    }
};

module.exports = { getUsers, getActivities, getStats, sendMessage, exportCsv };
