// =====================================================================
// PRODUCT CONTENT — keyed by SKU code (MT-000001, NS-000001 …).
//
// Prices, MRP, pack size and stock come live from the database
// (storefront_catalogue). This file holds only what the database doesn't:
// the words, photos and label information for each product page.
//
// A new SKU created in the ops app appears on the site automatically. Add an
// entry here to give it its own words; until then its page shows clear
// "content needed" notes. Write each description individually: what makes
// THIS product distinctive, never the same paragraph with the name changed.
//
// LEGAL: the ingredients list, allergens, nutrition table, veg/non-veg mark
// and best-before must match the printed pack label (FSSAI Labelling &
// Display Regulations 2020). Everything below that is not yet confirmed is
// flagged placeholder(…) or draft(…).
// =====================================================================
import { draft, placeholder, type Copy } from './site';

export type Dietary = 'veg' | 'non-veg' | 'unconfirmed';

export interface Nutrition {
  basis: string;               // e.g. 'per 100 g'
  rows: [label: string, value: string][];
}

/** The mandatory FSSAI nutrition rows, shown as "—" until supplied. */
export const NUTRITION_ROWS = [
  'Energy (kcal)', 'Protein (g)', 'Carbohydrate (g)', 'of which total sugars (g)', 'of which added sugars (g)',
  'Total fat (g)', 'of which saturated fat (g)', 'of which trans fat (g)', 'Cholesterol (mg)', 'Sodium (mg)',
];

export interface ProductContent {
  /** Point several pack sizes at one entry, e.g. NS-000002 → NS-000001 */
  sameAs?: string;
  /** One line under the title. */
  tagline?: Copy;
  /** A concise, appealing introduction (2–3 sentences). */
  intro?: Copy;
  /** What goes into it and why. */
  ingredientStory?: Copy;
  /** Mia Torte: flavour & texture. Nutri Sampoorna: preparation. */
  experience?: Copy;
  experienceLabel?: string;
  /** Short tasting notes (Mia Torte) or "good for" uses (Nutri Sampoorna). */
  notes?: string[];
  notesLabel?: string;
  serving?: Copy;
  // ---- label information
  ingredientsList?: Copy;
  allergens?: Copy;
  dietary?: Dietary;
  nutrition?: Nutrition;
  storage?: Copy;
  shelfLife?: Copy;
  /** Image ids from src/content/images.ts; the first is the main photo. */
  images?: string[];
  featured?: boolean;
}

export const products: Record<string, ProductContent> = {
  // ---------------------------------------------------------------- Mia Torte
  'MT-000001': {
    tagline: 'Golden at the edge, yielding at the heart.',
    intro: draft('Our interpretation of a classic. A buttery, brown-sugar dough is baked until the edges turn golden and crisp while the centre stays soft, with generous pieces of dark chocolate running all the way through.'),
    ingredientStory: draft('Three things matter most here. Butter, for its depth and the gentle caramel note it gives the dough. Brown sugar, for chew and a whisper of toffee. And dark chocolate in pieces rather than uniform chips, so that every bite is a little different: a shard here, a soft pool there. A pinch of salt draws it all together.'),
    experienceLabel: 'Flavour & texture',
    experience: draft('A crisp, golden rim gives way to a tender, almost fudgy centre. The chocolate is bittersweet rather than sugary, and the finish is long and buttery.'),
    notesLabel: 'Tasting notes',
    notes: ['Golden, crisp edges', 'Soft, tender centre', 'Bittersweet chocolate', 'A whisper of toffee'],
    serving: 'Best at room temperature, with a strong coffee or a cup of Darjeeling. For a just-baked softness, warm one for a few minutes in a low oven.',
    ingredientsList: placeholder('Full ingredients list, in descending order of weight, to be supplied from the recipe (including the composition of the chocolate and any emulsifiers or raising agents).'),
    allergens: placeholder('Contains wheat (gluten) and milk. Egg, nuts and soy to be confirmed from the recipe and kitchen.'),
    dietary: 'unconfirmed',
    storage: 'Keep in an airtight container in a cool, dry place, away from direct sunlight.',
    shelfLife: placeholder('Best before: to be confirmed (days from the date of packing).'),
    images: ['mt-cookies-choc-chip-1', 'mt-cookies-choc-chip-2', 'mt-cookies-choc-chip-3'],
    featured: true,
  },

  // ---------------------------------------------------------- Nutri Sampoorna
  'NS-000001': {
    tagline: 'The everyday atta, with a little more to say.',
    intro: draft('A multigrain atta built on whole wheat and brought to life with traditional grains and pulses. It makes rotis and parathas with more flavour, a gentle nuttiness and a soft, pliable dough.'),
    ingredientStory: draft('Whole wheat gives the blend its structure, and the soft, puffing roti every Indian kitchen expects. Around it sit grains and pulses chosen for what they bring to the plate: depth of flavour, a slightly fuller texture, a warmer colour. The exact grains and their proportions are listed on the pack.'),
    experienceLabel: 'In the kitchen',
    experience: draft('Use it as you would your usual atta. Knead with a little more water than you might expect, rest the dough for fifteen to twenty minutes and roll thin. The rotis puff well and stay soft; parathas take on a nutty crispness in ghee.'),
    notesLabel: 'Good for',
    notes: ['Rotis & phulkas', 'Parathas', 'Theplas', 'Puris'],
    serving: 'Try it in methi theplas for the tiffin box, or knead with a spoonful of curd for especially soft rotis.',
    ingredientsList: placeholder('Whole wheat flour and the other grains and pulses in the blend, in descending order of weight, with percentages: to be supplied by Torte Living.'),
    allergens: placeholder('Contains wheat (gluten). Other cereals and pulses to be confirmed against the final blend.'),
    dietary: 'veg',
    storage: 'Store in an airtight container in a cool, dry place. Always use a dry spoon.',
    shelfLife: placeholder('Best before: to be confirmed (months from the date of milling / packing).'),
    images: ['ns-atta-bowl', 'ns-atta-sack', 'pantry-grains'],
    featured: true,
  },
  'NS-000002': {
    sameAs: 'NS-000001',
    images: ['ns-atta-sack', 'ns-atta-bowl', 'pantry-grains'],
  },
};

export const FALLBACK_IMAGE = { MT: 'craft-flour-hands', NS: 'pantry-grains' } as const;

/** Resolve content for a SKU, following sameAs. */
export function contentFor(code: string, fallbackImage: string): ProductContent & { images: string[]; hasOwnContent: boolean } {
  const own = products[code];
  const shared = own?.sameAs ? products[own.sameAs] : undefined;
  const merged: ProductContent = { ...shared, ...own };
  return {
    ...merged,
    images: merged.images?.length ? merged.images : [fallbackImage],
    hasOwnContent: Boolean(own),
  };
}
