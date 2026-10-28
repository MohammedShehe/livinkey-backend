const express = require("express");
const router = express.Router();

const publicPGController = require("../controllers/public.pg.controller");
const siteSettingsController = require("../controllers/site.settings.controller");

// Public welcome message (No Auth)
router.get("/welcome", publicPGController.getWelcomeMessage);

// Public website configuration (announcement, contact, maintenance flags)
router.get("/site-config", siteSettingsController.getPublicConfig);

// Public PG routes (No Auth Required)
router.get("/pgs/stats", publicPGController.getPGStats);
router.get("/pgs", publicPGController.getAllPGs);
router.get("/pgs/:id", publicPGController.getPGDetails);

module.exports = router;