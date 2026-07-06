const express = require('express');
const { computeScores, ValidationError } = require('../utils/scoring');
const { getTagline } = require('../utils/taglines');
const { generateReport } = require('../services/pdfGenerator');
const { sendReportEmail } = require('../services/emailService');
const { sendReportWhatsApp, sendDripVideo } = require('../services/whatsappService');
const { addSubmission } = require('../db/store');
const { resolveLang } = require('../utils/i18n');

const router = express.Router();

router.post('/submit', async (req, res) => {
  const { name, email, phone, answers } = req.body;
  const lang = resolveLang(req.body.lang);

  if (!name || !email || !phone || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Missing required fields: name, email, phone, answers.' });
  }

  let scores;
  try {
    scores = computeScores(answers);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }

  const firstName = name.trim().split(' ')[0];
  const tagline = getTagline(firstName, scores, lang);

  // PDF generation is the core deliverable — if it fails, we have nothing to send. Real 500.
  let filePath, fileName, uniqueId;
  try {
    ({ filePath, fileName, uniqueId } = await generateReport({ fullName: name, scores, tagline, lang }));
  } catch (err) {
    console.error('[assessment] PDF generation failed:', err);
    return res.status(500).json({ error: 'Failed to generate report. Please try again.' });
  }

  // Everything below is best-effort: log failures, never fail the response once the PDF exists.
  // Run concurrently — they're independent of each other, and sequential awaits here previously
  // meant one slow/hung delivery channel (e.g. email) added its full latency to every response.
  const [emailOutcome, whatsappOutcome, dripOutcome] = await Promise.allSettled([
    sendReportEmail({ toEmail: email, fullName: name, pdfPath: filePath, pdfFileName: fileName, lang }),
    sendReportWhatsApp({ toPhone: phone, fullName: name, pdfFileName: fileName, lang }),
    sendDripVideo({ toPhone: phone, fullName: name, day: 1 }),
  ]);

  if (emailOutcome.status === 'fulfilled') {
    console.log(`[assessment] Email sent to ${email}`);
  } else {
    console.error('[assessment] Email delivery failed:', emailOutcome.reason.message);
  }

  // whatsappOutcome/dripOutcome always fulfill — sendReportWhatsApp/sendDripVideo never throw.
  const whatsappResult = whatsappOutcome.value;
  const dripDay1Result = dripOutcome.value;

  if (whatsappResult.sent) {
    console.log(`[assessment] WhatsApp report sent to ${phone}`);
  }

  if (dripDay1Result.sent) {
    console.log(`[assessment] WhatsApp day 1 drip video sent to ${phone}`);
  }

  try {
    await addSubmission({
      id: uniqueId,
      name,
      email,
      phone,
      scores,
      reportFileName: fileName,
      lang,
      submittedAt: new Date().toISOString(),
      followUpSent: false,
      dripDaysSent: dripDay1Result.sent ? 1 : 0,
      dripOptOut: false,
    });
  } catch (err) {
    console.error('[assessment] Failed to persist submission:', err.message);
  }

  res.json({ success: true, scores, reportFileName: fileName });
});

module.exports = router;
