const chatbotService = require("../services/chatbot.service");

/**
 * Public chatbot endpoint.
 *
 * Important:
 * - No PG/rent/amenity facts are hardcoded here.
 * - All factual answers are generated from the current MySQL data.
 * - Only public PG information is exposed.
 */
exports.getQuickQuestions = async (req, res) => {
    try {
        const data = await chatbotService.getQuickQuestions();

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Chatbot quick questions error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load chatbot questions right now."
        });
    }
};

exports.ask = async (req, res) => {
    try {
        const question = typeof req.body?.question === "string"
            ? req.body.question.trim()
            : "";

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Please enter a question."
            });
        }

        if (question.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Question is too long."
            });
        }

        const data = await chatbotService.answerQuestion(question);

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Chatbot answer error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to answer your question right now."
        });
    }
};
