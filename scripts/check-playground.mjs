// =====================================================================
// PLAYGROUND CHECKS — run after `VITE_PLAYGROUND=1 npm run build`:
//   npm run check:playground
//
// The design playground (playground.lamiatorte.pages.dev) must never be
// indexed or take an order. Fails (exit 1) unless:
//   - every HTML page carries <meta name="robots" content="noindex, …">
//   - robots.txt disallows everything and names no sitemap; no sitemap.xml
//   - _headers sends X-Robots-Tag: noindex to every address
//   - every canonical still points at SITE_URL (https://lamiatorte.com)
//   - no live ordering control in the pre-rendered HTML: no enabled
//     "Place order", "Notify me", "Cancel this order" or "Request
//     cancellation" button, every notify-me form switched off, with the
//     "Playground — ordering is off" note
//   - the design panel is in the bundle but not baked into any page
//   - levers.css's :root defaults equal production.json (via design.ts)
// =====================================================================
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { loadDesign } from './lib/load-design.mjs';

const DIST = 'dist';
const SITE_URL = (process.env.VITE_SITE_URL || 'https://lamiatorte.com').replace(/\/$/, '');
const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

if (!existsSync(DIST)) { console.error('check:playground: no dist/ folder. Run VITE_PLAYGROUND=1 npm run build first.'); process.exit(1); }

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === 'assets' || f === 'images' || f === 'brand' ? [] : htmlFiles(p);
    return f.endsWith('.html') ? [p] : [];
  });
}

// ---------------------------------------------------------------- pages
const files = htmlFiles(DIST);
let prerendered = 0;
let notifyForms = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const page = file.slice(DIST.length) || '/';
  const robots = /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i.exec(html)?.[1] ?? '';
  if (!/noindex/i.test(robots)) fail(page, `not noindex (robots meta: "${robots || 'missing'}")`);
  for (const m of html.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/gi)) {
    if (!m[1].startsWith(`${SITE_URL}/`)) fail(page, `canonical ${m[1]} is not on ${SITE_URL}`);
  }
  if (/class="[^"]*\bpg-(root|panel|toggle)\b/.test(html)) fail(page, 'design panel baked into the pre-rendered page');

  const isShell = !/<div id="root">\s*<[a-z]/i.test(html);
  if (isShell) continue;
  prerendered++;
  if (!/<link[^>]+rel="canonical"/i.test(html)) fail(page, 'pre-rendered page without a canonical');

  // Ordering controls: none may be live.
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const attrs = m[1];
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (/Place order|Notify me|Cancel this order|Request cancellation/i.test(text + attrs) && !/\bdisabled\b/.test(attrs)) {
      fail(page, `live ordering control: <button${attrs.slice(0, 80)}> ${text.slice(0, 60)}`);
    }
  }
  for (const m of html.matchAll(/<form\b[^>]*class="[^"]*\bnotify\b[^"]*"[^>]*>([\s\S]*?)<\/form>/gi)) {
    notifyForms++;
    const body = m[1];
    if (!/<fieldset\b[^>]*\bdisabled\b/.test(body)) fail(page, 'notify-me form fields are not switched off');
    if (/<input\b(?![^>]*\bdisabled\b)[^>]*>/.test(body.replace(/<fieldset\b[^>]*\bdisabled\b[^>]*>[\s\S]*?<\/fieldset>/gi, ''))) fail(page, 'notify-me form has a live input');
    if (!/Playground — ordering is off/.test(body)) fail(page, 'notify-me form without the "Playground — ordering is off" note');
  }
  if (/<form\b[^>]*class="[^"]*\btrack__cancel-form\b/.test(html)) fail(page, 'cancellation form on the page');
}
if (!prerendered) errors.push('no pre-rendered pages (did the pre-render step run?)');

// ---------------------------------------------------------------- crawling
if (existsSync(join(DIST, 'sitemap.xml'))) errors.push('sitemap.xml exists (the playground must not have one)');
const robotsTxt = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf8') : '';
if (!robotsTxt) errors.push('robots.txt missing');
else {
  if (!/^User-agent: \*\s*$/m.test(robotsTxt) || !/^Disallow: \/\s*$/m.test(robotsTxt)) errors.push('robots.txt does not disallow everything (User-agent: * / Disallow: /)');
  if (/^Allow:/mi.test(robotsTxt)) errors.push('robots.txt has an Allow: line');
  if (/^Sitemap:/mi.test(robotsTxt)) errors.push('robots.txt names a sitemap');
}
const headers = existsSync(join(DIST, '_headers')) ? readFileSync(join(DIST, '_headers'), 'utf8') : '';
if (!/^\/\*\s*\n\s+X-Robots-Tag:\s*noindex/m.test(headers)) errors.push('_headers does not send X-Robots-Tag: noindex for /*');

// ---------------------------------------------------------------- bundle
const js = readdirSync(join(DIST, 'assets')).filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(DIST, 'assets', f), 'utf8')).join('\n');
if (!js.includes('Design playground')) errors.push('the design panel is not in the bundle (built without VITE_PLAYGROUND=1?)');
if (/service_role/i.test(js)) errors.push('the bundle mentions service_role');

// ---------------------------------------------------------------- tokens: levers.css defaults = production.json
const { PRODUCTION, designToVars } = await loadDesign();
const css = readFileSync('src/playground/levers.css', 'utf8');
const block = /\/\* design-tokens:start \*\/\s*html:root \{([\s\S]*?)\}\s*\/\* design-tokens:end \*\//.exec(css)?.[1];
if (!block) errors.push('levers.css: design-tokens block not found');
else {
  const inCss = Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const expected = designToVars(PRODUCTION);
  for (const [k, v] of Object.entries(expected)) if (inCss[k] !== v) errors.push(`levers.css: ${k} is "${inCss[k]}", production.json gives "${v}" (run node scripts/apply-design.mjs --sync)`);
  for (const k of Object.keys(inCss)) if (!(k in expected)) errors.push(`levers.css: ${k} is not produced by design.ts`);
}

console.log(`check:playground: ${files.length} HTML files, ${prerendered} pre-rendered, ${notifyForms} notify-me forms (all switched off)`);
if (errors.length) {
  console.error(`check:playground: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('check:playground: all passed (noindex everywhere, robots disallow-all, no sitemap, canonicals on ' + SITE_URL + ', ordering off)');
