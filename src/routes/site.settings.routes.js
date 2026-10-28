const express = require("express");
const router = express.Router();

const siteSettingsController = require("../controllers/site.settings.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const activityAudit = require("../middleware/activity.audit.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

// Admin only
router.get(
  "/manual-stats",
  authMiddleware,
  activityAudit,
  roleMiddleware("super_admin", "admin"),
  siteSettingsController.getManualStats
);

router.put(
  "/manual-stats",
  authMiddleware,
  activityAudit,
  roleMiddleware("super_admin", "admin"),
  siteSettingsController.updateManualStats
);

router.patch(
  "/manual-stats",
  authMiddleware,
  activityAudit,
  roleMiddleware("super_admin", "admin"),
  siteSettingsController.updateManualStats
);

// Website control (Livinkey public site)
router.get(
  "/website",
  authMiddleware,
  roleMiddleware("super_admin", "admin"),
  permissionMiddleware("about_livinkey", "view"),
  siteSettingsController.getWebsiteSettings
);

router.put(
  "/website",
  authMiddleware,
  activityAudit,
  roleMiddleware("super_admin", "admin"),
  permissionMiddleware("about_livinkey", "edit"),
  siteSettingsController.updateWebsiteSettings
);

module.exports = router;
