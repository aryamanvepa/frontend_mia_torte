import type { Delivery } from '../lib/api';
// =====================================================================
// THE STORE — one food store, organised around how people buy
// (Website Design Brief §3–5). Mia Torte and Nutri Sampoorna appear as
// labels on products, never as separate shops.
//
// CATEGORIES map from the product "category" set in the ops app
// (case-insensitive). A product can appear in more than one store
// category (it still exists once in the catalogue): list it under `alsoIncludes`
// by its exact product name.
// =====================================================================

export type BuyingKind = 'sensory' | 'considered';

export interface StoreCategory {
  slug: string;
  title: string;
  /** Home-page "Shop by craving" tile label. */
  craving: string;
  /** Sensory (treats, snacks): photos, taste and texture first. Considered (pantry): ingredients, nutrition, preparation first. */
  kind: BuyingKind;
  intro: string;
  image: string;
  categories: string[];
  alsoIncludes?: string[];
  empty: string;
}

export const storeCategories: StoreCategory[] = [
  {
    slug: 'indulgence-treats',
    title: 'Indulgence & Treats',
    craving: 'Treat Yourself',
    kind: 'sensory',
    intro: 'Cookies, biscuits, brownies and desserts for the moments that call for something genuinely delicious.',
    image: 'chocolate-cocoa',
    categories: ['Cookies', 'Biscuits', 'Brownies', 'Cakes', 'Desserts', 'Chocolate'],
    empty: 'New treats are being perfected in the kitchen.',
  },
  {
    slug: 'better-snacking',
    title: 'Better Snacking',
    craving: 'Snack Better',
    kind: 'sensory',
    intro: 'Millet crunches, roasted mixes, nuts and chips with real flavour. Better snacking. Nothing missing on taste.',
    image: 'category-snacks',
    categories: ['Snacks', 'Savouries', 'Namkeen', 'Nuts & seeds', 'Nuts', 'Seeds'],
    alsoIncludes: ['Jowar Jeera Delight (8 nos.)'],
    empty: 'New snacks are on their way.',
  },
  {
    slug: 'everyday-nourishment',
    title: 'Everyday Nourishment',
    craving: 'Eat Well Every Day',
    kind: 'considered',
    intro: 'Multigrain and millet attas, dosa mixes, muesli and pantry staples for the meals you make every day.',
    image: 'ns-atta-bowl',
    categories: ['Atta & flours', 'Atta', 'Flours', 'Grain blends', 'Dosa & batter mixes', 'Dosa mixes', 'Breakfast mixes', 'Breakfast', 'Muesli', 'Granola', 'Chutney powders', 'Podis', 'Pantry'],
    empty: 'New pantry staples are on their way.',
  },
  {
    slug: 'gifting-discovery',
    title: 'Gifting & Discovery',
    craving: 'Discover & Gift',
    kind: 'sensory',
    intro: 'Hampers, bundles, trial packs and seasonal collections: easy ways to try more, and to share it.',
    image: 'mt-gifting-box',
    categories: ['Gifting', 'Gift boxes', 'Hampers', 'Bundles', 'Trial packs', 'Seasonal'],
    empty: 'Our first hampers and trial packs are being put together. For gifting or corporate orders in the meantime, write to us and we will help.',
  },
];

export const bestsellersPage = {
  slug: 'bestsellers',
  title: 'Bestsellers',
  intro: 'The products our customers come back for.',
  image: 'mt-gifting-box',
};

export const shopAllPage = {
  title: 'Shop all',
  intro: 'Everything in the store: treats, better snacks and everyday staples, from Mia Torte and Nutri Sampoorna.',
};

// ---------------------------------------------------------------- home page (§5)
export const storeHome = {
  heroTitle: 'Something delicious\nis waiting.',
  heroText: 'Cookies and treats, better snacks and everyday staples, made with care in small batches. Find a favourite, or discover a new one.',
  cravingTitle: 'Shop by craving',
  bestsellersTitle: 'Bestsellers',
  snacking: {
    eyebrow: 'Better Snacking',
    title: 'Better snacking.\nNothing missing on taste.',
    text: 'Millet crunches, roasted bean mixes, peri peri trail mix and vegetable chips. Taste comes first; the ingredients make it worth reaching for again.',
  },
  nourishment: {
    eyebrow: 'Everyday Nourishment',
    title: 'For the meals you make every day.',
    text: 'Attas, dosa mixes, muesli and chutney powders, with the ingredients, nutrition and preparation set out clearly on every page.',
  },
  discoveries: { eyebrow: 'New discoveries', title: 'New on the shelf' },
  gifting: {
    eyebrow: 'Gifting & Discovery',
    title: 'Made for sharing.',
    text: 'Hampers, bundles and trial packs that make it easy to try more, or to give something good.',
  },
  company: {
    eyebrow: 'Torte Living',
    title: 'Two kitchens, one store.',
    text: 'Torte Living makes food under two names: Mia Torte, for cookies, treats and snacks inspired by European baking, and Nutri Sampoorna, for everyday staples built on India’s grains, millets and pulses.',
  },
};

/** Sub-types shown as quick links on the Everyday Nourishment section (ops categories). */
export const nourishmentTypes = ['Atta & flours', 'Dosa & batter mixes', 'Muesli', 'Chutney powders'];

/** Friendly display name for an ops category, used in filters. */
export const typeLabel = (category: string | null | undefined) => category?.trim() || 'Other';

// ---------------------------------------------------------------- delivery (§9)
/**
 * Used only until the server's `delivery` answer is on the quote; the server always decides.
 * Mirrors the backend rules (B5, 2026-11-13): 500001–500100 local by Rapido, 0–1 days;
 * the rest of 500xxx–509xxx by iCarry, 2–4 days; the rest of India by iCarry, 3–7 days;
 * 99xxxx and invalid PINs are not serviceable.
 */
export function deliveryFallback(pin: string): Delivery {
  const p = pin.trim();
  if (!/^[1-9]\d{5}$/.test(p) || p.startsWith('99')) return { serviceable: false };
  const n = Number(p);
  if (n >= 500001 && n <= 500100) return { serviceable: true, zone: 'local', carrier: 'Rapido', eta_min_days: 0, eta_max_days: 1 };
  if (n >= 500000 && n <= 509999) return { serviceable: true, zone: 'national', carrier: 'iCarry', eta_min_days: 2, eta_max_days: 4 };
  return { serviceable: true, zone: 'national', carrier: 'iCarry', eta_min_days: 3, eta_max_days: 7 };
}

/** One sentence for a delivery answer (server or fallback). */
export function deliveryText(d: Delivery, pin: string): string {
  if (!d.serviceable) return d.message || `Sorry, we don’t deliver to ${pin} yet.`;
  if (d.message) return d.message;
  const eta = d.eta_min_days == null ? ''
    : d.eta_min_days === 0 && (d.eta_max_days ?? 0) <= 1 ? ' same or next day'
    : ` in ${d.eta_min_days}–${d.eta_max_days ?? d.eta_min_days} days`;
  return `Delivers to ${pin}${eta}${d.carrier ? ` by ${d.carrier}` : ''} (estimate, from dispatch).`;
}
