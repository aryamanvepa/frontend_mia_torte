// Turns original photos into the responsive WebP files the site uses.
//
//   npm run images -- <folder of originals>
//
// Every .jpg/.jpeg/.png/.webp in the folder becomes
//   public/images/<name>-640.webp, -1280.webp, -1920.webp   (never upscaled)
// and src/content/images.generated.json records its size and a tiny blurred preview.
// The file name (without extension) is the image's id, e.g. "mt-000001-1.jpg" → "mt-000001-1".
// Then reference that id from src/content/products.ts (and add its credit/alt in src/content/images.ts).
import sharp from 'sharp';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2];
if (!src || !existsSync(src)) {
  console.error('Usage: npm run images -- <folder of original photos>');
  process.exit(1);
}
const outDir = join(root, 'public', 'images');
const manifestPath = join(root, 'src', 'content', 'images.generated.json');
mkdirSync(outDir, { recursive: true });
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const WIDTHS = [640, 1280, 1920];

for (const file of readdirSync(src).sort()) {
  if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
  const id = basename(file, extname(file)).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const img = sharp(join(src, file)).rotate();
  const { width, height } = await img.metadata();
  const widths = WIDTHS.filter((w) => w <= width);
  // Keep the full original width too, so photos narrower than the next step still look sharp on big screens.
  if (!widths.length || widths[widths.length - 1] < width) widths.push(width);
  for (const w of widths) {
    await img.clone().resize({ width: w }).webp({ quality: w > 1000 ? 72 : 76, effort: 5 }).toFile(join(outDir, `${id}-${w}.webp`));
  }
  const lqip = await img.clone().resize({ width: 24 }).blur(1).webp({ quality: 40 }).toBuffer();
  manifest[id] = { w: width, h: height, widths, lqip: `data:image/webp;base64,${lqip.toString('base64')}` };
  console.log(`  ${id}  ${width}×${height}  → ${widths.join(', ')}`);
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nWrote ${Object.keys(manifest).length} entries to src/content/images.generated.json`);
