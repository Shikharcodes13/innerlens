# InnerLens — Personality Assessment

A free, self-hosted clone of the Big Five personality assessment funnel — 30-question
quiz, automatic scoring, a generated PDF report, and delivery over email + WhatsApp.
Built entirely with free/open-source tooling, no paid APIs required to run it locally.

## Stack

- **Frontend**: React + Vite (`frontend/`)
- **Backend**: Node.js + Express (`backend/`)
- **PDF generation**: Puppeteer + Chart.js (rendered from an HTML template, no paid PDF service)
- **Email**: Nodemailer (any SMTP — e.g. Gmail with an App Password)
- **WhatsApp**: Meta WhatsApp Cloud API free test mode (up to 5 whitelisted numbers, no cost)
- **Storage**: lowdb (a JSON file, no database server)
- **Follow-up drip**: node-cron running in-process

## Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in SMTP / WhatsApp creds (optional, see below)
npm run dev            # http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

The app works end-to-end (quiz, scoring, PDF generation) even with an empty `.env` —
email and WhatsApp delivery just get skipped and logged instead of sent.

## Enabling email delivery

1. Turn on 2-Step Verification on the sending Gmail account.
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Set `SMTP_USER` (the Gmail address) and `SMTP_PASS` (the app password) in `backend/.env`.

## Enabling WhatsApp delivery (free test mode)

1. Create an app at https://developers.facebook.com → add the WhatsApp product.
2. Under WhatsApp → API Setup you get a temporary access token and a test phone number ID.
3. Add up to 5 recipient numbers under "To" and verify them via the OTP Meta sends — this
   is free and requires no business verification.
4. Set `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` in `backend/.env`.
5. Submissions from a whitelisted phone number will now receive the PDF over WhatsApp.

Note: the temporary access token expires after ~24 hours during test mode — you'll need
to regenerate it from the same dashboard page periodically during development.

## How scoring works

Each of the 30 statements maps to one of the five traits (6 statements each) and is
either direct-scored or reverse-scored. For reverse items, `adjusted = 6 - rawValue`;
otherwise `adjusted = rawValue`. Each trait's score is the mean of its 6 adjusted values
(1-5), normalized to 0-100 via `((mean - 1) / 4) * 100`. Answering "Neutral" (3) on every
question yields exactly 50 on every trait — a useful sanity check.

## Known limitations (accepted tradeoffs of the free-tooling constraint)

- The next-day follow-up email only fires while the Node backend process stays running
  continuously (in-process `node-cron`, no external queue/scheduler).
- WhatsApp delivery in test mode only works for the up to 5 phone numbers you've
  whitelisted in the Meta dashboard — not arbitrary users — until the app goes through
  Meta business verification.
- Report taglines are rule-based templates keyed on trait scores, not LLM-generated.
