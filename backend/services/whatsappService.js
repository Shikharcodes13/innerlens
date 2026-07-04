const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const GRAPH_BASE = 'https://graph.facebook.com/v19.0';

function getConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return null;
  return { token, phoneNumberId };
}

// Step 1: upload the PDF to Meta, get back a media id
async function uploadMedia(pdfPath, config) {
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('file', fs.createReadStream(pdfPath), { contentType: 'application/pdf' });

  const res = await axios.post(`${GRAPH_BASE}/${config.phoneNumberId}/media`, form, {
    headers: { ...form.getHeaders(), Authorization: `Bearer ${config.token}` },
  });
  return res.data.id;
}

// Step 2: send a document message referencing the uploaded media id
async function sendDocumentMessage(toPhone, mediaId, fullName, config) {
  const firstName = fullName.trim().split(' ')[0];
  await axios.post(
    `${GRAPH_BASE}/${config.phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: toPhone,
      type: 'document',
      document: {
        id: mediaId,
        filename: `BigFive_Report_${firstName}.pdf`,
        caption:
          `Hi ${firstName}, here's your Big Five Personality Report! ` +
          `Reply STOP to unsubscribe.`,
      },
    },
    { headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' } }
  );
}

// sendReportWhatsApp({ toPhone, fullName, pdfPath }) -> Promise<{ sent: boolean, reason?: string }>
// Never throws — degrades gracefully when unconfigured, unwhitelisted, or the API errors.
async function sendReportWhatsApp({ toPhone, fullName, pdfPath }) {
  const config = getConfig();
  if (!config) {
    console.warn('[whatsapp] WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set — skipping WhatsApp delivery.');
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const mediaId = await uploadMedia(pdfPath, config);
    await sendDocumentMessage(toPhone, mediaId, fullName, config);
    return { sent: true };
  } catch (err) {
    const apiError = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
    console.error('[whatsapp] Failed to send report:', apiError);
    return { sent: false, reason: apiError };
  }
}

module.exports = { sendReportWhatsApp };
