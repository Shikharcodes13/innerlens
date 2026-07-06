const path = require('path');
const { normalizeDigits } = require('../utils/phone');

// lowdb v7 ships as ESM-only, while the rest of this backend is CommonJS.
// Dynamic import() works fine from CJS and returns a promise, so we lazily
// import it inside the (already async) getDb() rather than converting the
// whole backend to ESM just for one small dependency.

const DB_PATH = path.join(__dirname, 'db.json');
const defaultData = { submissions: [] };
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const DRIP_TOTAL_DAYS = 21;

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { JSONFilePreset } = await import('lowdb/node');
      return JSONFilePreset(DB_PATH, defaultData);
    })();
  }
  return dbPromise;
}

// addSubmission(submission) -> Promise<void>
async function addSubmission(submission) {
  const db = await getDb();
  db.data.submissions.push(submission);
  await db.write();
}

// getPendingFollowUps(cutoffDate) -> Promise<submission[]>
// Submissions submitted at/before cutoffDate that haven't had their follow-up sent yet.
async function getPendingFollowUps(cutoffDate) {
  const db = await getDb();
  return db.data.submissions.filter(
    (s) => !s.followUpSent && new Date(s.submittedAt) <= cutoffDate
  );
}

// markFollowUpSent(id) -> Promise<void>
async function markFollowUpSent(id) {
  const db = await getDb();
  const submission = db.data.submissions.find((s) => s.id === id);
  if (submission) {
    submission.followUpSent = true;
    await db.write();
  }
}

// getPendingDripSends(now) -> Promise<submission[]>
// Submissions not opted out, with days remaining in the 21-day drip, whose next
// day is due. Day 1 is sent synchronously at registration (t=0), so day N (N>=2)
// is due (N-1)*24h after submittedAt — i.e. dripDaysSent*24h after submittedAt,
// since dripDaysSent already counts however many days have been sent so far.
async function getPendingDripSends(now) {
  const db = await getDb();
  const nowMs = now.getTime();
  return db.data.submissions.filter((s) => {
    if (s.dripOptOut) return false;
    const daysSent = s.dripDaysSent || 0;
    if (daysSent >= DRIP_TOTAL_DAYS) return false;
    const nextDueMs = new Date(s.submittedAt).getTime() + daysSent * TWENTY_FOUR_HOURS_MS;
    return nextDueMs <= nowMs;
  });
}

// incrementDripDaysSent(id) -> Promise<void>
async function incrementDripDaysSent(id) {
  const db = await getDb();
  const submission = db.data.submissions.find((s) => s.id === id);
  if (submission) {
    submission.dripDaysSent = (submission.dripDaysSent || 0) + 1;
    await db.write();
  }
}

// markDripOptOutByPhone(phone) -> Promise<void>
// Sets dripOptOut on all submissions matching phone (compared by digits only).
async function markDripOptOutByPhone(phone) {
  const db = await getDb();
  const target = normalizeDigits(phone);
  let changed = false;
  for (const s of db.data.submissions) {
    if (normalizeDigits(s.phone) === target) {
      s.dripOptOut = true;
      changed = true;
    }
  }
  if (changed) await db.write();
}

module.exports = {
  getDb,
  addSubmission,
  getPendingFollowUps,
  markFollowUpSent,
  getPendingDripSends,
  incrementDripDaysSent,
  markDripOptOutByPhone,
};
