const express = require('express');
const { computeScores, ValidationError } = require('../utils/scoring');
const { getTagline } = require('../utils/taglines');
const { generateReport } = require('../services/pdfGenerator');
const { sendReportEmail } = require('../services/emailService');
const { sendReportWhatsApp } = require('../services/whatsappService');
const { addSubmission } = require('../db/store');

const router = express.Router();

router.post('/submit', async (req, res) => {
  const { name, email, phone, answers } = req.body;

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
  const tagline = getTagline(firstName, scores);

  // PDF generation is the core deliverable — if it fails, we have nothing to send. Real 500.
  let filePath, fileName, uniqueId;
  try {
    ({ filePath, fileName, uniqueId } = await generateReport({ fullName: name, scores, tagline }));
  } catch (err) {
    console.error('[assessment] PDF generation failed:', err);
    return res.status(500).json({ error: 'Failed to generate report. Please try again.' });
  }

  // Everything below is best-effort: log failures, never fail the response once the PDF exists.
  try {
    await sendReportEmail({ toEmail: email, fullName: name, pdfPath: filePath, pdfFileName: fileName });
    console.log(`[assessment] Email sent to ${email}`);
  } catch (err) {
    console.error('[assessment] Email delivery failed:', err.message);
  }

  const whatsappResult = await sendReportWhatsApp({ toPhone: phone.replace(/\D/g, ''), fullName: name, pdfPath: filePath });
  if (whatsappResult.sent) {
    console.log(`[assessment] WhatsApp sent to ${phone}`);
  }

  try {
    await addSubmission({
      id: uniqueId,
      name,
      email,
      phone,
      scores,
      reportFileName: fileName,
      submittedAt: new Date().toISOString(),
      followUpSent: false,
    });
  } catch (err) {
    console.error('[assessment] Failed to persist submission:', err.message);
  }

  res.json({ success: true, scores, reportFileName: fileName });
});

module.exports = router;
