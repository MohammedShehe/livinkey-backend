# Livinkey WhatsApp + Conversation Module
## Integration Guide (Production Ready)

This module adds:
- WhatsApp as **primary** messaging channel (via Twilio)
- Email as **automatic fallback**
- Full **Conversation Management** (inbox + reply)

---

## 1. Install Dependency

```bash
npm install twilio
```

---

## 2. Copy Files

Copy the folders into your backend `src/`:

```
src/
├── services/
│   ├── whatsapp.service.js
│   └── messaging.service.js
├── models/
│   ├── conversation.model.js
│   └── message.model.js
├── controllers/
│   ├── conversation.controller.js
│   └── whatsapp.webhook.controller.js
├── routes/
│   ├── conversation.routes.js
│   └── webhook.routes.js
```

> Adjust `require` paths inside the files according to your project structure (especially `config/db` and auth middleware).

---

## 3. Database Migration

Run the SQL file:

```bash
mysql -u your_user -p your_database < migrations/001_create_conversations_and_messages.sql
```

Or execute the SQL manually in your database tool.

---

## 4. Environment Variables

Copy `.env.example` values into your main `.env` and fill them:

```env
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_WHATSAPP_FROM=whatsapp:+91xxxxxxxxxx
```

(See full comments inside `.env.example`)

---

## 5. Register Routes in app.js / server.js

```js
// Webhooks (must be public - no auth)


// Conversations (admin only)

```

---

## 6. Configure Twilio Webhooks

In Twilio Console → WhatsApp Senders → your number:

**When a message comes in**  
`https://your-domain.com/api/webhooks/twilio/whatsapp`

**Status callback URL**  
`https://your-domain.com/api/webhooks/twilio/status`

---

## 7. How to Use in Existing Code

### Replace old email OTP calls:

**Old:**
```js
await sendOTPEmail(user.email, otp, "Login");
```

**New:**
```js
const messagingService = require("../services/messaging.service");
await messagingService.sendOTP(user, otp, "Login");
```

### Send Bill:
```js
await messagingService.sendBill(tenant, {
  amount: 8500,
  dueDate: "2026-10-05",
  billId: "BILL-1024"
});
```

### Send Fine:
```js
await messagingService.sendFine(tenant, {
  amount: 500,
  reason: "Late payment"
});
```

### Send Custom Message:
```js
await messagingService.sendCustom(tenant, "Important Notice", "Please submit your documents by Friday.");
```

---

## 8. Admin Conversation Inbox APIs

| Method | Endpoint | Description |
|--------|----------|-----------|
| GET | `/api/conversations` | List all conversations |
| GET | `/api/conversations/:id` | Get conversation + messages |
| POST | `/api/conversations/:id/reply` | Admin reply |
| PATCH | `/api/conversations/:id/archive` | Archive conversation |

---

## 9. Recommended Template Setup (Twilio)

Create these Content Templates in Twilio (Utility / Authentication category):

1. **OTP Template**
2. **Bill Notification**
3. **Fine Notification**
4. **e-FRRO Expiry**

Then put the Content SIDs in `.env`.

---

## 10. Testing Checklist

- [ ] Send OTP → should go via WhatsApp
- [ ] Disable phone → should fall back to Email
- [ ] User replies on WhatsApp → appears in Conversation inbox
- [ ] Admin replies from `/api/conversations/:id/reply`
- [ ] Delivery status updates correctly

---

## Support Notes

- Always keep Email as fallback.
- Users without phone number will only receive Email.
- For production, use approved Content Templates (required outside 24-hour window).
- Monitor Twilio logs for failed messages.

---

**You are ready.**  
Just fill the `.env` values and integrate the routes.
