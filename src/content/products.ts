// =====================================================================
// PRODUCT CONTENT — keyed by PRODUCT NAME, exactly as the "product" field in
// the ops app (e.g. 'Fruit & Nut Muesli'). Every pack size of a product
// (140 g jar, 250 g pouch …) shares one entry.
//
// Prices, MRP, pack sizes and stock come live from the database
// (storefront_catalogue). This file holds only what the database doesn't:
// the words, photos and label information for each product page.
//
// A new product created in the ops app appears on the site automatically,
// with an illustrated placeholder and clear "content needed" notes. Add an
// entry here to give it its own words. Write each description individually:
// what makes THIS product distinctive, never the same paragraph with the name
// changed.
//
// WHAT IS SAFE TO SAY: the copy below is written only from what each product
// name tells us. Anything that states a fact about the recipe or texture is
// wrapped in draft(…) and shows a "Draft · confirm" tag until Torte Living
// confirms it. No ingredient, health or nutrition claims are made.
//
// LEGAL: the ingredients list, allergens, nutrition table, veg/non-veg mark
// and best-before must match the printed pack label (FSSAI Labelling &
// Display Regulations 2020). They are placeholder(…) until supplied.
//
// PHOTOS: products without photographs show an illustrated placeholder
// (src/components/PackArt.tsx). Add photo ids to `images` in this order:
// 1 the pack (cards, search, link previews), 2 a close-up of the food,
// 3 a serving or lifestyle shot (see docs/photography-brief.md).
// =====================================================================
import { draft, placeholder, testValue, type Copy } from './site';
import { TEST_LABELS, testLabels } from './test-labels';

/** 'egg' is shown as non-vegetarian, as FSSAI requires. Only ever set from the ops app's `diet`, never guessed. */
export type Dietary = 'veg' | 'vegan' | 'egg' | 'non-veg' | 'unconfirmed';

export interface Nutrition {
  basis: string;               // e.g. 'per 100 g'
  rows: [label: string, value: string][];
}

/** The mandatory FSSAI nutrition rows, shown as "—" until supplied. */
export const NUTRITION_ROWS = [
  'Energy (kcal)', 'Protein (g)', 'Carbohydrate (g)', 'of which total sugars (g)', 'of which added sugars (g)',
  'Total fat (g)', 'of which saturated fat (g)', 'of which trans fat (g)', 'Cholesterol (mg)', 'Sodium (mg)',
];

/** Ops-app nutrition keys → table rows. Mandatory rows always show ("—" if missing); dietary fibre only when given. */
export const NUTRITION_KEYS: [key: string, label: string, mandatory: boolean][] = [
  ['energy_kcal', 'Energy (kcal)', true],
  ['protein_g', 'Protein (g)', true],
  ['carbohydrate_g', 'Carbohydrate (g)', true],
  ['total_sugars_g', 'of which total sugars (g)', true],
  ['added_sugars_g', 'of which added sugars (g)', true],
  ['fibre_g', 'Dietary fibre (g)', false],
  ['fat_g', 'Total fat (g)', true],
  ['saturated_fat_g', 'of which saturated fat (g)', true],
  ['trans_fat_g', 'of which trans fat (g)', true],
  ['cholesterol_mg', 'Cholesterol (mg)', true],
  ['sodium_mg', 'Sodium (mg)', true],
];

export interface ProductContent {
  /**
   * The short description on product cards and under the product name (Brief §5 iteration 2):
   * a sensory hook, then a plain statement of what the product is. Two short sentences.
   * Written from the product name and category only: Torte Living to confirm.
   */
  summary?: string;
  /** Considered products: what it tastes like, in a few words (shown in "At a glance"). */
  taste?: string;
  /** One line under the title. */
  tagline?: string;
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
  /** The veg mark came from the ops app but isn't confirmed yet. */
  dietaryDraft?: boolean;
  nutrition?: Nutrition & { draft?: boolean; test?: boolean };
  storage?: Copy;
  shelfLife?: Copy;
  /** Real product photo ids from src/content/images.ts; the first is the main photo. Empty = illustrated placeholder. */
  images?: string[];
  /** Shown first on the home page and in the shop. */
  featured?: boolean;
}

// ---------------------------------------------------------------- label defaults (every product until supplied)
const LABEL: ProductContent = {
  ingredientsList: placeholder('Full ingredients list, in descending order of weight, as printed on the pack.'),
  allergens: placeholder('Allergen declaration, as printed on the pack.'),
  dietary: 'unconfirmed',
  shelfLife: placeholder('Best before, as printed on the pack.'),
};

// ---------------------------------------------------------------- defaults by ops-app category
const BY_CATEGORY: Record<string, ProductContent> = {
  cookies: {
    experienceLabel: 'Flavour & texture', notesLabel: 'Tasting notes',
    storage: draft('Keep in an airtight container in a cool, dry place, away from direct sunlight.'),
  },
  muesli: {
    experienceLabel: 'Flavour & texture', notesLabel: 'Good with',
    storage: draft('Store in a cool, dry place. Close the jar or reseal the pouch after every use.'),
  },
  snacks: {
    experienceLabel: 'Flavour & texture', notesLabel: 'Tasting notes',
    storage: draft('Store in a cool, dry place. Reseal after opening to keep the crunch.'),
  },
  'atta & flours': {
    experienceLabel: 'In the kitchen', notesLabel: 'Good for',
    storage: draft('Store in an airtight container in a cool, dry place. Always use a dry spoon.'),
  },
  'dosa & batter mixes': {
    experienceLabel: 'In the kitchen', notesLabel: 'Good for',
    experience: draft('Whisk the mix with water as directed on the pack, then pour a ladleful onto a hot, lightly oiled tawa and spread it in quick circles from the centre outwards. Cook until golden and crisp at the edges.'),
    storage: draft('Store in an airtight container in a cool, dry place. Always use a dry spoon.'),
  },
  'chutney powders': {
    experienceLabel: 'In the kitchen', notesLabel: 'Good for',
    storage: draft('Store in an airtight container in a cool, dry place. Always use a dry spoon.'),
  },
};

// ---------------------------------------------------------------- products
export const products: Record<string, ProductContent> = {
  // ============================================================ MIA TORTE · Cookies
  'Classic Chocolate Chip': {
    experience: draft('Crisp at the edge, soft towards the middle, with pools of chocolate through every bite.'),
    notes: ['Golden edges', 'Soft centre', 'Chocolate chunks'],
    summary: 'Golden, crisp edges and a soft centre, generous with the chocolate. Our classic chocolate chip cookie.',
    tagline: 'The one everything else is measured against.',
    intro: draft('Our take on the cookie everyone knows by heart: golden, generous and studded with chocolate. Simple to describe, and the hardest thing in the world to get exactly right.'),
    serving: 'With a glass of cold milk, or a strong coffee at four o’clock.',
    featured: true,
    images: ['test-classic-choc-chip'],
  },
  'Mocha Me Happy': {
    experience: draft('Roasted, slightly bitter coffee up front, then rounded off by dark chocolate. Rich rather than sweet.'),
    notes: ['Roasted coffee', 'Dark chocolate', 'Rich finish'],
    summary: 'Roasted coffee and deep, dark chocolate. A mocha cookie for coffee lovers.',
    tagline: 'Coffee and chocolate, in one good mood.',
    intro: draft('For people who take their coffee seriously and their chocolate even more so. Mocha brings the two together: the roasted bitterness of coffee, rounded by the depth of cocoa.'),
    serving: 'Alongside an espresso, or crumbled over vanilla ice cream.',
    images: ['test-mocha'],
  },
  'Red Velvet Melt': {
    experience: draft('A soft, tender bite with a gentle cocoa note and a creamy sweetness that lingers.'),
    notes: ['Gentle cocoa', 'Soft bite', 'Creamy sweetness'],
    summary: 'Soft, gently cocoa and unmistakably red. A red velvet cookie made to melt in the mouth.',
    tagline: 'A celebration cake, reimagined as a cookie.',
    intro: draft('Red velvet has always been the most theatrical of cakes. Here its colour and its gentle cocoa character move into a cookie made, as the name suggests, to melt.'),
    serving: 'For birthdays, for gifting, or for no particular reason at all.',
    images: ['test-red-velvet'],
  },
  'Nutella Brownie Bliss': {
    experience: draft('Dense and fudgy like a brownie, with the hazelnut-chocolate sweetness of Nutella running through.'),
    notes: ['Fudgy', 'Hazelnut', 'Deep chocolate'],
    summary: 'Fudgy, rich and full of hazelnut chocolate. A brownie-style cookie made with Nutella.',
    tagline: 'Where the cookie meets the brownie.',
    intro: draft('Two great chocolate pleasures in a single bake: the fudgy richness of a brownie and the hazelnut-chocolate sweetness of Nutella, in cookie form.'),
    serving: 'With a cold glass of milk, or warmed for a few seconds and served with a scoop of ice cream.',
    images: ['test-nutella-brownie'],
  },
  'Carrot Crème Melt': {
    experience: draft('Soft and warmly spiced, like carrot cake, with a creamy finish.'),
    notes: ['Warm spice', 'Carrot cake', 'Creamy finish'],
    summary: 'Warm carrot-cake flavour with a creamy finish. A soft cookie inspired by carrot cake.',
    tagline: 'The comfort of carrot cake, in your hand.',
    intro: draft('Inspired by the carrot cake and its creamy finish, and reimagined as a cookie. Comforting, a little nostalgic, and made for afternoon tea.'),
    serving: 'With a pot of Darjeeling, or a milky cup of chai.',
    images: ['test-carrot-creme'],
  },
  'Biscoff Indulgence': {
    experience: draft('Caramelised, toasty Biscoff flavour, with a buttery richness that makes one never quite enough.'),
    notes: ['Caramelised', 'Toasty', 'Buttery'],
    summary: 'Deep caramelised Biscoff flavour in every bite. A rich cookie for Biscoff lovers.',
    tagline: 'Caramelised, and entirely unapologetic.',
    intro: draft('Built around the much-loved caramelised flavour of Biscoff, this is a cookie for those who believe a little more is always the right amount.'),
    serving: 'With a flat white, or crumbled over a bowl of vanilla ice cream.',
    featured: true,
    images: ['test-biscoff'],
  },
  'Berry Nutty About Pista': {
    experience: draft('Tart, bright berries against the rounded, nutty richness of pistachio, with a crumbly bite.'),
    notes: ['Bright berries', 'Pistachio', 'Crumbly'],
    summary: 'Bright berries against rich, green pistachio. A colourful cookie of fruit and nuts.',
    tagline: 'Bright berries, green pistachio, good company.',
    intro: draft('A cookie of contrasts: the brightness of berries against the rounded richness of pistachio. As pretty to look at as it is to eat.'),
    serving: 'Made for a gift box, or for the moment you finally sit down.',
    images: ['test-pista'],
  },
  'Jowar Jeera Delight (8 nos.)': {
    experience: draft('Crisp and lightly savoury, with the warm, toasted note of cumin. Not too sweet, which is what makes it so good with tea.'),
    notes: ['Crisp', 'Toasted cumin', 'Lightly savoury'],
    summary: 'Crisp, savoury and warm with cumin. Jowar (sorghum) biscuits for tea time, eight to a pack.',
    tagline: 'Made for the chai hour.',
    intro: draft('Jowar, the sorghum of the Deccan, and jeera, the cumin seed of every Indian kitchen, meet in a biscuit made for tea time. Eight to a pack, for sharing (or not).'),
    serving: 'With masala chai, or a tumbler of filter coffee.',
    images: ['test-jowar-jeera'],
  },

  // ============================================================ MIA TORTE · Muesli
  'Fruit & Nut Muesli': {
    experience: draft('Crunchy toasted grains, the bite of nuts and little bursts of chewy dried fruit. It stays crunchy in milk for longer than you would expect.'),
    summary: 'Toasted grains, nuts and dried fruit with a satisfying crunch. A classic muesli for milk or yoghurt.',
    tagline: 'A generous bowl to begin the day.',
    intro: draft('Our classic muesli: fruit and nuts in good measure, for a breakfast that feels considered rather than rushed.'),
    serving: 'With cold milk or yoghurt, a few slices of seasonal fruit, and a little time to enjoy it.',
    notes: ['Cold milk', 'Thick curd or yoghurt', 'Fresh seasonal fruit'],
    featured: true,
    images: ['mt-fruit-nut-muesli-1'],
  },
  'Nutty Mango Millets & Nuts Muesli': {
    experience: draft('Sweet, sunny mango over crunchy millets and nuts. Fruity rather than sugary, with plenty of crunch.'),
    summary: 'Sunny mango with crunchy millets and nuts. A fruity millet muesli for a bright start to the day.',
    tagline: 'Summer, in a breakfast bowl.',
    intro: draft('Mango, the fruit India waits for all year, brings its sunny sweetness to a muesli of millets and nuts. A breakfast with a sense of occasion.'),
    serving: 'Spoon over thick curd or Greek yoghurt; mango loves something a little tangy.',
    notes: ['Thick curd', 'Greek yoghurt', 'Cold milk'],
    images: ['mt-mango-muesli-1'],
  },
  'Nutty Orange Millets & Nuts Muesli': {
    experience: draft('Fresh, zesty orange lifting a crunchy base of millets and nuts. Bright and clean on the palate.'),
    summary: 'Zesty orange with crunchy millets and nuts. A citrusy millet muesli to wake up to.',
    tagline: 'Bright, zesty and wide awake.',
    intro: draft('Orange lifts this blend of millets and nuts with a clean, citrus brightness: a muesli for mornings that need a little encouragement.'),
    serving: 'With cold milk, or over yoghurt with a drizzle of honey.',
    notes: ['Cold milk', 'Yoghurt and honey', 'A breakfast parfait'],
    images: ['test-orange-muesli'],
  },
  'Crunchy Strawberry Millets & Nuts Muesli': {
    experience: draft('Sweet strawberry and a big, satisfying crunch from millets and nuts. A bowl that tastes as cheerful as it looks.'),
    summary: 'Sweet strawberry and a big crunch, over millets and nuts. A colourful millet muesli for milk or yoghurt.',
    tagline: 'A little sweetness, a lot of crunch.',
    intro: draft('Strawberry and a satisfying crunch, with millets and nuts beneath. The breakfast bowl at its most cheerful.'),
    serving: 'With chilled milk, or layered with yoghurt in a glass for a breakfast parfait.',
    notes: ['Chilled milk', 'Layered with yoghurt', 'Straight from the jar'],
    images: ['mt-strawberry-muesli-1'],
  },

  // ============================================================ MIA TORTE · Savoury snacks
  'Peri Peri Vegie Chips': {
    experience: draft('Thin, crisp vegetable chips with a tangy peri peri heat that builds as you go.'),
    notes: ['Crisp', 'Tangy heat', 'Moreish'],
    summary: 'Crunchy vegetable chips with a bold, tangy peri peri kick. A savoury snack with some heat.',
    tagline: 'Bright heat, serious crunch.',
    intro: draft('Vegetable chips with the fiery, tangy warmth of peri peri. For the evening hour, the long drive, and anyone who likes a snack with some personality.'),
    serving: 'Tip into a bowl for the table, with something cold to drink.',
    images: ['test-veg-chips'],
  },
  'Pudina Millet Crunch': {
    experience: draft('A light, crunchy millet bite with a cool, fresh mint finish. Savoury and clean, never heavy.'),
    notes: ['Cool mint', 'Light crunch', 'Savoury'],
    summary: 'Cool mint on crisp, crunchy millet. A savoury millet snack for tea time.',
    tagline: 'Cool mint, crisp millet.',
    intro: draft('Pudina, the mint of Indian chutneys and chaas, brings its cool lift to a crunchy millet snack. A tea-time companion with a clean, green finish.'),
    serving: 'With evening chai, or alongside a glass of chilled chaas.',
    featured: true,
    images: ['test-pudina-crunch'],
  },
  'Salted Nuts & Bean Crunch': {
    experience: draft('Crunchy nuts and beans with just enough salt to bring out their toasty flavour.'),
    notes: ['Toasty', 'Lightly salted', 'Big crunch'],
    summary: 'Crunchy nuts and beans, simply salted. A moreish savoury mix for sharing, or not.',
    tagline: 'Simply salted. Seriously moreish.',
    intro: draft('Nuts and crunchy beans, simply salted. The kind of snack that disappears from the bowl before anyone quite notices.'),
    serving: 'Set out a bowl when friends come over, or keep a jar on your desk.',
    images: ['test-salted-nuts'],
  },
  'Peri Peri Trail Mix': {
    experience: draft('A crunchy mix with a tangy, smoky peri peri coating and a little heat on the finish.'),
    notes: ['Tangy', 'A little heat', 'Crunchy mix'],
    summary: 'Bold peri peri seasoning on a crunchy trail mix. Savoury, with a little heat.',
    tagline: 'For the road, the trail and the desk drawer.',
    intro: draft('A trail mix with a spark: crunchy bites tossed in peri peri, for a gentle heat and a tangy finish.'),
    serving: 'Pack a handful for the commute, the trek or the long afternoon.',
    images: ['test-trail-mix'],
  },
  'Masala Protein Bean Mix': {
    experience: draft('Crunchy beans with a warm, savoury masala: chatpata, a little spicy and very hard to stop eating.'),
    notes: ['Warm masala', 'Chatpata', 'Crunchy beans'],
    summary: 'Crunchy beans tossed in warm Indian masala. A savoury, spiced bean snack.',
    tagline: 'Masala-spiced and full of crunch.',
    intro: draft('Crunchy beans tossed in a warm Indian masala: a savoury snack for the hours between meals.'),
    serving: 'With a cup of tea, or squeezed with lemon and tossed with chopped onion and coriander for a quick chaat.',
    images: ['test-masala-bean'],
  },

  // ============================================================ NUTRI SAMPOORNA · Atta & flours
  'Multigrain Superseed Atta (MGA)': {
    summary: 'Soft rotis with a gentle, nutty depth. A multigrain atta blended with seeds, for everyday rotis and parathas.',
    taste: 'Mild and gently nutty, a little deeper than plain wheat atta',
    tagline: 'The everyday atta, with a little more to say.',
    intro: draft('Our multigrain atta, blended with seeds. Rotis and parathas take on a deeper colour, a gentle nuttiness and a little more character at the table.'),
    experience: draft('Use it as you would your usual atta. Knead to a soft dough, rest it for fifteen minutes and roll evenly; cook on a hot tawa and finish over the flame.'),
    notes: ['Rotis & phulkas', 'Parathas', 'Theplas', 'Puris'],
    serving: 'Knead with a spoonful of curd for especially soft rotis, or add chopped methi for tiffin-box theplas.',
    featured: true,
    images: ['test-mga', 'test-roti'],
  },
  'Gluten Free Superseed Atta': {
    summary: 'Earthy, nutty flatbreads. A gluten-free seeded atta for rotis, bhakris and cheelas.',
    taste: 'Earthy and nutty, with a rustic texture',
    tagline: 'A seeded atta for a different kind of roti.',
    intro: draft('A seeded atta made for kitchens that cook without gluten. Expect a more rustic dough, and flatbreads with an earthy, nutty character.'),
    experience: draft('Doughs without gluten behave differently. Knead with warm water, keep the dough soft, and pat or roll it gently between two sheets of parchment before it goes on the tawa.'),
    notes: ['Rotis & bhakris', 'Thalipeeth', 'Cheelas'],
    serving: 'Serve hot with ghee, a bowl of dal and something pickled.',
    images: ['test-gf-atta'],
  },
  'Ragi Flour': {
    experience: draft('For rotis, mix with hot water and knead while warm; the dough comes together more easily that way. For dosas, combine with rice flour and buttermilk and rest the batter for fifteen minutes. For porridge, whisk two spoons into cold water first, then cook on a low flame, stirring, until thick.'),
    summary: 'Earthy and faintly malty. Finger millet flour for mudde, dosas, rotis and porridge.',
    taste: 'Earthy and faintly malty',
    tagline: 'Earthy, malty and deeply Indian.',
    intro: draft('Ragi, or finger millet, milled into flour. Earthy and faintly malty, it is the grain behind Karnataka’s ragi mudde and countless South Indian breakfasts.'),
    notes: ['Ragi mudde', 'Dosa & idli', 'Rotis', 'Porridge'],
    serving: 'Stir into hot water with jaggery and a pinch of cardamom for a simple ragi porridge, or mix with rice flour for crisp ragi dosas.',
    featured: true,
    images: ['test-ragi'],
  },
  'Bajra Flour': {
    experience: draft('Knead small batches with warm water just before cooking; bajra dough dries quickly. Pat each rotla between your palms or on a wet cloth, cook on a hot tawa, and finish over the flame until it puffs.'),
    summary: 'Robust and nutty. Pearl millet flour for rotlas, theplas and winter flatbreads.',
    taste: 'Robust and nutty',
    tagline: 'The winter grain of the north-west.',
    intro: draft('Bajra, or pearl millet, milled into flour. Robust and nutty, it is the grain of the Rajasthani and Gujarati winter rotla, eaten warm with white butter and jaggery.'),
    notes: ['Bajra rotla', 'Theplas', 'Thalipeeth'],
    serving: 'Pat rotlas by hand with warm water, cook on a hot tawa, and serve with garlic chutney and a spoon of white butter.',
    images: ['test-bajra'],
  },
  'Jowar Flour': {
    experience: draft('Knead with hot water to a soft, smooth dough. Pat or roll the bhakris gently, cook on a hot tawa, brushing the top with a little water, and turn once to finish.'),
    summary: 'Mild and gently sweet. Sorghum flour for soft bhakris, rotis and dosas.',
    taste: 'Mild and gently sweet',
    tagline: 'Mild, gentle and endlessly useful.',
    intro: draft('Jowar, or sorghum, milled into flour. Mild and gently sweet, it has been the everyday flatbread grain of the Deccan for generations.'),
    notes: ['Jowar bhakri', 'Rotis', 'Thalipeeth', 'Dosa'],
    serving: 'Knead with hot water for soft bhakris, and serve with pitla, thecha or a simple dal.',
    images: ['test-jowar'],
  },
  'Sattu (Roasted Gram Flour)': {
    experience: draft('Sattu is already roasted, so it needs no cooking for drinks: whisk it into water or buttermilk. For parathas and litti, mix it with chopped onion, garlic, green chilli, lemon, mustard oil and salt to make the filling.'),
    summary: 'Toasty and versatile. Roasted gram flour for summer sharbat, litti and stuffed parathas.',
    taste: 'Toasty, like roasted chana',
    tagline: 'Bihar’s quiet pantry hero.',
    intro: draft('Sattu is roasted gram, milled into a fine, toasty flour. In Bihar and eastern Uttar Pradesh it has long been a summer drink, a stuffing and a meal in itself.'),
    notes: ['Sattu sharbat', 'Litti', 'Sattu parathas', 'Laddoos'],
    serving: 'For a summer sharbat, whisk two spoons into cold water with lemon, roasted jeera, salt, and a little chopped onion and mint.',
    images: ['test-sattu'],
  },

  // ============================================================ NUTRI SAMPOORNA · Dosa mixes
  'Instant MultiMillet Dosa Mix': {
    summary: 'Crisp, golden millet dosas without the overnight soak. An instant millet dosa mix: whisk with water and pour.',
    taste: 'Crisp and lightly earthy',
    tagline: 'Millet dosas, on a weekday.',
    intro: draft('A dosa mix built on millets, ready without the overnight soak and grind. Pour, spread and crisp: a millet breakfast in the time it takes to heat the tawa.'),
    notes: ['Crisp dosas', 'Weekday breakfasts', 'Tiffin boxes'],
    serving: 'With coconut chutney and sambar, or a spoon of podi and a drizzle of ghee.',
    images: ['test-multimillet-dosa'],
  },
  'Instant Pesarattu Dosa Mix': {
    summary: 'Thin, crisp green gram dosas, the Andhra way. An instant pesarattu mix with no soaking or grinding.',
    taste: 'Savoury, with the fresh green note of moong',
    tagline: 'Andhra’s green gram dosa, made easy.',
    intro: draft('Pesarattu is the green gram dosa of Andhra Pradesh: thin, crisp and savoury. This mix brings it to the weekday table without the soaking and grinding.'),
    notes: ['Pesarattu', 'MLA pesarattu with upma', 'Weekend brunch'],
    serving: 'Serve it the Andhra way, with ginger chutney, or fold a spoonful of upma inside for the classic MLA pesarattu.',
    featured: true,
    images: ['test-pesarattu'],
  },
  'Instant Multigrain Dosa Mix': {
    summary: 'Golden, crisp dosas with more grains in every one. An instant multigrain dosa mix for busy mornings.',
    taste: 'Crisp and wholesome, close to a classic dosa',
    tagline: 'A dosa with more grains to its name.',
    intro: draft('A multigrain take on the everyday dosa, ready to pour without the overnight soak. Golden, crisp and made for busy mornings.'),
    notes: ['Crisp dosas', 'Weekday breakfasts', 'Tiffin boxes'],
    serving: 'With coconut chutney, or our Instant Peanut Putana Chutney mixed with a little oil.',
    images: ['test-multigrain-dosa'],
  },

  // ============================================================ NUTRI SAMPOORNA · Chutney powders
  'Instant Peanut Putana Chutney': {
    summary: 'Nutty, roasted and savoury. A peanut and roasted gram chutney powder for idli, dosa and hot rice.',
    taste: 'Nutty and roasted, with a gentle heat',
    tagline: 'The companion every dosa deserves.',
    intro: draft('A chutney powder of peanuts and putana, the roasted gram dal of South Indian kitchens. Keep it by the stove, and the simplest meal has a companion.'),
    experience: draft('Use it dry, sprinkled like a podi, or mix it with a little oil, curd or water for a quick chutney. The pack gives the suggested proportions.'),
    notes: ['Idli & dosa', 'Hot rice with ghee', 'Upma'],
    serving: 'Mix with a spoon of sesame oil or ghee and serve with idli and dosa, or stir through hot rice.',
    featured: true,
    images: ['test-peanut-chutney'],
  },
};

/** TEST ONLY: made-up label values (src/content/test-labels.ts) in place of the "to be supplied" placeholders. */
function testLabelFor(product: string): ProductContent {
  const t = TEST_LABELS ? testLabels[product] : undefined;
  if (!t) return {};
  const keys: [string, string][] = [['Energy (kcal)', ''], ['Protein (g)', ''], ['Carbohydrate (g)', ''], ['of which total sugars (g)', ''], ['of which added sugars (g)', ''],
    ['Dietary fibre (g)', ''], ['Total fat (g)', ''], ['of which saturated fat (g)', ''], ['of which trans fat (g)', ''], ['Cholesterol (mg)', ''], ['Sodium (mg)', '']];
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  return {
    ingredientsList: testValue(t.ingredients),
    allergens: testValue(t.allergens),
    dietary: t.diet,
    dietaryDraft: true,
    shelfLife: testValue(`${t.shelfLifeDays} days from the date of packing`),
    nutrition: { basis: 'per 100 g', draft: false, test: true, rows: keys.map(([label], i) => [label, fmt(t.n[i])]) },
  };
}

/** Resolve content for a product: label defaults, then its category's defaults, then (testing) test label data, then its own entry. */
export function contentFor(product: string, category: string | null | undefined): ProductContent & { images: string[]; hasOwnContent: boolean } {
  const own = products[product];
  const cat = BY_CATEGORY[(category ?? '').trim().toLowerCase()];
  const merged: ProductContent = { ...LABEL, ...cat, ...testLabelFor(product), ...own };
  return { ...merged, images: merged.images ?? [], hasOwnContent: Boolean(own) };
}
