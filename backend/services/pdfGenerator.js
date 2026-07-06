const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { resolveLang, TRAIT_LABELS, REPORT_LABELS } = require('../utils/i18n');

const TEMPLATE_PATH = path.join(__dirname, '../templates/report.html');
// chart.js's package.json "exports" map only allows requiring "." / "./auto" / "./helpers",
// so we can't require.resolve the dist/chart.umd.js subpath directly. Instead resolve the
// package's main entry (which IS allowed) and derive the dist folder from it, then read the
// UMD build with plain fs (fs isn't subject to the exports map, only require/import is).
const CHARTJS_PATH = path.join(path.dirname(require.resolve('chart.js')), 'chart.umd.js');
const REPORTS_DIR = path.join(__dirname, '../reports');

// Embedded (not system-installed) Devanagari webfont — relying on the host to have a
// Devanagari-capable font installed proved unreliable across environments (behaved
// differently on local Windows Chrome vs Render's @sparticuz/chromium on Linux, with
// some elements rendering as tofu boxes on the latter). A base64-embedded @font-face
// removes the host font availability from the equation entirely.
const DEVANAGARI_FONT_DIR = path.dirname(
  require.resolve('@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2')
);
const DEVANAGARI_FONT_REGULAR_BASE64 = fs
  .readFileSync(path.join(DEVANAGARI_FONT_DIR, 'noto-sans-devanagari-devanagari-400-normal.woff2'))
  .toString('base64');
const DEVANAGARI_FONT_BOLD_BASE64 = fs
  .readFileSync(path.join(DEVANAGARI_FONT_DIR, 'noto-sans-devanagari-devanagari-700-normal.woff2'))
  .toString('base64');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// On Render (process.env.RENDER is set automatically on all Render services), the full
// Puppeteer-bundled Chrome download (~400-500MB extracted) doesn't reliably fit in the
// free tier's disk space — installs were getting silently truncated mid-extraction.
// @sparticuz/chromium ships a much smaller (~65MB), purpose-built binary directly inside
// its npm package, with no separate download/extraction step. Local dev keeps using the
// regular "puppeteer" package's own bundled Chrome, since @sparticuz/chromium is Linux-only.
async function launchBrowser() {
  if (process.env.RENDER) {
    // @sparticuz/chromium v3+ ships as an ESM package — under CommonJS require(),
    // the actual args/executablePath/headless API sits under .default.
    const chromium = require('@sparticuz/chromium').default;
    const puppeteerCore = require('puppeteer-core');
    return puppeteerCore.launch({
      args: await puppeteerCore.defaultArgs({ args: chromium.args, headless: 'shell' }),
      executablePath: await chromium.executablePath(),
      headless: 'shell',
    });
  }

  const puppeteer = require('puppeteer');
  // Extra flags needed for headless Chromium to run in constrained/containerized hosts.
  return puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
}

// generateReport({ fullName, scores, tagline, lang }) -> Promise<{ filePath, fileName, uniqueId }>
async function generateReport({ fullName, scores, tagline, lang }) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const resolvedLang = resolveLang(lang);
  const labels = REPORT_LABELS[resolvedLang];
  const traitLabels = TRAIT_LABELS[resolvedLang];

  const uniqueId = uuidv4().slice(0, 8);
  const safeName = fullName.trim().replace(/[^a-zA-Z0-9]+/g, '_');
  const fileName = `InnerLens_Report_${safeName}_${uniqueId}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);

  const reportDate = new Date().toLocaleDateString(labels.dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const chartjsSource = fs.readFileSync(CHARTJS_PATH, 'utf-8');

  html = html
    .replace('{{HTML_LANG}}', labels.htmlLang)
    .replace('{{BODY_LANG_CLASS}}', `lang-${labels.htmlLang}`)
    .replace('{{DEVANAGARI_FONT_REGULAR_BASE64}}', DEVANAGARI_FONT_REGULAR_BASE64)
    .replace('{{DEVANAGARI_FONT_BOLD_BASE64}}', DEVANAGARI_FONT_BOLD_BASE64)
    .replace('{{EYEBROW}}', escapeHtml(labels.eyebrow))
    .replace('{{TITLE_HTML}}', labels.titleHtml)
    .replace('{{BRAND}}', escapeHtml(labels.brand))
    .replace('{{PREPARED_FOR}}', escapeHtml(labels.preparedFor))
    .replace('{{TRAIT_PROFILE}}', escapeHtml(labels.traitProfile))
    .replace('{{SCORE_LABEL}}', escapeHtml(labels.scoreLabel))
    .replace('{{TRAIT_LABELS_JSON}}', JSON.stringify(traitLabels))
    .replace('{{FULL_NAME}}', escapeHtml(fullName))
    .replace('{{REPORT_DATE}}', escapeHtml(reportDate))
    .replace('{{TAGLINE}}', escapeHtml(tagline))
    .replace('{{SCORES_JSON}}', JSON.stringify(scores))
    .replace('<script src="./chart.umd.min.js"></script>', `<script>${chartjsSource}</script>`);

  const browser = await launchBrowser();
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
