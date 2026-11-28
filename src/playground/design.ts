// =====================================================================
// DESIGN SETTINGS — the playground's levers, and how each one maps onto
// CSS custom properties (tokens) that src/playground/levers.css feeds into
// the real shop styles.
//
// PRODUCTION (production.json) holds today's live look. designToVars(PRODUCTION)
// must equal the :root block at the top of levers.css; `npm run check:playground`
// fails if they drift. To make a chosen design the production default, see
// "Design playground" in README.md (scripts/apply-design.mjs does it).
//
// Pure functions only (no DOM): the apply and check scripts load this file too.
// =====================================================================
import production from './production.json';

export type Shadow = 'today' | 'none' | 'soft' | 'lifted';
export type Frame = 'none' | 'line' | 'polaroid' | 'arch';
export type Surface = 'cream' | 'white' | 'sand' | 'custom';
export type Shape3 = 'sharp' | 'soft' | 'pill';
export type CardShape = 'sharp' | 'soft' | 'round';
export type ButtonStyle = 'filled' | 'outline' | 'text';
export type Aspect = '4:5' | '1:1' | '3:2';
export type PriceEmphasis = 'quiet' | 'today' | 'bold' | 'accent';

export interface Design {
  // 1. Typography
  headingFont: string;
  bodyFont: string;
  /** Root size in px (16 = today). Everything sized in rem follows. */
  baseSize: number;
  /** Heading scale ratio, 1 = today. H1 × r², H2 × r, small headings × √r. */
  headingRatio: number;
  /** Body line height (1.6 today); paragraph styles keep their proportion to it. */
  lineHeight: number;
  /** Heading letter-spacing in em (−0.015 today). */
  headingTracking: number;
  /** Heading weight (360 today, Fraunces is variable). */
  headingWeight: number;
  // 2. Font sizes, % of today
  sizeH1: number;
  sizeH2: number;
  sizeBody: number;
  sizeSmall: number;
  sizePrice: number;
  // 3. Pictures
  picRadius: number;
  picBorderWidth: number;
  picBorderColor: string;
  picShadow: Shadow;
  picFrame: Frame;
  photoBrightness: number;
  /** −1 (cooler) … 0 (as shot) … +1 (warmer). */
  photoWarmth: number;
  photoSaturation: number;
  photoContrast: number;
  // 4. Colour
  accent: string;
  accent2: string;
  /** Call-to-action colour (terracotta "Shop now" buttons, menu highlights). */
  cta: string;
  surface: Surface;
  surfaceCustom: string;
  text: string;
  // 5. Density & spacing
  density: number;
  measure: number;
  // 6. Shape & buttons
  radiusButtons: Shape3;
  radiusCards: CardShape;
  radiusInputs: Shape3;
  buttonStyle: ButtonStyle;
  buttonSize: number;
  // 7. Product cards & grid
  colsDesktop: 2 | 3 | 4;
  colsMobile: 1 | 2;
  cardAspect: Aspect;
  cardDescription: boolean;
  cardSizePicker: boolean;
  priceEmphasis: PriceEmphasis;
}

/** Today's live look. */
export const PRODUCTION = production as Design;
export const KEYS = Object.keys(PRODUCTION) as (keyof Design)[];

// ---------------------------------------------------------------- fonts
export interface FontChoice {
  label: string;
  stack: string;
  /** Google Fonts css2 "family=" value, loaded in the playground only; absent = self-hosted today. */
  google?: string;
  /** The @fontsource package that self-hosts it in production (scripts/apply-design.mjs prints the steps). */
  pkg?: string;
}
const SERIF_FALLBACK = "'Iowan Old Style', 'Palatino Linotype', Georgia, serif";
const SANS_FALLBACK = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SCRIPT_FALLBACK = "'Snell Roundhand', 'Apple Chancery', cursive";
export const HEADING_FONTS: Record<string, FontChoice> = {
  fraunces: { label: 'Fraunces (today)', stack: `'Fraunces Variable', ${SERIF_FALLBACK}` },
  cormorant: { label: 'Cormorant Garamond', stack: `'Cormorant Garamond Variable', 'Cormorant Garamond', ${SERIF_FALLBACK}`, google: 'Cormorant+Garamond:ital,wght@0,300..700;1,300..700', pkg: '@fontsource-variable/cormorant-garamond' },
  playfair: { label: 'Playfair Display', stack: `'Playfair Display Variable', 'Playfair Display', ${SERIF_FALLBACK}`, google: 'Playfair+Display:ital,wght@0,400..900;1,400..900', pkg: '@fontsource-variable/playfair-display' },
  'dm-serif': { label: 'DM Serif Display', stack: `'DM Serif Display', ${SERIF_FALLBACK}`, google: 'DM+Serif+Display:ital@0;1', pkg: '@fontsource/dm-serif-display' },
  'young-serif': { label: 'Young Serif', stack: `'Young Serif', ${SERIF_FALLBACK}`, google: 'Young+Serif', pkg: '@fontsource/young-serif' },
  lora: { label: 'Lora', stack: `'Lora Variable', 'Lora', ${SERIF_FALLBACK}`, google: 'Lora:ital,wght@0,400..700;1,400..700', pkg: '@fontsource-variable/lora' },
  caslon: { label: 'Libre Caslon Text', stack: `'Libre Caslon Text', ${SERIF_FALLBACK}`, google: 'Libre+Caslon+Text:ital,wght@0,400;0,700;1,400', pkg: '@fontsource/libre-caslon-text' },
  gloock: { label: 'Gloock', stack: `'Gloock', ${SERIF_FALLBACK}`, google: 'Gloock', pkg: '@fontsource/gloock' },
  // Script faces (headings only: too ornate for body text)
  parisienne: { label: 'Parisienne (script)', stack: `'Parisienne', ${SCRIPT_FALLBACK}`, google: 'Parisienne', pkg: '@fontsource/parisienne' },
  allura: { label: 'Allura (script)', stack: `'Allura', ${SCRIPT_FALLBACK}`, google: 'Allura', pkg: '@fontsource/allura' },
  // Sans-serif headings
  'dm-sans': { label: 'DM Sans', stack: `'DM Sans Variable', ${SANS_FALLBACK}` },
  jakarta: { label: 'Plus Jakarta Sans', stack: `'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', ${SANS_FALLBACK}`, google: 'Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800', pkg: '@fontsource-variable/plus-jakarta-sans' },
  montserrat: { label: 'Montserrat', stack: `'Montserrat Variable', 'Montserrat', ${SANS_FALLBACK}`, google: 'Montserrat:ital,wght@0,100..900;1,100..900', pkg: '@fontsource-variable/montserrat' },
};
export const BODY_FONTS: Record<string, FontChoice> = {
  'dm-sans': { label: 'DM Sans (today)', stack: `'DM Sans Variable', ${SANS_FALLBACK}` },
  jakarta: { label: 'Plus Jakarta Sans', stack: `'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', ${SANS_FALLBACK}`, google: 'Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800', pkg: '@fontsource-variable/plus-jakarta-sans' },
  montserrat: { label: 'Montserrat', stack: `'Montserrat Variable', 'Montserrat', ${SANS_FALLBACK}`, google: 'Montserrat:ital,wght@0,100..900;1,100..900', pkg: '@fontsource-variable/montserrat' },
  'nunito-sans': { label: 'Nunito Sans', stack: `'Nunito Sans Variable', 'Nunito Sans', ${SANS_FALLBACK}`, google: 'Nunito+Sans:ital,wght@0,300..800;1,300..800', pkg: '@fontsource-variable/nunito-sans' },
  karla: { label: 'Karla', stack: `'Karla Variable', 'Karla', ${SANS_FALLBACK}`, google: 'Karla:ital,wght@0,300..800;1,300..800', pkg: '@fontsource-variable/karla' },
  figtree: { label: 'Figtree', stack: `'Figtree Variable', 'Figtree', ${SANS_FALLBACK}`, google: 'Figtree:ital,wght@0,300..900;1,300..900', pkg: '@fontsource-variable/figtree' },
  jost: { label: 'Jost', stack: `'Jost Variable', 'Jost', ${SANS_FALLBACK}`, google: 'Jost:ital,wght@0,300..700;1,300..700', pkg: '@fontsource-variable/jost' },
  mulish: { label: 'Mulish', stack: `'Mulish Variable', 'Mulish', ${SANS_FALLBACK}`, google: 'Mulish:ital,wght@0,300..800;1,300..800', pkg: '@fontsource-variable/mulish' },
  'work-sans': { label: 'Work Sans', stack: `'Work Sans Variable', 'Work Sans', ${SANS_FALLBACK}`, google: 'Work+Sans:ital,wght@0,300..700;1,300..700', pkg: '@fontsource-variable/work-sans' },
  lato: { label: 'Lato', stack: `'Lato', ${SANS_FALLBACK}`, google: 'Lato:ital,wght@0,300;0,400;0,700;1,400', pkg: '@fontsource/lato' },
};

// ---------------------------------------------------------------- palettes (one click)
export interface Palette { label: string; accent: string; accent2: string; cta: string; surface: Surface; surfaceCustom?: string; text: string }
export const PALETTES: Record<string, Palette> = {
  today: { label: 'Cocoa & gold (today)', accent: '#3a2419', accent2: '#87622a', cta: '#b5532f', surface: 'cream', text: '#3a2419' },
  golden: { label: 'Warm golden', accent: '#6b3d12', accent2: '#8a5a0b', cta: '#a3561a', surface: 'custom', surfaceCustom: '#f8eedc', text: '#3b2614' },
  giftbox: { label: 'Gift-box green', accent: '#2f4a40', accent2: '#85662a', cta: '#9c4a2c', surface: 'custom', surfaceCustom: '#f4f0e6', text: '#22302a' },
  blush: { label: 'Blush', accent: '#7d3346', accent2: '#94505d', cta: '#a3394f', surface: 'custom', surfaceCustom: '#fbefec', text: '#3d2328' },
  earthy: { label: 'Nutri Sampoorn earthy', accent: '#4e5a3a', accent2: '#94491d', cta: '#9a4a1f', surface: 'custom', surfaceCustom: '#f1ecdf', text: '#2f2a20' },
};

// ---------------------------------------------------------------- colour helpers
const hex = (h: string) => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(h.trim());
  if (!m) return [0, 0, 0];
  const s = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const toHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
/** a mixed toward b by t (0 = a, 1 = b). */
export const mix = (a: string, b: string, t: number) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
const rgba = (h: string, a: number) => `rgba(${hex(h).join(', ')}, ${a})`;
const lum = (h: string) => {
  const [r, g, b] = hex(h).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const SURFACES: Record<Exclude<Surface, 'custom'>, { bg: string; paper: string; linen: string }> = {
  cream: { bg: '#f6efe5', paper: '#fbf7f1', linen: '#efe5d6' },
  white: { bg: '#ffffff', paper: '#faf8f5', linen: '#f2ede6' },
  sand: { bg: '#ecdfca', paper: '#f5ecdf', linen: '#e2d1b7' },
};
export function surfaceColours(d: Design) {
  if (d.surface !== 'custom') return SURFACES[d.surface];
  const bg = d.surfaceCustom;
  return { bg, paper: mix(bg, '#ffffff', 0.45), linen: mix(bg, '#3a2419', 0.06) };
}
/**
 * The original cocoa-and-gold colours. Their derived shades (deep accent, muted text, gold tints, lines) were
 * hand-tuned in styles.css, so they are used as-is whenever a colour is still the original; any other colour
 * gets computed shades.
 */
const ORIGINAL = { accent: '#3a2419', accent2: '#87622a', cta: '#b5532f', text: '#3a2419', bg: '#f6efe5', paper: '#fbf7f1', linen: '#efe5d6' };

/** Text colour that reads best on a filled button of this colour. */
const onColour = (fill: string, light: string) => (contrast(fill, light) >= contrast(fill, '#1f140d') ? light : '#1f140d');

// ---------------------------------------------------------------- the mapping: settings → tokens
const px = (n: number) => `${+n.toFixed(2)}px`;
const num = (n: number) => `${+n.toFixed(4)}`;

const SHADOWS: Record<Exclude<Shadow, 'today'>, string> = {
  none: 'none',
  soft: '0 10px 28px -14px rgba(36, 21, 14, 0.32)',
  lifted: '0 2px 4px rgba(36, 21, 14, 0.08), 0 26px 50px -18px rgba(36, 21, 14, 0.45)',
};

/**
 * Every token the levers drive, for one design. Values are plain CSS. The defaults
 * (designToVars(PRODUCTION)) are the :root block of levers.css.
 */
export function designToVars(d: Design): Record<string, string> {
  const v: Record<string, string> = {};

  // 1–2. Type
  v['--serif'] = (HEADING_FONTS[d.headingFont] ?? HEADING_FONTS.fraunces).stack;
  v['--sans'] = (BODY_FONTS[d.bodyFont] ?? BODY_FONTS['dm-sans']).stack;
  v['--lv-base'] = num(d.baseSize / 16);
  const r = d.headingRatio;
  v['--lv-h1'] = num(r * r * (d.sizeH1 / 100));
  v['--lv-h2'] = num(r * (d.sizeH2 / 100));
  v['--lv-h3'] = num(Math.sqrt(r) * (d.sizeH2 / 100));
  v['--lv-body'] = num(d.sizeBody / 100);
  v['--lv-small'] = num(d.sizeSmall / 100);
  v['--lv-price'] = num((d.sizePrice / 100) * (d.priceEmphasis === 'bold' || d.priceEmphasis === 'accent' ? 1.12 : 1));
  v['--lv-lh'] = num(d.lineHeight / 1.6);
  v['--lv-h-track'] = `${num(d.headingTracking)}em`;
  v['--lv-h-weight'] = String(Math.round(d.headingWeight));

  // 3. Pictures
  v['--lv-pic-radius'] = px(d.picRadius);
  v['--lv-pic-radius-top'] = d.picFrame === 'arch' ? '999px' : px(d.picRadius);
  v['--lv-pic-border'] = d.picBorderWidth > 0 ? `${px(d.picBorderWidth)} solid ${d.picBorderColor}` : '0 none';
  const shadow = d.picShadow === 'today' ? 'none' : SHADOWS[d.picShadow];
  v['--lv-pic-shadow'] = shadow;
  v['--lv-pic-shadow-collage'] = d.picShadow === 'today' ? '0 18px 40px -24px rgba(110, 70, 20, 0.45)' : shadow;
  v['--lv-frame-line'] = d.picFrame === 'line' ? '1px solid rgba(255, 253, 249, 0.85)' : 'none';
  v['--lv-frame-pad'] = d.picFrame === 'polaroid' ? '10px' : '0px';
  v['--lv-frame-pad-b'] = d.picFrame === 'polaroid' ? '34px' : '0px';
  v['--lv-frame-bg'] = d.picFrame === 'polaroid' ? '#fffdf9' : 'var(--linen)';
  v['--lv-frame-fill'] = d.picFrame === 'polaroid' ? '#fffdf9' : 'transparent';
  const photoTuned = d.photoBrightness !== 1 || d.photoSaturation !== 1 || d.photoContrast !== 1 || d.photoWarmth !== 0;
  v['--lv-photo-filter'] = photoTuned
    ? `${d.photoWarmth !== 0 ? 'url(#lv-warmth) ' : ''}brightness(${num(d.photoBrightness)}) saturate(${num(d.photoSaturation)}) contrast(${num(d.photoContrast)})`
    : 'none';

  // 4. Colour
  const s = surfaceColours(d);
  const surfaceChanged = s.bg !== ORIGINAL.bg || s.paper !== ORIGINAL.paper || s.linen !== ORIGINAL.linen;
  v['--cream'] = s.bg;
  v['--paper'] = s.paper;
  v['--linen'] = s.linen;
  v['--cocoa'] = d.text;
  v['--muted'] = d.text === ORIGINAL.text && !surfaceChanged ? '#6b5244' : mix(d.text, s.bg, 0.24);
  v['--line'] = d.text === ORIGINAL.text ? 'rgba(58, 36, 25, 0.13)' : rgba(d.text, 0.13);
  v['--line-strong'] = d.text === ORIGINAL.text ? 'rgba(58, 36, 25, 0.28)' : rgba(d.text, 0.28);
  v['--lv-accent'] = d.accent;
  // Links (arrow links) inherit their colour today; `initial` keeps that until the accent changes.
  v['--lv-link'] = d.accent === ORIGINAL.accent ? 'initial' : d.accent;
  v['--lv-accent-deep'] = d.accent === ORIGINAL.accent ? '#24150e' : mix(d.accent, '#000000', 0.38);
  v['--lv-on-accent'] = d.accent === ORIGINAL.accent ? 'var(--cream)' : onColour(d.accent, s.bg);
  v['--gold-ink'] = d.accent2;
  v['--gold'] = d.accent2 === ORIGINAL.accent2 ? '#b38b4d' : mix(d.accent2, '#ffffff', 0.22);
  v['--gold-soft'] = d.accent2 === ORIGINAL.accent2 ? '#e9d3a6' : mix(d.accent2, '#ffffff', 0.62);
  v['--terracotta'] = d.cta;
  v['--terracotta-deep'] = d.cta === ORIGINAL.cta ? '#9a4426' : mix(d.cta, '#000000', 0.15);
  v['--lv-on-cta'] = d.cta === ORIGINAL.cta ? '#fff' : onColour(d.cta, '#ffffff');

  // 5. Density
  v['--lv-space'] = num(d.density);
  v['--lv-measure'] = num(d.measure);

  // 6. Shape & buttons
  v['--lv-r-btn'] = { sharp: '0px', soft: '6px', pill: '999px' }[d.radiusButtons];
  v['--lv-r-card'] = { sharp: '0px', soft: '4px', round: '18px' }[d.radiusCards];
  v['--lv-r-input'] = { sharp: '0px', soft: '4px', pill: '999px' }[d.radiusInputs];
  v['--lv-r-input-pill'] = d.radiusInputs === 'sharp' ? '0px' : '999px';
  v['--lv-r-textarea'] = { sharp: '0px', soft: '4px', pill: '18px' }[d.radiusInputs];
  const filled = d.buttonStyle === 'filled', text = d.buttonStyle === 'text';
  v['--lv-btn-bg'] = filled ? 'var(--lv-accent)' : 'transparent';
  v['--lv-btn-fg'] = filled ? 'var(--lv-on-accent)' : 'var(--lv-accent)';
  v['--lv-btn-fg-hover'] = text ? 'var(--lv-accent-deep)' : 'var(--lv-on-accent)';
  v['--lv-btn-border'] = text ? 'transparent' : 'var(--lv-accent)';
  v['--lv-btn-sweep'] = filled ? 'var(--lv-accent-deep)' : text ? 'transparent' : 'var(--lv-accent)';
  v['--lv-btn-deco'] = text ? 'underline' : 'none';
  v['--lv-btn-size'] = num(d.buttonSize);
  v['--lv-btn-px'] = text ? '4px' : px(28 * d.buttonSize);
  // the same three styles for the call-to-action (terracotta) buttons
  v['--lv-cta-bg'] = filled ? 'var(--terracotta)' : 'transparent';
  v['--lv-cta-fg'] = filled ? 'var(--lv-on-cta)' : 'var(--terracotta)';
  v['--lv-cta-border'] = text ? 'transparent' : 'var(--terracotta)';
  v['--lv-cta-hover-bg'] = filled ? 'var(--terracotta-deep)' : text ? 'transparent' : 'var(--terracotta)';
  v['--lv-cta-hover-border'] = filled ? 'var(--terracotta-deep)' : text ? 'transparent' : 'var(--terracotta)';
  v['--lv-cta-hover-fg'] = text ? 'var(--terracotta-deep)' : 'var(--lv-on-cta)';

  // 7. Cards & grid
  const tablet = Math.min(3, d.colsDesktop);
  v['--lv-cols-m'] = String(d.colsMobile);
  v['--lv-cols-t'] = String(tablet);
  v['--lv-cols-d'] = String(d.colsDesktop);
  v['--lv-rail-m'] = d.colsMobile === 1 ? 'minmax(170px, 84%)' : 'minmax(170px, 46%)';
  v['--lv-rail-t'] = tablet === 3 ? 'minmax(200px, 31%)' : 'minmax(200px, 46%)';
  v['--lv-rail-d'] = d.colsDesktop === 4 ? 'auto-fill, minmax(220px, 1fr)' : `${d.colsDesktop}, minmax(0, 1fr)`;
  v['--lv-card-aspect'] = { '4:5': '4 / 5', '1:1': '1 / 1', '3:2': '3 / 2' }[d.cardAspect];
  v['--lv-card-desc'] = d.cardDescription ? '-webkit-box' : 'none';
  v['--lv-card-size'] = d.cardSizePicker ? 'block' : 'none';
  v['--lv-card-size-single'] = d.cardSizePicker ? 'flex' : 'none';
  v['--lv-price-weight'] = { quiet: '500', today: '600', bold: '700', accent: '700' }[d.priceEmphasis];
  v['--lv-price-color'] = { quiet: 'var(--muted)', today: 'inherit', bold: 'inherit', accent: 'var(--lv-accent)' }[d.priceEmphasis];
  return v;
}

/** The feColorMatrix for photo warmth (also usable with sharp's .recomb() to bake it into the photos). */
export function warmthMatrix(w: number) {
  const k = 0.12 * w;
  return [
    [1 + k, 0, 0],
    [0, 1 + k * 0.25, 0],
    [0, 0, 1 - k],
  ];
}

// ---------------------------------------------------------------- AA contrast checks
export interface ContrastCheck { label: string; ratio: number; min: number; ok: boolean }
export function contrastChecks(d: Design): ContrastCheck[] {
  const v = designToVars(d);
  const s = surfaceColours(d);
  const muted = v['--muted'];
  const onAccent = d.accent === ORIGINAL.accent ? s.bg : v['--lv-on-accent'];
  const rows: [string, string, string, number][] = [
    ['Body text on page', d.text, s.bg, 4.5],
    ['Body text on cards', d.text, s.paper, 4.5],
    ['Secondary text on page', muted, s.bg, 4.5],
    ['Secondary accent (labels, links) on page', d.accent2, s.bg, 4.5],
    ['Secondary accent on cards', d.accent2, s.paper, 4.5],
  ];
  if (d.buttonStyle === 'filled') rows.push(['Button label on accent', onAccent, d.accent, 4.5]);
  const onCta = d.cta === ORIGINAL.cta ? '#ffffff' : v['--lv-on-cta'];
  if (d.buttonStyle === 'filled') rows.push(['Label on call-to-action buttons', onCta, d.cta, 4.5]);
  else rows.push(['Call-to-action buttons on page', d.cta, s.bg, 4.5]);
  rows.push([d.buttonStyle === 'filled' ? 'Accent on page (outline buttons, links)' : 'Button label on page', d.accent, s.bg, 4.5]);
  if (d.priceEmphasis === 'accent') rows.push(['Accent price on page', d.accent, s.bg, 4.5]);
  if (d.picBorderWidth > 0) rows.push(['Picture border on page (non-text, 3:1)', d.picBorderColor, s.bg, 3]);
  return rows.map(([label, fg, bg, min]) => { const ratio = contrast(fg, bg); return { label, ratio, min, ok: ratio >= min }; });
}

// ---------------------------------------------------------------- sanitising & sharing
/** Fill in and clamp a settings object that came from storage, a link or a paste. Unknown keys are dropped. */
export function normalise(input: unknown): Design {
  const out = { ...PRODUCTION } as Record<string, unknown>;
  if (!input || typeof input !== 'object') return out as unknown as Design;
  for (const k of KEYS) {
    const val = (input as Record<string, unknown>)[k];
    const def = PRODUCTION[k];
    if (val === undefined || typeof val !== typeof def) continue;
    if (typeof def === 'string' && typeof val === 'string' && /^#/.test(def) && !/^#[0-9a-f]{6}$/i.test(val)) continue;
    if (typeof val === 'number' && !Number.isFinite(val)) continue;
    out[k] = val;
  }
  const d = out as unknown as Design;
  if (!HEADING_FONTS[d.headingFont]) d.headingFont = PRODUCTION.headingFont;
  if (!BODY_FONTS[d.bodyFont]) d.bodyFont = PRODUCTION.bodyFont;
  if (![2, 3, 4].includes(d.colsDesktop)) d.colsDesktop = PRODUCTION.colsDesktop;
  if (![1, 2].includes(d.colsMobile)) d.colsMobile = PRODUCTION.colsMobile;
  const oneOf = <K extends keyof Design>(k: K, opts: readonly Design[K][]) => { if (!opts.includes(d[k])) (d as unknown as Record<string, unknown>)[k] = PRODUCTION[k]; };
  oneOf('picShadow', ['today', 'none', 'soft', 'lifted']);
  oneOf('picFrame', ['none', 'line', 'polaroid', 'arch']);
  oneOf('surface', ['cream', 'white', 'sand', 'custom']);
  oneOf('radiusButtons', ['sharp', 'soft', 'pill']);
  oneOf('radiusCards', ['sharp', 'soft', 'round']);
  oneOf('radiusInputs', ['sharp', 'soft', 'pill']);
  oneOf('buttonStyle', ['filled', 'outline', 'text']);
  oneOf('cardAspect', ['4:5', '1:1', '3:2']);
  oneOf('priceEmphasis', ['quiet', 'today', 'bold', 'accent']);
  const clamp = (k: keyof Design, lo: number, hi: number) => { const n = d[k] as number; (d as unknown as Record<string, number>)[k] = Math.min(hi, Math.max(lo, n)); };
  clamp('baseSize', 13, 20); clamp('headingRatio', 0.8, 1.3); clamp('lineHeight', 1.2, 2.1); clamp('headingTracking', -0.06, 0.08);
  clamp('headingWeight', 250, 800);
  for (const k of ['sizeH1', 'sizeH2', 'sizeBody', 'sizeSmall', 'sizePrice'] as const) clamp(k, 60, 160);
  clamp('picRadius', 0, 40); clamp('picBorderWidth', 0, 12);
  clamp('photoBrightness', 0.7, 1.4); clamp('photoWarmth', -1, 1); clamp('photoSaturation', 0.5, 1.8); clamp('photoContrast', 0.7, 1.4);
  clamp('density', 0.5, 1.8); clamp('measure', 0.7, 1.4); clamp('buttonSize', 0.8, 1.3);
  return d;
}

/** Only the settings that differ from production. */
export function diff(d: Design): Partial<Design> {
  return Object.fromEntries(KEYS.filter((k) => d[k] !== PRODUCTION[k]).map((k) => [k, d[k]])) as Partial<Design>;
}
