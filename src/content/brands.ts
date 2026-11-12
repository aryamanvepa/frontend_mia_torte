// =====================================================================
// BRAND CONTENT — Mia Torte and Nutri Sampoorna.
//
// Written to the "Website Language & Brand Positioning Brief". Each brand has
// its own voice, sections and collections. Edit the words freely; see
// ./site.ts for what placeholder(…) and draft(…) mean.
//
// COLLECTIONS map to the product "category" set in the ops app. A product
// appears in a collection when its category is listed in `categories`
// (case-insensitive). Until a collection has products, the site shows its
// `comingSoon` note instead of an empty grid.
// =====================================================================
import { draft, placeholder, type Copy } from './site';

export type BrandCode = 'MT' | 'NS';

export interface Collection {
  slug: string;
  title: string;
  categories: string[];
  image: string;
  intro: string;
  comingSoon: string;
}

export interface Section { heading: string; body: Copy }
export interface ContactBlock { heading: string; body: Copy; showContacts?: boolean }

export interface Brand {
  code: BrandCode;
  slug: string;
  name: string;
  theme: 'mt' | 'ns';
  descriptor: string;
  tagline: string;
  blurb: string;
  story: { slug: string; label: string; eyebrow: string; title: string; intro: string; image: string; sections: Section[] };
  contact: { title: string; intro: string; blocks: ContactBlock[] };
  collections: Collection[];
  shop: { title: string; intro: string };
  emptyBag: string;
}

// ------------------------------------------------------------------ MIA TORTE
export const miaTorte: Brand = {
  code: 'MT',
  slug: 'mia-torte',
  name: 'Mia Torte',
  theme: 'mt',
  descriptor: 'Boutique bakery',
  tagline: 'Little indulgences. Beautifully made.',
  blurb: 'A boutique bakery in the tradition of European pâtisserie: distinctive cookies and biscuits, mueslis and savoury snacks, with brownies, cakes and desserts to follow. Made with care, and meant to be savoured.',
  shop: {
    title: 'The counter',
    intro: 'Everything in our repertoire at the moment: cookies, mueslis and savoury snacks. A small range, by design: we would rather make a few things exceptionally well.',
  },
  emptyBag: 'Something small and beautiful, perhaps?',
  collections: [
    {
      slug: 'cookies-biscuits',
      title: 'Cookies & Biscuits',
      categories: ['Cookies', 'Biscuits'],
      image: 'chocolate-cocoa',
      intro: 'From the classic chocolate chip to red velvet, Biscoff and a jowar-and-jeera biscuit for chai: distinctive cookies, made to be lingered over with coffee, with tea, or entirely on their own.',
      comingSoon: 'New cookies and biscuits are being perfected in the kitchen. Each will appear here when it is ready, and not before.',
    },
    {
      slug: 'muesli',
      title: 'Muesli',
      categories: ['Muesli', 'Granola', 'Breakfast'],
      image: 'ns-grain-texture',
      intro: 'Our mueslis: a classic fruit and nut, and three blends of millets and nuts with mango, orange and strawberry. Breakfast, made a little more of an occasion.',
      comingSoon: 'Our mueslis are being blended and tasted. They will appear here when they are ready.',
    },
    {
      slug: 'savoury-snacks',
      title: 'Savoury Snacks',
      categories: ['Snacks', 'Savouries', 'Namkeen'],
      image: 'category-snacks',
      intro: 'For the tea hour, the long drive and the desk drawer: peri peri chips and trail mix, a pudina millet crunch, and salted and masala bean mixes.',
      comingSoon: 'Our savoury snacks are on their way from the kitchen.',
    },
    {
      slug: 'brownies-cakes',
      title: 'Brownies & Cakes',
      categories: ['Brownies', 'Cakes', 'Chocolate', 'Desserts'],
      image: 'category-brownies',
      intro: 'Dark, dense brownies, chocolate creations and cakes with real presence, alongside the speciality desserts of the moment.',
      comingSoon: 'Our brownies, cakes and chocolate creations are still in development. We are taking our time with them; they will be worth the wait.',
    },
    {
      slug: 'gifting',
      title: 'Gifting',
      categories: ['Gifting', 'Gift boxes', 'Hampers'],
      image: 'mt-gifting-box',
      intro: 'Curated boxes for people who appreciate the small pleasures. Thoughtfully assembled, beautifully presented, and made to be given.',
      comingSoon: 'Our gifting boxes are in preparation. For a gift in the meantime, or for occasion and corporate orders, write to us and we will help.',
    },
    {
      slug: 'seasonal',
      title: 'Seasonal Collections',
      categories: ['Seasonal'],
      image: 'mt-seasonal-tarts',
      intro: 'Short-lived creations that follow the calendar: the fruit of the moment, the festivals of the year, the flavours that belong to a particular time.',
      comingSoon: 'The first seasonal collection is on its way. Each one is made for a short season and then retired, so it is worth keeping an eye on this page.',
    },
  ],
  story: {
    slug: 'story',
    label: 'Our Story',
    eyebrow: 'Mia Torte',
    title: 'A thoughtful take on the art of baking.',
    intro: 'A boutique bakery for people who appreciate good ingredients, beautiful flavours and the small pleasures of exceptional food.',
    image: 'craft-kneading',
    sections: [
      {
        heading: 'Where it began',
        body: placeholder('The founder’s story: who bakes, where the kitchen is, and the moment Mia Torte began. To be written with Torte Living.'),
      },
      {
        heading: 'Two traditions',
        body: 'From the French pâtisserie we take precision and restraint: the clean line of a well-made biscuit, the balance of sweetness and salt, the discipline of doing a few things properly. From the Italian bakery we take warmth and generosity: honest richness, the pleasure of sharing, the sense that food is made for the table rather than the display case. Mia Torte lives somewhere between the two.',
      },
      {
        heading: 'How we bake',
        body: draft('Every recipe is developed over many trials before it joins the repertoire. We bake in small batches, choose ingredients for flavour rather than convenience, and finish each creation by hand.'),
      },
      {
        heading: 'Quality over quantity',
        body: 'We would rather make a few things exceptionally well than many things adequately. You will not find every bakery staple here. You will find a small number of distinctive creations, each one made because we think it deserves to exist.',
      },
    ],
  },
  contact: {
    title: 'Contact',
    intro: 'For orders, gifting and bespoke creations, we would be glad to hear from you.',
    blocks: [
      { heading: 'Orders & deliveries', body: 'Questions about an order you have placed, or one you are about to. Please have your order number to hand.', showContacts: true },
      { heading: 'Gifting & occasions', body: 'Boxes for a celebration, a thank-you or a table of guests, and corporate gifting in quantity.', showContacts: true },
      { heading: 'Bespoke creations', body: placeholder('Celebration cakes and made-to-order creations, where the kitchen allows. Write with your date, the number of guests and what you have in mind. Lead times to be confirmed.') },
      { heading: 'The kitchen', body: placeholder('Kitchen address and visiting hours, if any, to be supplied.') },
    ],
  },
};

// ------------------------------------------------------------ NUTRI SAMPOORNA
export const nutriSampoorna: Brand = {
  code: 'NS',
  slug: 'nutri-sampoorna',
  name: 'Nutri Sampoorna',
  theme: 'ns',
  descriptor: 'Contemporary pantry',
  tagline: 'Everyday nourishment, with a little more thought.',
  blurb: 'A contemporary pantry with an Indian soul: traditional grains, millets, pulses and seeds, brought together in distinctive recipes for the way we cook today.',
  shop: {
    title: 'The shelf',
    intro: 'Our full range. Curated rather than comprehensive: every product is here because it makes everyday cooking a little more interesting.',
  },
  emptyBag: 'Start with something for the everyday.',
  collections: [
    {
      slug: 'atta-grain-blends',
      title: 'Atta & Grain Blends',
      categories: ['Atta & flours', 'Atta', 'Grain blends', 'Flours'],
      image: 'ns-atta-bowl',
      intro: 'Multigrain and millet-based attas and traditional grain and pulse blends, for rotis, parathas and bhakris with more flavour and character.',
      comingSoon: 'New grain blends are in development.',
    },
    {
      slug: 'breakfast-dosa-mixes',
      title: 'Breakfast & Dosa Mixes',
      categories: ['Dosa & batter mixes', 'Dosa mixes', 'Breakfast mixes', 'Breakfast'],
      image: 'category-dosa',
      intro: 'Dosa, idli and breakfast mixes that bring millets and pulses to the first meal of the day, ready in the time it takes to heat the tawa.',
      comingSoon: 'Our first dosa and breakfast mixes are being tested in the kitchen, batch by batch, until the crisp is exactly right.',
    },
    {
      slug: 'muesli-nuts-seeds',
      title: 'Muesli, Nuts & Seeds',
      categories: ['Muesli', 'Nuts & seeds', 'Nuts', 'Seeds'],
      image: 'ns-muesli-bowl',
      intro: 'Considered blends of nuts and seeds, for breakfast bowls, yoghurt and quiet snacking.',
      comingSoon: 'Our nut and seed blends are in development. Until they arrive, the muesli in the Mia Torte collection is a good place to start.',
    },
    {
      slug: 'pantry-snacks',
      title: 'Pantry & Snacks',
      categories: ['Chutney powders', 'Podis', 'Pantry', 'Ready to eat'],
      image: 'ns-seeds-spoons',
      intro: 'Chutney powders and pantry staples for the everyday table, made with the same thought as everything else on the shelf.',
      comingSoon: 'Pantry staples and ready-to-eat foods will join the shelf soon.',
    },
  ],
  story: {
    slug: 'philosophy',
    label: 'Our Philosophy',
    eyebrow: 'Nutri Sampoorna',
    title: 'Good food begins with good ingredients.',
    intro: 'Nutri Sampoorna is a food brand first. We believe taste, ingredient integrity and good nutrition belong together, and that everyday eating can be far more interesting than it often is.',
    image: 'ns-grain-texture',
    sections: [
      {
        heading: 'The name',
        body: 'Sampoorna means complete, whole. For us it describes a way of eating rather than a promise: whole grains, honest ingredients, and meals that feel complete.',
      },
      {
        heading: 'An Indian pantry, rediscovered',
        body: 'India grows an extraordinary range of grains, millets, pulses, seeds and nuts, many of them pushed to the edges of the modern kitchen. We want to bring them back to the centre of the table, not as health food, but as good food.',
      },
      {
        heading: 'Thoughtful formulation',
        body: 'Every product starts with a question: what would make this everyday staple more interesting? The answer might be a millet that adds depth to a dosa, a pulse that gives an atta more body, or a fruit that turns breakfast into something to look forward to. We test, adjust and taste until a recipe earns its place.',
      },
      {
        heading: 'What we will not claim',
        body: 'We will not tell you that a flour will change your life. We will tell you exactly what is in it, where the idea came from and how to cook with it, and let the food speak for itself.',
      },
      {
        heading: 'Where our ingredients come from',
        body: placeholder('Sourcing: regions, farmers or mills Torte Living works with, and how ingredients are cleaned and milled. To be supplied.'),
      },
    ],
  },
  contact: {
    title: 'Contact',
    intro: 'Questions about an order, an ingredient or a recipe. We enjoy these conversations.',
    blocks: [
      { heading: 'Orders & deliveries', body: 'Questions about an order you have placed, or one you are about to. Please have your order number to hand.', showContacts: true },
      { heading: 'Ingredients & recipes', body: 'If you would like to know more about an ingredient, or how to cook with one of our products, write to us.', showContacts: true },
      { heading: 'Trade & wholesale', body: placeholder('Stockists, cafés and wholesale enquiries: contact details and minimum order quantities to be supplied.') },
    ],
  },
};

export const brands: Record<BrandCode, Brand> = { MT: miaTorte, NS: nutriSampoorna };
export const brandList: Brand[] = [miaTorte, nutriSampoorna];

// ------------------------------------------------------------ home page copy
export const mtHome = {
  heroEyebrow: 'Mia Torte · Boutique bakery',
  heroTitle: 'Baked with care.\nMade to be savoured.',
  heroText: 'Inspired by the quiet elegance of the French pâtisserie and the warmth of the Italian bakery, Mia Torte makes a small repertoire of distinctive treats, each one developed with patience and made for the pleasure of something truly delicious.',
  manifesto: 'We would rather make a few things exceptionally well than many things adequately.',
  featuredEyebrow: 'From the counter',
  featuredTitle: 'Distinctive flavours, carefully crafted.',
  repertoireEyebrow: 'The repertoire',
  repertoireTitle: 'For every kind of indulgence',
  principles: [
    { title: 'The ingredients', text: draft('Good butter, real chocolate, flour chosen for how it bakes. Flavour begins long before the oven.') },
    { title: 'The method', text: draft('Recipes refined over many trials, then baked in batches small enough to watch over.') },
    { title: 'The finish', text: draft('Every box assembled by hand when you order, so it reaches you as it left our kitchen.') },
  ],
  storyEyebrow: 'Our story',
  storyTitle: 'Between Paris and Naples, a kitchen of our own.',
  storyText: 'From the French pâtisserie, precision and restraint. From the Italian bakery, warmth and generosity. Mia Torte brings both sensibilities to Indian tables, with a character entirely its own.',
  bespokeEyebrow: 'Bespoke',
  bespokeTitle: 'Something made only for you.',
  bespokeText: placeholder('For a celebration, a gift or a table of your own, we create to order where the kitchen allows. Tell us what you have in mind.'),
};

export const nsHome = {
  heroEyebrow: 'Nutri Sampoorna',
  heroTitle: 'A more interesting\nway to eat well.',
  heroText: 'India has one of the richest grain heritages in the world: millets, pulses, seeds and heirloom staples, each with its own flavour and its own place in the kitchen. We bring them together in thoughtfully developed recipes and simple formats for the way we cook today.',
  shelfEyebrow: 'The shelf',
  shelfTitle: 'Four ways into the pantry',
  featuredEyebrow: 'On the shelf now',
  featuredTitle: 'Thoughtful ingredients. Distinctive recipes.',
  principlesTitle: 'How we think about food',
  principles: [
    { title: 'Food first', text: 'Nourishment should never come at the cost of flavour. If it is not good to eat, it does not make the shelf.' },
    { title: 'Ingredients with a story', text: 'We look for grains and pulses that bring something distinctive: an earthy depth, a nutty sweetness, a texture worth noticing.' },
    { title: 'Tradition, reimagined', text: 'Recipes rooted in the wisdom of Indian kitchens, developed with a modern understanding of ingredients.' },
    { title: 'Plainly labelled', text: 'Every ingredient listed clearly, in the order it appears, so you know exactly what you are cooking with.' },
  ],
  libraryEyebrow: 'The grain library',
  libraryTitle: 'Rediscover the goodness of everyday food.',
  libraryIntro: 'A few of the grains and pulses that inspire our recipes, and what each one brings to the kitchen.',
  library: [
    { name: 'Ragi', also: 'Finger millet · nachni · ragulu', text: 'Earthy and faintly malty. A staple of Karnataka, where it becomes mudde and ambli; beautiful in rotis, dosas and porridge.' },
    { name: 'Jowar', also: 'Sorghum · jonnalu', text: 'Mild and gently sweet. For generations the everyday flatbread grain of the Deccan, rolled into soft bhakris.' },
    { name: 'Bajra', also: 'Pearl millet · sajjalu', text: 'Robust and nutty, with a toasted note. The winter rotla of Gujarat and Rajasthan, eaten with white butter and jaggery.' },
    { name: 'Foxtail millet', also: 'Kangni · korralu', text: 'Small, quick-cooking and light. Comes close to rice in pulao, upma and khichdi.' },
    { name: 'Rajgira', also: 'Amaranth', text: 'Tiny seeds with a grassy, toasted flavour. Popped for laddoos and chikki, ground into flour for fasting days.' },
    { name: 'Horse gram', also: 'Kulthi · ulavalu', text: 'An earthy, assertive pulse, slow-cooked into the rasam and charu of South Indian kitchens.' },
  ],
  bandTitle: 'Tradition, thoughtfully reimagined.',
  bandText: 'Indian kitchens have always known how to combine grains and pulses for flavour, texture and balance: a little chana in the atta, a handful of urad in the batter. We start from that knowledge and build on it with care, testing blends and refining proportions until they fit a weekday.',
};
