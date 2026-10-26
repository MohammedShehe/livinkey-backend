const express = require("express");
const router = express.Router();

const siteSettingsController = require("../controllers/site.settings.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const activityAudit = require("../middleware/activity.audit.middleware");

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

module.exports = router;
