// =====================================================================
// PRODUCT CONTENT — keyed by SKU code (MT-000001, NS-000001 …).
//
// Prices, stock and names come live from the database (storefront_catalogue).
// This file holds only what the database doesn't: copy, photos, tasting notes,
// ingredients and allergens. A new SKU added in the ops app appears on the
// site automatically; add an entry here to give it its own words and photos
// (until then it uses its category's photo and a "details coming soon" note).
//
// Ingredients and allergens below are PLACEHOLDERS and must be confirmed by
// Torte Living from the actual recipes/labels before launch (FSSAI labelling).
// =====================================================================
import { placeholder, type Copy } from './site';

export interface ProductContent {
  /** Shared copy: point several pack sizes at one entry, e.g. NS-000002 → NS-000001 */
  sameAs?: string;
  tagline?: Copy;
  description?: Copy;
  /** Mia Torte: tasting notes. Nutri Sampoorna: highlights. */
  notes?: string[];
  ingredients?: Copy;
  allergens?: Copy;
  storage?: Copy;
  /** Image ids from src/content/images.ts, first one is the main photo */
  images?: string[];
  featured?: boolean;
}

export const products: Record<string, ProductContent> = {
  'MT-000001': {
    tagline: 'Crisp at the edge, soft at the heart.',
    description: placeholder(
      'Our everyday indulgence: brown-butter dough rested overnight, generous with dark chocolate, baked until the edges turn golden and the centres stay soft. Packed by hand in a 200 g box.',
    ),
    notes: ['Brown butter', 'Dark chocolate', 'A whisper of sea salt'],
    ingredients: placeholder('Refined wheat flour, butter, brown sugar, dark chocolate, eggs, vanilla, salt, raising agent. (To be confirmed from the recipe.)'),
    allergens: placeholder('Contains wheat (gluten), milk and egg. Made in a kitchen that also handles nuts and soy. (To be confirmed.)'),
    storage: placeholder('Store in an airtight container in a cool, dry place. Best within 7 days of opening.'),
    images: ['mt-cookies-choc-chip-1', 'mt-cookies-choc-chip-2', 'mt-cookies-choc-chip-3'],
    featured: true,
  },
  'NS-000001': {
    tagline: 'Seven grains, one honest flour.',
    description: placeholder(
      'A wholesome multigrain atta for soft, nourishing rotis and parathas every day. Whole wheat blended with other whole grains and millets, milled for a fine, even texture.',
    ),
    notes: ['High in fibre', 'Soft rotis', 'No maida'],
    ingredients: placeholder('Whole wheat, and other grains/millets in proportions to be confirmed by Torte Living.'),
    allergens: placeholder('Contains wheat (gluten). Processed in a facility that also handles other cereals. (To be confirmed.)'),
    storage: placeholder('Store in a cool, dry place in an airtight container. Use within 2 months of opening.'),
    images: ['ns-atta-bowl', 'ns-atta-sack', 'pantry-grains'],
    featured: true,
  },
  'NS-000002': {
    sameAs: 'NS-000001',
    images: ['ns-atta-sack', 'ns-atta-bowl', 'pantry-grains'],
  },
};

// Used for any SKU without its own entry (and for category tiles).
export const categories: Record<string, { image: string; line: string }> = {
  Cookies: { image: 'mt-cookies-choc-chip-3', line: 'Golden, generous, made in small batches.' },
  Brownies: { image: 'category-brownies', line: 'Dense, dark and fudgy to the last square.' },
  Cakes: { image: 'category-cakes', line: 'Layered celebration cakes and tea-time loaves.' },
  Atta: { image: 'ns-atta-bowl', line: 'Whole-grain flours for everyday cooking.' },
  'Dosa & batter mixes': { image: 'category-dosa', line: 'Ready batters and mixes for crisp, golden dosas.' },
  Snacks: { image: 'category-snacks', line: 'Wholesome savouries for the tea-time table.' },
};
export const FALLBACK_IMAGE = 'pantry-grains';

/** Resolve content for a SKU, following sameAs and falling back to category defaults. */
export function contentFor(code: string, category: string | null): ProductContent & { images: string[]; hasOwnContent: boolean } {
  const own = products[code];
  const shared = own?.sameAs ? products[own.sameAs] : undefined;
  const merged: ProductContent = { ...shared, ...own };
  const fallbackImg = (category && categories[category]?.image) || FALLBACK_IMAGE;
  return {
    ...merged,
    images: merged.images?.length ? merged.images : [fallbackImg],
    hasOwnContent: Boolean(own),
  };
}
