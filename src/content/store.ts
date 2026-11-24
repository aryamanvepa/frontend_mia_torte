import type { Delivery } from '../lib/api';
// =====================================================================
// THE STORE — one food store, organised around how people buy
// (Website Design Brief §3–5). La Mia Torte and Nutri Sampoorn appear as
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
  /** Small line above the page heading, e.g. the brand that owns the section. */
  eyebrow?: string;
  /** The page heading, when it should read differently from the nav title. */
  heading?: string;
  /** A short line under the heading. */
  tagline?: string;
  /** Sub-sections shown in order on the category page (when no filter is on). Products by exact name. */
  sections?: { id: string; title: string; text: string; products: string[] }[];
  /** Photos shown on the page when it has no products yet (e.g. gifting). Never products, never prices. */
  gallery?: string[];
}

/**
 * Nutri Sampoorn taglines for the client to choose from (Everyday Nourishment hero uses the first).
 * Kept to what the client states (superseeds, 6 of 12 ingredients, mix with water): no health or
 * nutrient claims (FSSAI Advertising & Claims Regulations 2018).
 */
export const nsTaglines = [
  'Eat well, even on your busiest days.',
  'Just add water. Breakfast is ready.',
  'Everyday grains, made easy.',
  'Six superseeds in your daily roti.',
  'Good food in no time, from grains you know.',
];

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
    intro: 'Millet crunches, roasted mixes, nuts, chips and millets & nuts muesli with real flavour. Better snacking. Nothing missing on taste.',
    image: 'category-snacks',
    categories: ['Snacks', 'Savouries', 'Namkeen', 'Nuts & seeds', 'Nuts', 'Seeds', 'Muesli', 'Granola'],
    empty: 'New snacks are on their way.',
  },
  {
    slug: 'everyday-nourishment',
    title: 'Everyday Nourishment',
    craving: 'Eat Well Every Day',
    kind: 'considered',
    heading: 'Nutri Sampoorn · Everyday Nourishment',
    tagline: nsTaglines[0],
    intro: 'Superseed atta blends, single grain flours and instant dosa mixes from Nutri Sampoorn, for the meals you make every day.',
    image: 'ns-atta-bowl',
    categories: ['Atta & flours', 'Atta', 'Flours', 'Grain blends', 'Dosa & batter mixes', 'Dosa mixes', 'Breakfast mixes', 'Breakfast', 'Chutney powders', 'Podis', 'Pantry'],
    sections: [
      {
        id: 'superseed-atta',
        title: 'Superseed Atta Blends',
        text: 'Of the 12 ingredients, 6 are superseeds, adding extra nutritional value to your daily roti.',
        products: ['Multigrain Superseed Atta (MGA)', 'Gluten Free Superseed Atta'],
      },
      {
        id: 'single-grain-flours',
        title: 'Single Grain Flours',
        text: 'One grain in each pack: ragi, jowar, bajra, and sattu (roasted gram flour).',
        products: ['Ragi Flour', 'Jowar Flour', 'Bajra Flour', 'Sattu (Roasted Gram Flour)'],
      },
      {
        id: 'instant-dosa-mixes',
        title: 'Instant Dosa Mixes & Chutneys',
        text: 'Just mix with water and the batter is ready. A travel hack for eating well, for busy mums and fitness enthusiasts who want good food in no time.',
        products: ['Instant Multigrain Dosa Mix', 'Instant MultiMillet Dosa Mix', 'Instant Pesarattu Dosa Mix', 'Instant Peanut Putana Chutney'],
      },
    ],
    empty: 'New pantry staples are on their way.',
  },
  {
    slug: 'gifting-discovery',
    title: 'Gifting & Discovery',
    craving: 'Discover & Gift',
    kind: 'sensory',
    intro: 'Festive hampers and gift boxes of our treats, snacks and pantry favourites, wrapped in gold for the season.',
    image: 'gift-hamper-6',
    categories: ['Gifting', 'Gift boxes', 'Hampers', 'Bundles', 'Trial packs', 'Seasonal'],
    gallery: ['gift-hamper-1', 'gift-hamper-4', 'gift-hamper-2', 'gift-hamper-5', 'gift-hamper-3', 'gift-hamper-6'],
    empty: 'Our festive hampers and gift boxes aren’t on the online shop yet. Here is a look at this season’s.',
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
  intro: 'Everything in the store: treats, better snacks and everyday staples, from La Mia Torte and Nutri Sampoorn.',
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
      { title: 'Crunch first', text: 'Millet crunches, bean mixes, trail mix, vegetable chips and millets & nuts muesli, made for a proper crunch.' },
      { title: 'Big, bold flavour', text: 'Peri peri, pudina, masala, or simply salted: flavours you will want to come back to.' },
      { title: 'Better ingredients behind it', text: 'Built on millets, nuts, beans and seeds.' },
    ],
    /** Lifestyle photo for the feature (images.ts id). Until it exists, a product illustration and a note on the shot. */
    image: 'mt-pudina-crunch-1' as string | undefined,
    shot: 'Lifestyle photograph to come: a bowl of Peri Peri Trail Mix and Pudina Millet Crunch on a tea table, hands reaching in.',
  },
  treats: { eyebrow: 'Indulgence & Treats', title: 'Something to savour.', cta: 'Shop treats' },
  nourishment: {
    eyebrow: 'Nutri Sampoorn · Everyday Nourishment',
    title: nsTaglines[0],
    text: 'Superseed atta blends, single grain flours, and instant dosa mixes that need only water. Staples for the meals you make every day.',
  },
  discoveries: { eyebrow: 'New & seasonal', title: 'New on the shelf' },
  gifting: {
    eyebrow: 'Gifting',
    title: 'Made for sharing.',
    text: 'Festive hampers and gift boxes of our treats, snacks and pantry favourites, wrapped in gold for the season.',
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

/** The Everyday Nourishment (Nutri Sampoorn) sub-sections, shown as quick links on the home page. */
export const nourishmentSections = storeCategories.find((c) => c.slug === 'everyday-nourishment')!.sections!;

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
