/**
 * Conversation Routes
 */

const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversation.controller");
const authMiddleware = require("../middleware/auth.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

// All routes require admin authentication
router.use(authMiddleware);

router.get("/", permissionMiddleware("conversations", "view"), conversationController.listConversations);
router.get("/unread-count", permissionMiddleware("conversations", "view"), conversationController.unreadCount);
router.get("/:id", permissionMiddleware("conversations", "view"), conversationController.getConversation);
router.post("/:id/reply", permissionMiddleware("conversations", "message"), conversationController.replyToConversation);
router.patch("/:id/archive", permissionMiddleware("conversations", "edit"), conversationController.archiveConversation);

module.exports = router;
