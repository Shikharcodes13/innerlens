const nodemailer = require('nodemailer');

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

// sendReportEmail({ toEmail, fullName, pdfPath, pdfFileName }) -> Promise<void>
// Caller treats this as best-effort and wraps it in try/catch.
async function sendReportEmail({ toEmail, fullName, pdfPath, pdfFileName }) {
  if (!isConfigured()) {
    throw new Error('SMTP_USER/SMTP_PASS not configured — skipping email delivery.');
  }

  const transporter = buildTransporter();
  const firstName = fullName.trim().split(' ')[0];
  const publicUrl = process.env.APP_PUBLIC_URL || 'http://localhost:5173';

  await transporter.sendMail({
    from: `"InnerLens" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `${firstName}, your InnerLens report is here`,
    text:
      `Hi ${firstName},\n\n` +
      `Your personalized InnerLens report is attached as a PDF.\n\n` +
      `Enjoyed it? Share it with a friend and have them take the free assessment too: ${publicUrl}\n\n` +
      `— The InnerLens Team`,
    attachments: [{ filename: pdfFileName, path: pdfPath }],
  });
}

// sendFollowUpEmail({ toEmail, fullName }) -> Promise<void>
async function sendFollowUpEmail({ toEmail, fullName }) {
  if (!isConfigured()) {
    throw new Error('SMTP_USER/SMTP_PASS not configured — skipping follow-up email.');
  }

  const transporter = buildTransporter();
  const firstName = fullName.trim().split(' ')[0];

  await transporter.sendMail({
    from: `"InnerLens" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `${firstName}, one thing most people miss in their report`,
    text:
      `Hi ${firstName},\n\n` +
      `Hope you had a chance to look over your InnerLens report. Most people skim the radar chart ` +
      `and skip the part that matters most — how your lowest-scoring trait shapes your blind spots ` +
      `just as much as your highest one shapes your strengths.\n\n` +
      `Worth a second look when you get a moment.\n\n` +
      `— The InnerLens Team`,
  });
}

module.exports = { sendReportEmail, sendFollowUpEmail, isConfigured };
