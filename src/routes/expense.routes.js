const express = require("express");
const router = express.Router();
const controller = require("../controllers/expense.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const permission = require("../middleware/permission.middleware");
const upload = require("../middleware/upload.middleware");
const activityAudit = require("../middleware/activity.audit.middleware");

router.use(auth, role("super_admin", "admin"), activityAudit);

router.get("/meta", permission("expenses", "view"), controller.meta);
router.get("/stats", permission("expenses", "view"), controller.stats);
router.get("/", permission("expenses", "view"), controller.list);
router.post("/", permission("expenses", "add"), upload.single("receipt"), controller.create);
router.put("/:id", permission("expenses", "edit"), upload.single("receipt"), controller.update);
router.delete("/:id", permission("expenses", "delete"), controller.remove);

module.exports = router;
