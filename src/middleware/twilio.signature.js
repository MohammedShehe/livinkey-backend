/**
 * Verifies that a webhook request really came from Twilio (X-Twilio-Signature).
 * Set TWILIO_VALIDATE_WEBHOOK=false only for local testing.
 */
const twilio = require("twilio");
const { API_URL } = require("../utils/links");

module.exports = (req, res, next) => {
    if (process.env.TWILIO_VALIDATE_WEBHOOK === "false") return next();

    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const signature = req.headers["x-twilio-signature"];
    if (!authToken || !signature) {
        return res.status(403).type("text/plain").send("Forbidden");
    }

    try {
        const url = `${API_URL}${req.originalUrl}`;
        const valid = twilio.validateRequest(authToken, signature, url, req.body || {});
        if (!valid) return res.status(403).type("text/plain").send("Forbidden");
        return next();
    } catch (err) {
        console.error("Twilio signature validation error:", err.message);
        return res.status(403).type("text/plain").send("Forbidden");
    }
};
