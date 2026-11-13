// =====================================================================
// PRE-RENDER — runs after `vite build`.
//
// Opens every page of the built shop in headless Chrome (with the live
// catalogue), and saves what it renders as a real HTML file:
//   dist/index.html, dist/mia-torte/index.html, dist/mia-torte/shop/index.html …
// so search engines and link previews (WhatsApp, Instagram…) get each page's
// full content, title, description and structured data, with a 200 status.
// The app still starts normally in the browser and shows live stock/prices.
//
// It finds pages by following links from the home page, so new products and
// collections are picked up automatically. It also writes sitemap.xml (the
// canonical, indexable pages) and robots.txt.
//
// Needs Chrome: set CHROME_PATH, or it looks in the usual places. With no
// Chrome (or PRERENDER=0) it skips, leaving the plain single-page build.
// =====================================================================
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';

const DIST = 'dist';
const BASE = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://aryamanvepa.github.io/frontend_mia_torte').replace(/\/$/, '');
// Pages that are never indexed, so not worth pre-rendering.
const SKIP = [/^\/checkout/, /^\/order\//, /^\/track/];
const MAX_PAGES = 400;

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

if (process.env.PRERENDER === '0') { console.log('prerender: skipped (PRERENDER=0)'); process.exit(0); }
const chromePath = findChrome();
if (!chromePath) { console.warn('prerender: no Chrome found (set CHROME_PATH); skipping'); process.exit(0); }

const shell = readFileSync(join(DIST, 'index.html'), 'utf8'); // the plain app; 404.html is a copy of it

// ---------------------------------------------------------------- tiny static server for dist/
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.txt': 'text/plain', '.xml': 'application/xml' };
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = url.startsWith(BASE) ? url.slice(BASE.length) : null;
  const file = rel !== null ? normalize(join(DIST, rel)) : null;
  if (file && file.startsWith(DIST) && existsSync(file) && statSync(file).isFile()) {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html' }); // every app address gets the plain app
  res.end(shell);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

// ---------------------------------------------------------------- crawl
const { default: puppeteer } = await import('puppeteer-core');
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const toPath = (href) => {
  try {
    const u = new URL(href, ORIGIN);
    if (u.origin !== ORIGIN || !u.pathname.startsWith(BASE)) return null;
    const p = `/${u.pathname.slice(BASE.length)}`.replace(/\/+$/, '') || '/';
    return SKIP.some((r) => r.test(p)) || extname(p) ? null : p;
  } catch { return null; }
};

const queue = ['/'];
const seen = new Set(queue);
const pages = [];
let failed = 0;

while (queue.length && pages.length < MAX_PAGES) {
  const path = queue.shift();
  try {
    await page.goto(`${ORIGIN}${BASE}${path === '/' ? '' : path.slice(1)}`, { waitUntil: 'networkidle0', timeout: 30000 });
    // Wait for the catalogue (no loading skeletons) and the page's own tags.
    await page.waitForFunction(() => !document.querySelector('.sk') && document.title.length > 0, { timeout: 15000 });
    const data = await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in'));
      document.documentElement.removeAttribute('style'); // runtime-only (--header-total)
      const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
      return {
        html: `<!doctype html>\n${document.documentElement.outerHTML}`,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
        noindex: robots.includes('noindex'),
        links: [...document.querySelectorAll('a[href]')].map((a) => a.href),
        finalPath: location.pathname,
      };
    });
    const final = toPath(`${ORIGIN}${data.finalPath}`);
    if (final !== path) { console.log(`prerender: ${path} redirects to ${final}; skipped`); }
    else pages.push({ path, ...data });
    for (const l of data.links) {
      const p = toPath(l);
      if (p && !seen.has(p)) { seen.add(p); queue.push(p); }
    }
  } catch (e) {
    failed++;
    console.warn(`prerender: ${path} failed (${e.message.split('\n')[0]})`);
  }
}
await browser.close();
server.close();

if (!pages.length) { console.warn('prerender: nothing rendered; leaving the plain build'); process.exit(0); }

// ---------------------------------------------------------------- write pages
let written = 0;
for (const p of pages) {
  if (p.noindex) continue; // 404s and private pages fall back to the plain app
  const out = p.path === '/' ? join(DIST, 'index.html') : join(DIST, p.path.slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, p.html);
  written++;
}

// ---------------------------------------------------------------- sitemap & robots
const today = new Date().toISOString().slice(0, 10);
const urls = [...new Set(pages.filter((p) => !p.noindex && p.canonical).map((p) => p.canonical))].sort();
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.replace(/&/g, '&amp;')}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(DIST, 'robots.txt'), `# Torte Living shop
User-agent: *
Allow: /
Disallow: ${BASE}checkout
Disallow: ${BASE}order/

Sitemap: ${SITE_URL}/sitemap.xml
`);

console.log(`prerender: ${written} pages written, ${urls.length} in sitemap.xml${failed ? `, ${failed} failed` : ''}`);
