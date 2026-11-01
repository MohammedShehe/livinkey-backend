const express = require("express");
const router = express.Router();
const controller = require("../controllers/electricity.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const permission = require("../middleware/permission.middleware");
const activityAudit = require("../middleware/activity.audit.middleware");

router.use(auth, role("super_admin", "admin"), activityAudit);

// Billing staff use these while creating a bill
router.post("/calculate", permission("bills", "add"), controller.calculate);
router.get("/last-reading", permission("bills", "add"), controller.lastReading);
router.get("/settings", permission("bills", "view"), controller.listSettings);
router.get("/settings/:pgId", permission("bills", "view"), controller.getSettings);

// Only a Super Admin may change tariffs
router.put("/settings/:pgId", role("super_admin"), controller.saveSettings);
router.post("/settings/:pgId/copy", role("super_admin"), controller.copySettings);

module.exports = router;
