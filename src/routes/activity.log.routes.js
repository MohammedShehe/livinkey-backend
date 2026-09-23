const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/activity.log.controller");

router.use(auth);
router.get("/users", controller.getUsers);
router.get("/", controller.getActivities);
router.get("/stats", controller.getStats);
router.get("/export", controller.exportCsv);
router.post("/:id/message", controller.sendMessage);

module.exports = router;
