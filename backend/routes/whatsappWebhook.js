const express = require('express');
const { markDripOptOutByPhone } = require('../db/store');

const router = express.Router();
const STOP_KEYWORDS = new Set(['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']);

// POST /api/whatsapp/inbound — Twilio's inbound WhatsApp message webhook
// (form-urlencoded body with From/Body). Always responds 200 with empty TwiML
// regardless of whether a number matched, so Twilio doesn't retry/flag the
// webhook and we don't leak whether a number is in the system.
router.post('/inbound', async (req, res) => {
  const from = req.body.From;
  const body = (req.body.Body || '').trim().toUpperCase();

  if (from && STOP_KEYWORDS.has(body)) {
    try {
      await markDripOptOutByPhone(from);
      console.log(`[whatsapp] Opt-out recorded for ${from}`);
    } catch (err) {
      console.error('[whatsapp] Failed to record opt-out:', err.message);
    }
  }

  res.type('text/xml').send('<Response></Response>');
});

module.exports = router;
