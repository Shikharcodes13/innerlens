// Runs in-process inside the Express server via node-cron. This only fires while the
// Node process stays running continuously — acceptable for this free/local-hosting
// scope, but there's no separate queue/cron infra behind it.
const cron = require('node-cron');
const { getPendingFollowUps, markFollowUpSent } = require('../db/store');
const { sendFollowUpEmail } = require('../services/emailService');

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function startFollowUpScheduler() {
  cron.schedule('0 * * * *', async () => {
    console.log('[followup] Checking for submissions due for follow-up...');
    const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);
    const pending = await getPendingFollowUps(cutoff);

    for (const submission of pending) {
      try {
        await sendFollowUpEmail({ toEmail: submission.email, fullName: submission.name });
        await markFollowUpSent(submission.id);
        console.log(`[followup] Sent follow-up to ${submission.email}`);
      } catch (err) {
        // Leave followUpSent as false on failure so it retries on the next hourly tick.
        console.error(`[followup] Failed to send follow-up to ${submission.email}:`, err.message);
      }
    }
  });

  console.log('[followup] Scheduler started (hourly checks for 24h-old submissions).');
}

module.exports = { startFollowUpScheduler };
