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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`InnerLens backend listening on http://localhost:${PORT}`);
  startFollowUpScheduler();
  startDripScheduler();
});
