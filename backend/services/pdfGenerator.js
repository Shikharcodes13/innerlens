const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');

const TEMPLATE_PATH = path.join(__dirname, '../templates/report.html');
// chart.js's package.json "exports" map only allows requiring "." / "./auto" / "./helpers",
// so we can't require.resolve the dist/chart.umd.js subpath directly. Instead resolve the
// package's main entry (which IS allowed) and derive the dist folder from it, then read the
// UMD build with plain fs (fs isn't subject to the exports map, only require/import is).
const CHARTJS_PATH = path.join(path.dirname(require.resolve('chart.js')), 'chart.umd.js');
const REPORTS_DIR = path.join(__dirname, '../reports');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// generateReport({ fullName, scores, tagline }) -> Promise<{ filePath, fileName, uniqueId }>
async function generateReport({ fullName, scores, tagline }) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const uniqueId = uuidv4().slice(0, 8);
  const safeName = fullName.trim().replace(/[^a-zA-Z0-9]+/g, '_');
  const fileName = `BigFive_Report_${safeName}_${uniqueId}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const chartjsSource = fs.readFileSync(CHARTJS_PATH, 'utf-8');

  html = html
    .replace('{{FULL_NAME}}', escapeHtml(fullName))
    .replace('{{REPORT_DATE}}', escapeHtml(reportDate))
    .replace('{{TAGLINE}}', escapeHtml(tagline))
    .replace('{{SCORES_JSON}}', JSON.stringify(scores))
    .replace('<script src="./chart.umd.min.js"></script>', `<script>${chartjsSource}</script>`);

  // Extra flags needed for headless Chromium to run in constrained/containerized hosts
  // like Render's free tier (no sandbox namespaces, limited /dev/shm).
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.waitForFunction('window.__chartReady === true', { timeout: 5000 });
    await page.pdf({ path: filePath, format: 'A4', printBackground: true });
  } finally {
    await browser.close();
  }

  return { filePath, fileName, uniqueId };
}

module.exports = { generateReport };
