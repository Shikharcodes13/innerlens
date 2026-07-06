const twilio = require('twilio');
const dripVideos = require('../data/dripVideos');
const { normalizeDigits } = require('../utils/phone');
const { resolveLang, WHATSAPP_COPY } = require('../utils/i18n');

let client = null;

function getConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
  const backendPublicUrl = process.env.BACKEND_PUBLIC_URL;
  if (!accountSid || !authToken || !whatsappFrom || !backendPublicUrl) return null;

  if (!client) client = twilio(accountSid, authToken);
  return { accountSid, authToken, whatsappFrom, backendPublicUrl };
}

function toWhatsAppAddress(phone) {
  return `whatsapp:+${normalizeDigits(phone)}`;
}

// Sends via an approved Content Template if contentSid is configured for this
// send (required outside a 24h customer-service window in production), else
// falls back to a freeform body+mediaUrl message (works against the Twilio
// Sandbox today).
async function sendMedia({ config, toPhone, mediaUrl, body, contentSid, contentVariables }) {
  const message = {
    from: config.whatsappFrom,
    to: toWhatsAppAddress(toPhone),
  };
  if (contentSid) {
    message.contentSid = contentSid;
    message.contentVariables = JSON.stringify(contentVariables || {});
  } else {
    message.body = body;
    message.mediaUrl = [mediaUrl];
  }
  await client.messages.create(message);
}

// sendReportWhatsApp({ toPhone, fullName, pdfFileName, lang }) -> Promise<{ sent: boolean, reason?: string }>
// Never throws — degrades gracefully when unconfigured or the API errors.
async function sendReportWhatsApp({ toPhone, fullName, pdfFileName, lang }) {
  const config = getConfig();
  if (!config) {
    console.warn('[whatsapp] Twilio not configured — skipping WhatsApp delivery.');
    return { sent: false, reason: 'not_configured' };
  }

  const firstName = fullName.trim().split(' ')[0];
  const mediaUrl = `${config.backendPublicUrl}/reports/${pdfFileName}`;
  const contentSid = process.env.WHATSAPP_REPORT_CONTENT_SID || null;
  const caption = WHATSAPP_COPY[resolveLang(lang)].reportCaption(firstName);

  try {
    await sendMedia({
      config,
      toPhone,
      mediaUrl,
      body: caption,
      contentSid,
      contentVariables: contentSid ? { 1: firstName } : null,
    });
    return { sent: true };
  } catch (err) {
    const apiError = err.message || String(err);
    console.error('[whatsapp] Failed to send report:', apiError);
    return { sent: false, reason: apiError };
  }
}

// sendDripVideo({ toPhone, fullName, day }) -> Promise<{ sent: boolean, reason?: string }>
// Never throws — degrades gracefully when unconfigured, the day is out of range, or the API errors.
async function sendDripVideo({ toPhone, fullName, day }) {
  const config = getConfig();
  if (!config) {
    console.warn('[whatsapp] Twilio not configured — skipping drip video delivery.');
    return { sent: false, reason: 'not_configured' };
  }

  const video = dripVideos.find((v) => v.day === day);
  if (!video) {
    return { sent: false, reason: 'no_video_for_day' };
  }

  const firstName = fullName.trim().split(' ')[0];
  const caption = video.caption.replace(/\{\{firstName\}\}/g, firstName);

  try {
    await sendMedia({
      config,
      toPhone,
      mediaUrl: video.url,
      body: caption,
      contentSid: video.contentSid,
      contentVariables: video.contentVariables,
    });
    return { sent: true };
  } catch (err) {
    const apiError = err.message || String(err);
    console.error(`[whatsapp] Failed to send day ${day} drip video:`, apiError);
    return { sent: false, reason: apiError };
  }
}

module.exports = { sendReportWhatsApp, sendDripVideo };
