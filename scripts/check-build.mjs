// =====================================================================
// LAUNCH CHECKS — run after `npm run build`:  npm run check
//
// Reads every pre-rendered page in dist/ and fails (exit 1) on anything
// that would hurt search, sharing or trust:
//   - missing <title>, description, canonical or Open Graph tags
//   - structured data (JSON-LD) that does not parse, or that carries
//     made-up label data (ingredients, allergens, nutrition) or test tags
//   - canonical / sitemap / robots addresses not on SITE_URL
//   - barcodes (200…), the Supabase service_role key, or test-order details
//   - a missing or fake FSSAI registration number (it must be in every footer)
//   - stand-in business details (FSSAI 000…, example email/phone), and links
//     to policy / contact pages that are switched off (src/content/site.ts)
// With VITE_HIDE_TEST_DATA=1 it also fails if any "Test data" tag,
// "details coming soon" or stock product photo (test-…) is still on a page.
// =====================================================================
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SITE_URL = (process.env.VITE_SITE_URL || 'https://lamiatorte.com').replace(/\/$/, '');
const HIDE = process.env.VITE_HIDE_TEST_DATA === '1';

const errors = [];
const warn = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === 'assets' || f === 'images' || f === 'brand' ? [] : htmlFiles(p);
    return f === 'index.html' ? [p] : [];
  });
}

if (!existsSync(DIST)) { console.error('check: no dist/ folder. Run npm run build first.'); process.exit(1); }
const pages = htmlFiles(DIST);
const meta = (html, attr, name) => new RegExp(`<meta[^>]+${attr}="${name}"[^>]+content="([^"]*)"`, 'i').exec(html)?.[1];

// Pages that can be switched off (policies until the text is in; contact until there is an email or phone).
// When one isn't built, nothing may link to it and the sitemap must not list it.
const HIDDEN_ROUTES = ['shipping', 'refunds', 'privacy', 'terms', 'contact'].filter((r) => !existsSync(join(DIST, r, 'index.html')));

let prerendered = 0;
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const page = file.slice(DIST.length) || '/';
  const isShell = !/<div id="root">\s*<[a-z]/i.test(html);
  if (isShell) {
    // Private app pages (account, track, search, checkout) are the plain app with noindex; anything else is a miss.
    if (page !== '/index.html' && !/<meta name="robots" content="noindex"/.test(html)) warn.push(`${page}: not pre-rendered (plain app shell)`);
    continue;
  }
  prerendered++;

  const title = /<title>([^<]*)<\/title>/i.exec(html)?.[1]?.trim();
  if (!title) fail(page, 'no <title>');
  else if (title.length > 70) warn.push(`${page}: title is ${title.length} characters (search results cut at ~60)`);
  const desc = meta(html, 'name', 'description');
  if (!desc) fail(page, 'no meta description');
  const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i.exec(html)?.[1];
  if (!canonical) fail(page, 'no canonical link');
  else if (!canonical.startsWith(SITE_URL)) fail(page, `canonical ${canonical} is not on ${SITE_URL}`);
  for (const p of ['og:title', 'og:description', 'og:url', 'og:image']) if (!meta(html, 'property', p)) fail(page, `no ${p}`);

  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data;
    try { data = JSON.parse(m[1]); } catch { fail(page, 'JSON-LD does not parse'); continue; }
    const text = JSON.stringify(data);
    if (/nutrition|allergen|ingredients|suitableForDiet/i.test(text)) fail(page, 'JSON-LD carries label data (nutrition / allergens / ingredients)');
    if (/Test data|Placeholder|Draft · confirm/i.test(text)) fail(page, 'JSON-LD carries a placeholder or test tag');
    for (const o of [data].flat().flatMap((d) => d.offers ?? [])) {
      if (!o.price || Number(o.price) <= 0) fail(page, `offer ${o.sku} has no price`);
      if (!/schema\.org\/(InStock|OutOfStock|LimitedAvailability|Discontinued)$/.test(o.availability ?? '')) fail(page, `offer ${o.sku} availability ${o.availability}`);
    }
  }

  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  if (/\b200\d{10}\b/.test(visible)) fail(page, 'looks like a barcode (200…) on the page');
  if (/service_role/i.test(html)) fail(page, 'mentions service_role');
  if (/test\+\d+@example\.com/.test(html)) fail(page, 'test-order details on the page');
  // Business details are hidden until real (src/content/site.ts): no stand-in values may reach a page.
  const words = visible.replace(/<[^>]+>/g, ' ');
  if (/0{14}|example\.com|00000 00000|to be supplied|GSTIN to be added|Lic\. No\. 0/i.test(words)) fail(page, 'business placeholder (fake FSSAI 000…, example.com email, 00000 phone, "to be supplied") on the page');
  // FSSAI: the registration number must be on every page (footer), and must be the real 14-digit one.
  const fssai = /FSSAI Reg\. No\. (\d+)/.exec(words)?.[1];
  if (!fssai) fail(page, 'no FSSAI registration number in the footer');
  else if (!/^[1-9]\d{13}$/.test(fssai)) fail(page, `FSSAI number ${fssai} is not a real 14-digit number`);
  for (const route of HIDDEN_ROUTES) if (new RegExp(`href="[^"]*/${route}/?"`).test(html)) fail(page, `links to /${route}, which is switched off`);
  if (HIDE) {
    if (/details coming soon|to be added|Content needed/i.test(words)) fail(page, '"coming soon" / "to be added" in place of label details');
    if (/ph-tag--test|>Test data</.test(html)) fail(page, '"Test data" tag shown with VITE_HIDE_TEST_DATA=1');
    // No internal marker of any kind on the live site: placeholder / draft / content-needed tags,
    // their highlight class, or the wording behind them.
    if (/class="[^"]*\b(ph-tag|is-ph)\b/.test(html)) fail(page, 'internal placeholder tag or highlight (ph-tag / is-ph) on the page');
    if (/Draft · confirm|Draft page\.|Photo needed|Placeholder|to be confirmed|Lifestyle photograph to come|photographs? (?:to|of this product will) follow|will follow|for testing only|brand brief/i.test(words)) fail(page, 'internal wording ("Draft · confirm", "to be confirmed", "Placeholder" …) on the page');
    if (/\/images\/test-[a-z0-9-]+-\d+\.webp/.test(html)) fail(page, 'stock product photo (test-…) shown with VITE_HIDE_TEST_DATA=1');
  }
}

// ---------------------------------------------------------------- trackers
// The privacy policy says the site uses no analytics or advertising trackers. Fail if a GA4
// measurement ID or a Meta Pixel ID was built in (VITE_GA4_ID / VITE_META_PIXEL_ID), so the policy
// is updated before one is turned on.
for (const f of readdirSync(join(DIST, 'assets')).filter((f) => f.endsWith('.js'))) {
  const js = readFileSync(join(DIST, 'assets', f), 'utf8');
  if (/["'`]G-[A-Z0-9]{6,}["'`]/.test(js) || /fbq\(\s*["']init["']\s*,\s*["']\d{6,}/.test(js) || (process.env.VITE_META_PIXEL_ID && js.includes(process.env.VITE_META_PIXEL_ID)))
    errors.push(`assets/${f}: an analytics or advertising ID is built in, but the privacy policy says there are no trackers`);
}

// ---------------------------------------------------------------- sitemap & robots
const sitemapPath = join(DIST, 'sitemap.xml');
if (!existsSync(sitemapPath)) errors.push('sitemap.xml missing');
else {
  const locs = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!locs.length) errors.push('sitemap.xml has no addresses');
  for (const l of locs) if (!l.startsWith(SITE_URL)) errors.push(`sitemap.xml: ${l} is not on ${SITE_URL}`);
  for (const l of locs) if (/\/(checkout|order|track)(\/|$)/.test(l)) errors.push(`sitemap.xml lists a private page: ${l}`);
  for (const l of locs) for (const r of HIDDEN_ROUTES) if (l.replace(/\/$/, '').endsWith(`/${r}`)) errors.push(`sitemap.xml lists /${r}, which is switched off`);
  console.log(`check: sitemap.xml lists ${locs.length} pages`);
}
const robotsPath = join(DIST, 'robots.txt');
if (!existsSync(robotsPath)) errors.push('robots.txt missing');
else if (!readFileSync(robotsPath, 'utf8').includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) errors.push('robots.txt does not point at the sitemap');
if (!existsSync(join(DIST, '404.html'))) errors.push('404.html missing (deep links would break on GitHub Pages)');

console.log(`check: ${prerendered} pre-rendered pages checked against ${SITE_URL}${HIDE ? ' (test data hidden)' : ''}`);
if (HIDDEN_ROUTES.length) console.log(`check: switched off, and not linked anywhere: ${HIDDEN_ROUTES.map((r) => `/${r}`).join(', ')}`);
for (const w of warn) console.log(`  note: ${w}`);
if (errors.length) {
  console.error(`check: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('check: all passed');
