const path = require('path');

// lowdb v7 ships as ESM-only, while the rest of this backend is CommonJS.
// Dynamic import() works fine from CJS and returns a promise, so we lazily
// import it inside the (already async) getDb() rather than converting the
// whole backend to ESM just for one small dependency.

const DB_PATH = path.join(__dirname, 'db.json');
const defaultData = { submissions: [] };

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

module.exports = { getDb, addSubmission, getPendingFollowUps, markFollowUpSent };
