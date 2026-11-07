# Twilio setup – WhatsApp → SMS → Email

Every OTP, bill, fine, reminder, notice, inbox reply and forwarded maintenance request goes through
`src/services/messaging.service.js`:

1. **WhatsApp** (Twilio) – first choice.
2. **SMS** (Twilio) – used when WhatsApp is rejected right away *or* Twilio reports a late failure
   (person not on WhatsApp, 24-hour window closed, template not approved …).
3. **Email** – used when SMS fails too (only for messages to Livinkey users who have an email).

Late failures arrive at `POST /api/webhooks/twilio/status`, which hands the message to the next channel.
**This webhook must be reachable**, otherwise only immediate failures can fall back.

## 1. `.env` (use your NEW credentials – the old ones are expired)
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
PUBLIC_API_URL=https://api.livinkey.com        # exact public host Twilio calls (signature check uses it)
TWILIO_WHATSAPP_FROM=whatsapp:+1XXXXXXXXXX     # or TWILIO_WHATSAPP_MESSAGING_SERVICE_SID=MG...
TWILIO_SMS_FROM=+1XXXXXXXXXX                   # or TWILIO_MESSAGING_SERVICE_SID=MG...
DEFAULT_COUNTRY_CODE=91                        # for numbers saved without a country code
MESSAGING_CHANNELS=whatsapp,sms,email          # remove one to switch it off, order = fallback order
```
Open **Admin → Settings/Overview → Integrations**: WhatsApp and SMS show *configured* when set.

## 2. Twilio Console
* **WhatsApp sender** → Messaging → Senders → WhatsApp. Set *"When a message comes in"* to
  `https://api.livinkey.com/api/webhooks/twilio/whatsapp` and *Status callback* to
  `https://api.livinkey.com/api/webhooks/twilio/status`.
* **SMS** → buy/assign a number. **India:** SMS to Indian numbers needs DLT registration (sender ID + templates);
  until that is done Twilio will report SMS failures, and the chain simply continues to email.
  Tanzania/other countries may need a registered alphanumeric sender – check Twilio's country guidelines.

## 3. WhatsApp templates (needed to message people who haven't written to you in the last 24 hours)
Create these in Twilio → Content Template Builder, submit for WhatsApp approval, then paste each `HX…` SID in `.env`.
Without a template the free-form text is tried first and, if WhatsApp refuses it, SMS/email take over.

| .env key | Category | Variables | Suggested body |
|---|---|---|---|
| `TWILIO_OTP_CONTENT_SID` | Authentication | `{{1}}` = code | *(Meta's standard authentication template, with copy-code button)* |
| `TWILIO_BILL_CONTENT_SID` | Utility | 1 name, 2 amount, 3 due date, 4 bill ref | `Hi {{1}}, your Livinkey bill of {{2}} is due on {{3}} (ref {{4}}). Open the Livinkey app to pay.` |
| `TWILIO_FINE_CONTENT_SID` | Utility | 1 name, 2 amount, 3 reason | `Hi {{1}}, a fine of {{2}} was added to your account: {{3}}. Open the Livinkey app for details.` |
| `TWILIO_EFRRO_CONTENT_SID` | Utility | 1 name, 2 days | `Hi {{1}}, your e-FRRO registration needs attention: {{2}}.` |
| `TWILIO_CUSTOM_CONTENT_SID` | Utility | 1 title, 2 message | `{{1}}: {{2}} — Livinkey` |
| `TWILIO_MAINTENANCE_CONTENT_SID` | Utility | 1 name, 2 request, 3 location, 4 details | `Hello {{1}}, maintenance request {{2}} at {{3}}. {{4}} — forwarded from Livinkey.` |

A value that is not a real SID (e.g. the `HXxxxxxxxx` placeholder) is ignored automatically.

## 4. What the admin sees
* **Conversations**: every message with ticks (sending → sent → delivered → read), the channel it finally used,
  and the reason when nothing could be delivered. Replies outside WhatsApp's 24-hour window say so up front.
* **Maintenance → forward icon**: type any number (+country code), optional name/note, send. The server sends the
  full details by WhatsApp (SMS if needed) and logs it (`maintenance_forwards`); the modal shows past forwards and
  delivery state.

## 5. Security notes
* OTPs are never stored in plain text: the inbox shows "Verification code sent", and the retry payload is encrypted
  (`utils/secret.box.js`, keyed from JWT_SECRET) and wiped once the message is delivered or the chain ends.
* New tables (`message_deliveries`, `maintenance_forwards`) are created automatically at server start.
