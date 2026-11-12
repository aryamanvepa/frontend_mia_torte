import type { CatalogueItem } from './api';

const whole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const paise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
export const rupees = (n: number) => (Number.isInteger(n) ? whole : paise).format(n);

export function packLabel(i: Pick<CatalogueItem, 'pack_size' | 'pack_unit'>) {
  const n = Number(i.pack_size);
  const size = Number.isInteger(n) ? String(n) : String(n).replace(/0+$/, '');
  return i.pack_unit === 'pcs' ? `${size} pieces` : `${size} ${i.pack_unit}`;
}

/**
 * The pack type the SKU name ends with: "Fruit & Nut Muesli 140 g Pet Jar" → "jar",
 * "… 250 g Pouch" → "pouch". Empty when the name gives none.
 */
export function packKind(i: Pick<CatalogueItem, 'name'>) {
  const m = /\d+(?:\.\d+)?\s*(?:g|kg|ml|l|pcs)\s+(.+)$/i.exec(i.name.trim());
  if (!m) return '';
  return m[1].replace(/^pet\s+/i, '').toLowerCase();
}
/** "140 g jar", "500 g", "1 kg" */
export const packFull = (i: Pick<CatalogueItem, 'name' | 'pack_size' | 'pack_unit'>) => [packLabel(i), packKind(i)].filter(Boolean).join(' ');

/** Display title: the product name; the pack size is shown separately. */
export const titleOf = (i: Pick<CatalogueItem, 'product' | 'name'>) => i.product || i.name;

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function savingPct(i: Pick<CatalogueItem, 'mrp' | 'price'>) {
  if (!i.mrp || i.mrp <= i.price) return 0;
  return Math.round(((i.mrp - i.price) / i.mrp) * 100);
}

export function uuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
