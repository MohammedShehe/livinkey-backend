/**
 * One place that decides WHAT every notification says on every channel, so a tenant sees the
 * same, professional wording whether it arrives on WhatsApp, SMS or e-mail.
 *
 *   compose(type, data, { name }) -> {
 *     whatsapp: { text, template: { envKey, variables } | null },
 *     sms:      string,
 *     email:    { title, text }          // used by the generic e-mail fallback
 *     preview:  string                   // what the admin inbox shows (never contains an OTP)
 *   }
 *
 * WhatsApp business-initiated messages must use an approved template. When the matching
 * TWILIO_*_CONTENT_SID is set the template is used; otherwise the free-form `text` is sent
 * (that only works inside WhatsApp's 24-hour window – outside it Twilio rejects it and the
 * delivery chain automatically falls through to SMS and then e-mail).
 */

const BRAND = "Livinkey";

const firstName = (name) => String(name || "").trim().split(/\s+/)[0] || "there";

const inr = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v ?? "");
    const hasFraction = Math.abs(n - Math.round(n)) > 0.004;
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: hasFraction ? 2 : 0, maximumFractionDigits: 2 });
};

const fmtDate = (d) => {
    if (!d) return "";
    const date = d instanceof Date ? d : new Date(String(d).length <= 10 ? `${d}T00:00:00` : d);
    if (Number.isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const clip = (s, n) => {
    const t = String(s ?? "").trim();
    return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
};

/** Twilio/Meta rules for template variables: no newlines or tabs, no 4+ spaces, never empty. */
const tplVar = (v, max = 900) => {
    let s = String(v ?? "")
        .replace(/\r?\n+/g, " | ")
        .replace(/\t/g, " ")
        .replace(/ {2,}/g, " ")
        .trim();
    if (!s) s = "-";
    return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
};

const compose = (type, data = {}, { name = "there" } = {}) => {
    const hi = firstName(name);

    switch (type) {
        case "otp": {
            const purpose = data.purpose || "Login";
            const minutes = data.validMinutes || 5;
            const vars = { 1: tplVar(data.otp) };
            if (String(process.env.TWILIO_OTP_PURPOSE_VAR || "").toLowerCase() === "true") vars[2] = tplVar(purpose);
            return {
                whatsapp: {
                    text: `*${BRAND}* · ${purpose} verification\n\nYour one-time code is *${data.otp}*.\nIt is valid for ${minutes} minutes.\n\nFor your security, never share this code with anyone. ${BRAND} staff will never ask for it.`,
                    template: { envKey: "TWILIO_OTP_CONTENT_SID", variables: vars },
                },
                sms: `${BRAND}: ${data.otp} is your verification code for ${purpose}. Valid for ${minutes} minutes. Do not share it with anyone.`,
                email: { title: `${purpose} verification code`, text: `Your one-time code is ${data.otp}. It is valid for ${minutes} minutes.` },
                preview: `${purpose} verification code sent`,
            };
        }

        case "bill": {
            const amount = inr(data.amount);
            const due = fmtDate(data.dueDate);
            const ref = data.billId ? `#${data.billId}` : "";
            const month = data.billingMonth ? ` for ${data.billingMonth}` : "";
            return {
                whatsapp: {
                    text: `*New bill · ${BRAND}*\n\nHello ${hi}, your bill${month} is ready.\n\n• Amount due: *${amount}*\n${due ? `• Due date: *${due}*\n` : ""}${ref ? `• Bill ref: ${ref}\n` : ""}\nOpen the ${BRAND} app to see the full breakdown and pay securely.`,
                    template: { envKey: "TWILIO_BILL_CONTENT_SID", variables: { 1: tplVar(name), 2: tplVar(amount), 3: tplVar(due || "-"), 4: tplVar(ref || "-") } },
                },
                sms: `${BRAND}: Hello ${hi}, your bill${month} of ${amount} is ready${due ? `, due ${due}` : ""}${ref ? ` (Ref ${ref})` : ""}. Open the ${BRAND} app to pay.`,
                email: { title: "Your new bill", text: `Your bill${month} of ${amount} is ready${due ? ` and due on ${due}` : ""}. Open the ${BRAND} app to see the breakdown and pay.` },
                preview: `New bill ${amount}${due ? ` · due ${due}` : ""}`,
            };
        }

        case "fine": {
            const amount = inr(data.amount ?? data.fineAmount);
            const reason = data.reason || "Late payment";
            return {
                whatsapp: {
                    text: `*Late fee applied · ${BRAND}*\n\nHello ${hi}, a late fee of *${amount}* has been added to your bill.\n\n• Reason: ${reason}\n\nPlease clear your dues in the ${BRAND} app to avoid further charges.`,
                    template: { envKey: "TWILIO_FINE_CONTENT_SID", variables: { 1: tplVar(name), 2: tplVar(amount), 3: tplVar(reason) } },
                },
                sms: `${BRAND}: Hello ${hi}, a late fee of ${amount} was added to your bill. ${clip(reason, 120)}. Please pay via the ${BRAND} app.`,
                email: { title: "Late fee applied", text: `A late fee of ${amount} has been added to your bill. ${reason}` },
                preview: `Late fee ${amount} applied`,
            };
        }

        case "efrro": {
            const days = data.daysLeft ?? data.days_until_expiry;
            const when = Number(days) <= 0 ? "has expired" : `expires in ${days} day${Number(days) === 1 ? "" : "s"}`;
            return {
                whatsapp: {
                    text: `*e-FRRO reminder · ${BRAND}*\n\nHello ${hi}, your e-FRRO registration ${when}.\n\nPlease renew it as soon as possible to stay compliant. Contact the ${BRAND} team if you need help.`,
                    template: { envKey: "TWILIO_EFRRO_CONTENT_SID", variables: { 1: tplVar(name), 2: tplVar(days) } },
                },
                sms: `${BRAND}: Hello ${hi}, your e-FRRO ${when}. Please renew it soon. Contact ${BRAND} if you need help.`,
                email: { title: "e-FRRO reminder", text: `Your e-FRRO registration ${when}. Please renew it as soon as possible.` },
                preview: `e-FRRO ${when}`,
            };
        }

        case "maintenance_forward": {
            const d = data;
            const lines = [
                d.recipientName ? `Hello ${d.recipientName},` : "Hello,",
                "",
                `*Maintenance request #${d.id} · ${d.issueType}*`,
                "",
                `• Location: ${[d.pgName, d.roomNumber ? `Room ${d.roomNumber}` : null].filter(Boolean).join(", ") || "-"}`,
                `• Tenant: ${d.tenantName || "-"}${d.tenantPhone ? ` (${d.tenantPhone})` : ""}`,
                `• Preferred date: ${fmtDate(d.serviceDate) || "-"}${d.freeTime ? `, ${d.freeTime}` : ""}`,
                `• Status: ${d.statusLabel || "-"}`,
                `• Details: ${d.description || "No description provided"}`,
            ];
            if (d.imageUrl) lines.push(`• Photo: ${d.imageUrl}`);
            if (d.note) lines.push("", `Note from ${d.senderName || BRAND}: ${d.note}`);
            lines.push("", `Forwarded from the ${BRAND} admin panel.`);

            const location = [d.pgName, d.roomNumber ? `Room ${d.roomNumber}` : null].filter(Boolean).join(", ") || "-";
            const details = [
                `Tenant: ${d.tenantName || "-"}${d.tenantPhone ? ` (${d.tenantPhone})` : ""}`,
                `Date: ${fmtDate(d.serviceDate) || "-"}${d.freeTime ? `, ${d.freeTime}` : ""}`,
                `Issue: ${d.description || "No description"}`,
                d.note ? `Note: ${d.note}` : null,
                d.imageUrl ? `Photo: ${d.imageUrl}` : null,
            ].filter(Boolean).join("\n");

            const smsParts = [
                `${BRAND} maintenance #${d.id}: ${d.issueType}`,
                `At: ${location}`,
                `Tenant: ${d.tenantName || "-"}${d.tenantPhone ? ` ${d.tenantPhone}` : ""}`,
                `Date: ${fmtDate(d.serviceDate) || "-"}${d.freeTime ? ` ${d.freeTime}` : ""}`,
                d.description ? `Issue: ${clip(d.description, 160)}` : null,
                d.note ? `Note: ${clip(d.note, 100)}` : null,
                d.imageUrl ? `Photo: ${d.imageUrl}` : null,
            ].filter(Boolean);

            return {
                whatsapp: {
                    text: lines.join("\n"),
                    template: {
                        envKey: "TWILIO_MAINTENANCE_CONTENT_SID",
                        variables: { 1: tplVar(d.recipientName || "Team"), 2: tplVar(`#${d.id} ${d.issueType}`), 3: tplVar(location), 4: tplVar(details) },
                    },
                },
                sms: smsParts.join("\n"),
                email: { title: `Maintenance request #${d.id} · ${d.issueType}`, text: lines.join("\n").replace(/\*/g, "") },
                preview: `Maintenance #${d.id} (${d.issueType}) forwarded`,
            };
        }

        // Generic title + body message (admin notices, reminders, welcome, payment links…)
        case "custom":
        case "reminder": {
            const title = data.title || "Message";
            const body = data.body || data.message || "";
            return {
                whatsapp: {
                    text: `*${title}*\n\n${body}\n\n— ${BRAND}`,
                    template: { envKey: "TWILIO_CUSTOM_CONTENT_SID", variables: { 1: tplVar(title, 200), 2: tplVar(body) } },
                },
                sms: `${BRAND}: ${title}. ${body}`,
                email: { title, text: body },
                preview: `${title}${body ? ` — ${clip(body, 140)}` : ""}`,
            };
        }

        // Free text (admin replies in the inbox) – no template exists for these by nature.
        case "text":
        default: {
            const body = data.body || "";
            return {
                whatsapp: { text: body, template: null },
                sms: `${BRAND}: ${body}`,
                email: { title: `Message from ${BRAND}`, text: body },
                preview: clip(body, 240),
            };
        }
    }
};

module.exports = { compose, tplVar, inr, fmtDate, clip, firstName, BRAND };
