import type { Delivery } from '../lib/api';
// =====================================================================
// THE STORE — one food store, organised around how people buy
// (Website Design Brief §3–5). Mia Torte and Nutri Sampoorn appear as
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
    image: 'mt-cookie-box-1',
    categories: ['Gifting', 'Gift boxes', 'Hampers', 'Bundles', 'Trial packs', 'Seasonal'],
    empty: 'Our first hampers and trial packs are being put together. For gifting or corporate orders in the meantime, write to us and we will help.',
  },
];

export const bestsellersPage = {
  slug: 'bestsellers',
  title: 'Bestsellers',
  intro: 'The products our customers come back for.',
  image: 'mt-cookie-box-1',
};

export const shopAllPage = {
  title: 'Shop all',
  intro: 'Everything in the store: treats, better snacks and everyday staples, from Mia Torte and Nutri Sampoorn.',
};

// ---------------------------------------------------------------- home page (§5)
export const storeHome = {
  heroTitle: 'Something delicious\nis waiting.',
  heroText: 'Cookies and treats, better snacks and everyday staples, made with care in small batches. Find a favourite, or discover a new one.',
  cravingTitle: 'Shop by craving',
  bestsellersTitle: 'Bestsellers',
  /** The home page's lead category feature: taste leads, ingredients and nutrition reinforce. */
  snacking: {
    eyebrow: 'Better Snacking',
    title: 'Better snacking.\nNothing missing on taste.',
    text: 'Crunchy, bold and full of flavour, because a snack should be a pleasure first. Made with millets, nuts, beans and seeds, so the snack you reach for is one you can feel good about.',
    pillars: [
      { title: 'Crunch first', text: 'Millet crunches, bean mixes, trail mix and vegetable chips, made for a proper crunch.' },
      { title: 'Big, bold flavour', text: 'Peri peri, pudina, masala, or simply salted: flavours you will want to come back to.' },
      { title: 'Better ingredients behind it', text: 'Built on millets, nuts, beans and seeds, with full nutrition information on every product page.' },
    ],
    /** Lifestyle photo for the feature (images.ts id). Until it exists, a product illustration and a note on the shot. */
    image: 'mt-pudina-crunch-1' as string | undefined,
    shot: 'Lifestyle photograph to come: a bowl of Peri Peri Trail Mix and Pudina Millet Crunch on a tea table, hands reaching in.',
  },
  treats: { eyebrow: 'Indulgence & Treats', title: 'Something to savour.', cta: 'Shop treats' },
  nourishment: {
    eyebrow: 'Everyday Nourishment',
    title: 'For the meals you make every day.',
    text: 'Attas, dosa mixes, muesli and chutney powders, with the ingredients, nutrition and preparation set out clearly on every page.',
  },
  discoveries: { eyebrow: 'New & seasonal', title: 'New on the shelf' },
  gifting: {
    eyebrow: 'Gifting & bundles',
    title: 'Made for sharing.',
    text: 'Hampers, bundles and trial packs that make it easy to try more, or to give something good.',
  },
  company: {
    eyebrow: 'About Torte Living',
    title: 'Good food, made with care.',
    text: 'Torte Living is one food store for every part of the day: cookies and treats worth slowing down for, snacks with real crunch and flavour, and everyday staples made from India’s grains, millets and pulses. We make in small batches and think hard about what goes in, so taste and better ingredients never have to compete.',
  },
};

// ---------------------------------------------------------------- cross-category recommendations
/**
 * "Goes well with": for a product in this ops category, suggest these categories first (in order),
 * so baskets grow across the store: cookies → brownies and snacks, atta → dosa mixes and breakfast.
 */
export const pairings: Record<string, string[]> = {
  cookies: ['brownies', 'snacks', 'muesli', 'cakes', 'desserts'],
  biscuits: ['brownies', 'snacks', 'muesli'],
  brownies: ['cookies', 'snacks', 'desserts'],
  cakes: ['cookies', 'brownies'],
  desserts: ['cookies', 'brownies'],
  snacks: ['cookies', 'nuts & seeds', 'muesli', 'chutney powders'],
  muesli: ['snacks', 'cookies', 'atta & flours'],
  'atta & flours': ['dosa & batter mixes', 'muesli', 'chutney powders'],
  'dosa & batter mixes': ['chutney powders', 'atta & flours', 'muesli'],
  'chutney powders': ['dosa & batter mixes', 'atta & flours', 'snacks'],
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
