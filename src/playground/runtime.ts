// Design playground runtime: applies a design to the page, remembers it in this browser,
// and reads / writes share links. Every storage access is wrapped in try/catch: storage can
// be missing or blocked (private windows, previews) and the page must still work.
import { BODY_FONTS, HEADING_FONTS, PRODUCTION, designToVars, diff, normalise, warmthMatrix, type Design } from './design';

const KEY = 'torte-pg:design';
const PRESETS_KEY = 'torte-pg:presets';
const SIDE_KEY = 'torte-pg:side';
export const PARAM = 'design';
export type Slot = 'A' | 'B' | 'C';
export type Presets = Partial<Record<Slot, Design>>;

const DEFAULT_VARS = designToVars(PRODUCTION);

function read(key: string): unknown {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: settings last for this visit only */ }
}

// ---------------------------------------------------------------- share links: ?design=<base64url of the changed settings>
export function encodeShare(d: Design) {
  const json = JSON.stringify(diff(d));
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeShare(code: string): Design | null {
  try {
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
    const json = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    return normalise({ ...PRODUCTION, ...JSON.parse(json) });
  } catch { return null; }
}
export function shareUrl(d: Design) {
  const u = new URL(window.location.href);
  u.search = '';
  u.hash = '';
  const code = encodeShare(d);
  if (code !== encodeShare(PRODUCTION)) u.searchParams.set(PARAM, code);
  return u.toString();
}

/** A link's settings win over the ones remembered in this browser (and replace them). */
export function initialDesign(): Design {
  try {
    const url = new URL(window.location.href);
    const code = url.searchParams.get(PARAM);
    if (code) {
      // Apply once, then drop it from the address, so a later Reset or change isn't undone by a reload.
      url.searchParams.delete(PARAM);
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
      const d = decodeShare(code);
      if (d) { saveDesign(d); return d; }
    }
  } catch { /* malformed address: fall through */ }
  const saved = read(KEY);
  return saved ? normalise(saved) : { ...PRODUCTION };
}
export const saveDesign = (d: Design) => write(KEY, diff(d));
export const loadPresets = (): Presets => {
  const raw = read(PRESETS_KEY) as Record<string, unknown> | null;
  const out: Presets = {};
  if (raw && typeof raw === 'object') for (const s of ['A', 'B', 'C'] as Slot[]) if (raw[s]) out[s] = normalise({ ...PRODUCTION, ...(raw[s] as object) });
  return out;
};
export const savePresets = (p: Presets) => write(PRESETS_KEY, Object.fromEntries(Object.entries(p).map(([k, d]) => [k, diff(d as Design)])));
export const loadSide = (): 'left' | 'right' => { try { return localStorage.getItem(SIDE_KEY) === 'left' ? 'left' : 'right'; } catch { return 'right'; } };
export const saveSide = (s: 'left' | 'right') => { try { localStorage.setItem(SIDE_KEY, s); } catch { /* ignore */ } };

// ---------------------------------------------------------------- applying a design
const loadedFonts = new Set<string>();
function loadFont(google?: string) {
  if (!google || loadedFonts.has(google)) return;
  loadedFonts.add(google);
  if (!document.querySelector('link[data-pg-preconnect]')) {
    for (const href of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']) {
      const l = document.createElement('link');
      l.rel = 'preconnect'; l.href = href; l.crossOrigin = ''; l.dataset.pg = ''; l.dataset.pgPreconnect = '';
      document.head.appendChild(l);
    }
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${google}&display=swap`;
  link.dataset.pg = '';
  document.head.appendChild(link);
}

/** Set the tokens that differ from production on <html>; the rest fall back to levers.css. */
export function applyDesign(d: Design) {
  const root = document.documentElement;
  const vars = designToVars(d);
  for (const [k, v] of Object.entries(vars)) {
    if (v === DEFAULT_VARS[k]) root.style.removeProperty(k);
    else root.style.setProperty(k, v);
  }
  loadFont(HEADING_FONTS[d.headingFont]?.google);
  loadFont(BODY_FONTS[d.bodyFont]?.google);
  const m = document.querySelector('#lv-warmth feColorMatrix');
  if (m) {
    const w = warmthMatrix(d.photoWarmth);
    m.setAttribute('values', `${w[0][0]} 0 0 0 0  0 ${w[1][1]} 0 0 0  0 0 ${w[2][2]} 0 0  0 0 0 1 0`);
  }
}
