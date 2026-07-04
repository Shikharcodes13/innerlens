const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const questionsRouter = require('./routes/questions');
const assessmentRouter = require('./routes/assessment');
const { startFollowUpScheduler } = require('./jobs/followupScheduler');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/questions', questionsRouter);
app.use('/api/assessment', assessmentRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'big5-assessment-api' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Big Five backend listening on http://localhost:${PORT}`);
  startFollowUpScheduler();
});
