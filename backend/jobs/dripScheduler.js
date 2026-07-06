// Runs in-process inside the Express server via node-cron, same as followupScheduler.js
// This only fires while the Node process stays running continuously — acceptable for
// this free/local-hosting scope, but there's no separate queue/cron infra behind it.
const cron = require('node-cron');
const { getPendingDripSends, incrementDripDaysSent } = require('../db/store');
const { sendDripVideo } = require('../services/whatsappService');

function startDripScheduler() {
  cron.schedule('0 * * * *', async () => {
    console.log('[drip] Checking for submissions due for their next drip video...');
    const now = new Date();
    const pending = await getPendingDripSends(now);

    for (const submission of pending) {
      const nextDay = (submission.dripDaysSent || 0) + 1;
      try {
        const result = await sendDripVideo({ toPhone: submission.phone, fullName: submission.name, day: nextDay });
        if (result.sent) {
          await incrementDripDaysSent(submission.id);
          console.log(`[drip] Sent day ${nextDay} video to ${submission.phone}`);
        } else {
          console.error(`[drip] Day ${nextDay} video not sent to ${submission.phone}: ${result.reason}`);
        }
      } catch (err) {
        // Leave dripDaysSent unchanged on failure so it retries on the next hourly tick.
        console.error(`[drip] Failed to send day ${nextDay} video to ${submission.phone}:`, err.message);
      }
    }
  });

  console.log('[drip] Scheduler started (hourly checks for due drip videos).');
}

module.exports = { startDripScheduler };
