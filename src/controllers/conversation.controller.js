/**
 * Conversation Controller
 * Admin side - view and reply to conversations
 */

const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const messagingService = require("../services/messaging.service");

/**
 * GET /api/conversations
 * List all conversations (with pagination + search)
 */
exports.listConversations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const where = { is_archived: false };

    const { count, rows } = await Conversation.findAndCountAll({
      where: { ...where, search },
      limit,
      offset,
    });

    return res.json({
      success: true,
      data: {
        conversations: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("List conversations error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

/**
 * GET /api/conversations/:id
 * Get single conversation + messages
 */
exports.getConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.findAll({
      where: { conversation_id: id },
      order: [["created_at", "ASC"]],
    });

    // Mark as read
    await Conversation.update(conversation.id, { unread_count: 0 });

    return res.json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
    });
  }
};

/**
 * POST /api/conversations/:id/reply
 * Admin replies to a conversation
 */
exports.replyToConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const adminId = req.admin?.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Send via dual channel
    const result = await messagingService.sendMessage({
      userId: conversation.user_id,
      userType: conversation.user_type,
      phone: conversation.phone,
      email: conversation.email,
      name: conversation.name,
      type: "text",
      body: message.trim(),
      metadata: {
        replied_by_admin: adminId,
      },
    });

    // Update conversation
    await Conversation.update(conversation.id, {
      last_message_at: new Date(),
    });

    return res.json({
      success: true,
      message: "Reply sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Reply error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send reply",
    });
  }
};

/**
 * PATCH /api/conversations/:id/archive
 */
exports.archiveConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    await Conversation.update(conversation.id, { is_archived: true });

    return res.json({
      success: true,
      message: "Conversation archived",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to archive conversation",
    });
  }
};


/**
 * GET /api/conversations/unread-count
 */
exports.unreadCount = async (req, res) => {
  try {
    const Conversation = require("../models/conversation.model");
    const count = await Conversation.getTotalUnread();
    return res.json({ success: true, unreadCount: count });
  } catch (error) {
    console.error("Unread count error:", error);
    return res.status(500).json({ success: false, message: "Failed to get unread count", unreadCount: 0 });
  }
};

