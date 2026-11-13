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
import { draft, type Copy } from './site';

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
 * Shown until the backend's delivery check (PIN serviceability and estimated delivery) is live;
 * after that the server's answer is used. The figures are placeholders for Torte Living to confirm.
 */
export const deliveryFallback = {
  local: { label: 'Hyderabad', test: (pin: string) => /^50[0-2]\d{3}$/.test(pin), eta: '1–2 days', carrier: 'local delivery' },
  national: { eta: '3–7 days', carrier: 'courier' },
  note: draft('Estimated delivery: Hyderabad 1–2 days, rest of India 3–7 days, from dispatch. To be confirmed by Torte Living.') as Copy,
};
