const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const questionsRouter = require('./routes/questions');
const assessmentRouter = require('./routes/assessment');
const whatsappWebhookRouter = require('./routes/whatsappWebhook');
const { startFollowUpScheduler } = require('./jobs/followupScheduler');
const { startDripScheduler } = require('./jobs/dripScheduler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Twilio webhooks POST form-urlencoded

app.use('/reports', express.static(path.join(__dirname, 'reports'))); // public PDF fetch for Twilio mediaUrl

app.use('/api/questions', questionsRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/whatsapp', whatsappWebhookRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'innerlens-api' }));

// TEMPORARY diagnostic route — checks raw TCP connectivity to Gmail's SMTP port from
// this host, since Render's free tier has no shell access to test this directly.
// Remove once the email connection-timeout issue is diagnosed.
app.get('/api/debug/smtp-check', (req, res) => {
  const net = require('net');
  const start = Date.now();
  const socket = net.createConnection(587, 'smtp.gmail.com');
  socket.setTimeout(10000);
  socket.on('connect', () => {
    socket.end();
    res.json({ result: 'CONNECTED', ms: Date.now() - start });
  });
  socket.on('timeout', () => {
    socket.destroy();
    res.json({ result: 'TIMEOUT', ms: Date.now() - start });
  });
  socket.on('error', (err) => {
    res.json({ result: 'ERROR', message: err.message, ms: Date.now() - start });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`InnerLens backend listening on http://localhost:${PORT}`);
  startFollowUpScheduler();
  startDripScheduler();
});
