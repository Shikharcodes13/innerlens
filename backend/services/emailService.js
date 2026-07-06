const nodemailer = require('nodemailer');
const { resolveLang, EMAIL_COPY } = require('../utils/i18n');

function buildTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function isConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

// sendReportEmail({ toEmail, fullName, pdfPath, pdfFileName, lang }) -> Promise<void>
// Caller treats this as best-effort and wraps it in try/catch.
async function sendReportEmail({ toEmail, fullName, pdfPath, pdfFileName, lang }) {
  if (!isConfigured()) {
    throw new Error('SMTP_USER/SMTP_PASS not configured — skipping email delivery.');
  }

  const transporter = buildTransporter();
  const firstName = fullName.trim().split(' ')[0];
  const publicUrl = process.env.APP_PUBLIC_URL || 'http://localhost:5173';
  const copy = EMAIL_COPY[resolveLang(lang)];

  await transporter.sendMail({
    from: `"InnerLens" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: copy.reportSubject(firstName),
    text: copy.reportBody(firstName, publicUrl),
    attachments: [{ filename: pdfFileName, path: pdfPath }],
  });
}

// sendFollowUpEmail({ toEmail, fullName, lang }) -> Promise<void>
async function sendFollowUpEmail({ toEmail, fullName, lang }) {
  if (!isConfigured()) {
    throw new Error('SMTP_USER/SMTP_PASS not configured — skipping follow-up email.');
  }

  const transporter = buildTransporter();
  const firstName = fullName.trim().split(' ')[0];
  const copy = EMAIL_COPY[resolveLang(lang)];

  await transporter.sendMail({
    from: `"InnerLens" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: copy.followUpSubject(firstName),
    text: copy.followUpBody(firstName),
  });
}

module.exports = { sendReportEmail, sendFollowUpEmail, isConfigured };
