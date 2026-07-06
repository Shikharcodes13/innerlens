const fs = require('fs');
const { resolveLang, EMAIL_COPY } = require('../utils/i18n');

// HTTP-based email API (not raw SMTP) — Render's free tier silently blocks outbound
// SMTP ports (confirmed: connecting to smtp.gmail.com:587 fails with ETIMEDOUT in
// ~250ms, the signature of a firewall-level block, not a real network timeout).
// An HTTPS API call on port 443 doesn't hit that restriction.
const RESEND_API_URL = 'https://api.resend.com/emails';

function isConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || 'InnerLens <onboarding@resend.dev>';
}

async function sendViaResend({ to, subject, text, attachments }) {
  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [to],
      subject,
      text,
      attachments,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

// sendReportEmail({ toEmail, fullName, pdfPath, pdfFileName, lang }) -> Promise<void>
// Caller treats this as best-effort and wraps it in try/catch.
async function sendReportEmail({ toEmail, fullName, pdfPath, pdfFileName, lang }) {
  if (!isConfigured()) {
    throw new Error('RESEND_API_KEY not configured — skipping email delivery.');
  }

  const firstName = fullName.trim().split(' ')[0];
  const publicUrl = process.env.APP_PUBLIC_URL || 'http://localhost:5173';
  const copy = EMAIL_COPY[resolveLang(lang)];
  const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');

  await sendViaResend({
    to: toEmail,
    subject: copy.reportSubject(firstName),
    text: copy.reportBody(firstName, publicUrl),
    attachments: [{ filename: pdfFileName, content: pdfBase64 }],
  });
}

// sendFollowUpEmail({ toEmail, fullName, lang }) -> Promise<void>
async function sendFollowUpEmail({ toEmail, fullName, lang }) {
  if (!isConfigured()) {
    throw new Error('RESEND_API_KEY not configured — skipping follow-up email.');
  }

  const firstName = fullName.trim().split(' ')[0];
  const copy = EMAIL_COPY[resolveLang(lang)];

  await sendViaResend({
    to: toEmail,
    subject: copy.followUpSubject(firstName),
    text: copy.followUpBody(firstName),
  });
}

module.exports = { sendReportEmail, sendFollowUpEmail, isConfigured };
