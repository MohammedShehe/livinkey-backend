const express = require("express");
const router = express.Router();

const chatbotController = require("../controllers/chatbot.controller");

// Public chatbot: only public PG information is returned.
router.get("/quick-questions", chatbotController.getQuickQuestions);
router.post("/ask", chatbotController.ask);

module.exports = router;
