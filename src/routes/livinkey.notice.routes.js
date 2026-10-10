const express = require("express");
const router = express.Router();

const controller = require("../controllers/livinkey.notice.controller");
const authMiddleware = require("../middleware/auth.middleware");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const upload = require("../middleware/upload.middleware");

// Tenant-only endpoint. Guests have no route or middleware access.
router.get("/tenant", tenantAuthMiddleware, controller.getTenantNotices);

// Admin management.
router.use(authMiddleware, roleMiddleware("super_admin", "admin"));
router.get("/", permissionMiddleware("about_livinkey", "view"), controller.getAdminNotices);
router.post("/", permissionMiddleware("about_livinkey", "add"), upload.array("notices", 5), controller.uploadNotices);
router.put("/:id", permissionMiddleware("about_livinkey", "edit"), upload.single("notice"), controller.replaceNotice);
router.delete("/:id", permissionMiddleware("about_livinkey", "delete"), controller.deleteNotice);

module.exports = router;
