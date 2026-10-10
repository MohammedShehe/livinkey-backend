# Livinkey WhatsApp Messaging + Conversation Module

Production-ready module to add:

- **WhatsApp** as primary channel (Twilio)
- **Email** as automatic fallback
- Full **Conversation Management** (inbox + reply)

## Quick Start

1. Read `docs/INTEGRATION_GUIDE.md`
2. Copy `.env.example` values into your main `.env`
3. Run the SQL migration
4. Register the routes
5. Configure Twilio webhooks

## Folder Structure

```
├── services/
│   ├── whatsapp.service.js      # Twilio WhatsApp client
│   └── messaging.service.js     # Dual channel (WA + Email) + logging
├── models/
│   ├── conversation.model.js
│   └── message.model.js
├── controllers/
│   ├── conversation.controller.js
│   └── whatsapp.webhook.controller.js
├── routes/
│   ├── conversation.routes.js
│   └── webhook.routes.js
├── migrations/
│   └── 001_create_conversations_and_messages.sql
├── docs/
│   └── INTEGRATION_GUIDE.md
└── .env.example
```

## License
Internal use for Livinkey project.
