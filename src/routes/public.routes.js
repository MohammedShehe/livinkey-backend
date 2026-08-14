const express = require("express");
const router = express.Router();

const publicPGController = require("../controllers/public.pg.controller");

// Public welcome message (No Auth)
router.get("/welcome", publicPGController.getWelcomeMessage);

// Public PG routes (No Auth Required)
router.get("/pgs/stats", publicPGController.getPGStats);
router.get("/pgs", publicPGController.getAllPGs);
router.get("/pgs/:id", publicPGController.getPGDetails);

module.exports = router;