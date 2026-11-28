// =====================================================================
// APPLY A DESIGN — make settings chosen in the design playground the
// production defaults.
//
//   node scripts/apply-design.mjs design.json        settings JSON from "Copy settings"
//   node scripts/apply-design.mjs "<share link>"     a playground "Share link"
//   node scripts/apply-design.mjs --sync             only regenerate levers.css from production.json
//
// What it changes (review with `git diff`, then build, check and commit):
//   1. src/playground/production.json   ← the merged settings (the playground's "Reset to production")
//   2. src/playground/levers.css        ← its :root token block, regenerated from (1) by design.ts
//   3. src/main.tsx                     ← imports levers.css after styles.css (once), so the live
//                                         site uses the tokens. From then on production output changes.
// It prints what it can't do by itself: self-hosting a new font (@fontsource), and baking photo
// warmth into the image files (CSS can't warm a photo without the playground's SVG filter).
// =====================================================================
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { loadDesign, rootBlock } from './lib/load-design.mjs';

const LEVERS = 'src/playground/levers.css';
const PROD = 'src/playground/production.json';
const MAIN = 'src/main.tsx';
const arg = process.argv[2];
if (!arg) { console.error('usage: node scripts/apply-design.mjs <design.json | share link | --sync>'); process.exit(1); }

const m = await loadDesign();

// ---------------------------------------------------------------- read the chosen settings
let input = {};
if (arg !== '--sync') {
  if (/^https?:\/\//.test(arg)) {
    const code = new URL(arg).searchParams.get('design');
    if (!code) { console.error('That link has no ?design= settings (it shows the production look).'); process.exit(1); }
    input = JSON.parse(Buffer.from(code.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } else {
    if (!existsSync(arg)) { console.error(`No such file: ${arg}`); process.exit(1); }
    input = JSON.parse(readFileSync(arg, 'utf8'));
  }
}
const design = m.normalise({ ...m.PRODUCTION, ...input });
const changed = Object.keys(m.diff(design));

// ---------------------------------------------------------------- 1. production.json
if (arg !== '--sync') {
  writeFileSync(PROD, `${JSON.stringify(design, null, 2)}\n`);
  console.log(`apply-design: ${changed.length ? `${changed.length} setting(s) changed: ${changed.join(', ')}` : 'no settings differ from production'}`);
}

// ---------------------------------------------------------------- 2. levers.css token block
// Photo warmth uses an SVG filter that only the playground puts on the page: keep it out of the CSS.
const cssDesign = { ...design, photoWarmth: 0 };
const vars = m.designToVars(cssDesign);
const css = readFileSync(LEVERS, 'utf8');
const re = /(\/\* design-tokens:start \*\/\s*)html:root \{[\s\S]*?\}(\s*\/\* design-tokens:end \*\/)/;
if (!re.test(css)) { console.error(`${LEVERS}: design-tokens markers not found`); process.exit(1); }
writeFileSync(LEVERS, css.replace(re, `$1${rootBlock(vars).replace(/^:root/, 'html:root')}$2`));
console.log(`apply-design: ${LEVERS} token block regenerated (${Object.keys(vars).length} tokens)`);

// ---------------------------------------------------------------- 3. production imports the levers
if (arg !== '--sync') {
  const main = readFileSync(MAIN, 'utf8');
  if (!main.includes("./playground/levers.css")) {
    writeFileSync(MAIN, main.replace("import './styles.css';\n", "import './styles.css';\nimport './playground/levers.css'; // design tokens (scripts/apply-design.mjs)\n"));
    console.log(`apply-design: ${MAIN} now imports levers.css after styles.css (production output will change)`);
  }
}

// ---------------------------------------------------------------- what's left to do by hand
const todo = [];
for (const [kind, key, list] of [['Heading', design.headingFont, m.HEADING_FONTS], ['Body', design.bodyFont, m.BODY_FONTS]]) {
  const f = list[key];
  if (f?.pkg) todo.push(`${kind} font ${f.label}: npm i ${f.pkg}  and in src/main.tsx  import '${f.pkg}';  (the token already names it)`);
}
if (design.photoWarmth !== 0) {
  const w = m.warmthMatrix(design.photoWarmth);
  todo.push(`Photo warmth ${design.photoWarmth}: bake it into the photos with sharp, e.g. .recomb(${JSON.stringify(w)}) in scripts/optimise-images.mjs (brightness/saturation/contrast are applied by CSS; bake them too if you prefer and reset those sliders)`);
}
if (todo.length) { console.log('\napply-design: still to do by hand:'); for (const t of todo) console.log(`  • ${t}`); }
console.log('\nNext: npm run build && npm run check (production), VITE_PLAYGROUND=1 npm run build && npm run check:playground, then commit.');
