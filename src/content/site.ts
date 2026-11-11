// =====================================================================
// SITE-WIDE CONTENT — edit this file to replace placeholders.
//
// Anything wrapped in placeholder(…) is shown on the site with a small
// "Placeholder" tag while SHOW_PLACEHOLDER_FLAGS is true, so the client can
// see at a glance what still needs real input. Replace the value with plain
// text when it is supplied, and set SHOW_PLACEHOLDER_FLAGS = false before launch.
// =====================================================================

export const SHOW_PLACEHOLDER_FLAGS = true;

export interface Placeholder { text: string; placeholder: true }
export type Copy = string | Placeholder;
export const placeholder = (text: string): Placeholder => ({ text, placeholder: true });
export const isPlaceholder = (c: Copy): c is Placeholder => typeof c === 'object' && c !== null && c.placeholder;
export const copyText = (c: Copy) => (isPlaceholder(c) ? c.text : c);

export const site = {
  name: 'Mia Torte',
  legalEntity: 'Torte Living Pvt Limited',
  tagline: 'Patisserie, baked slowly',
  fssaiLicence: placeholder('FSSAI Lic. No. 00000000000000'),
  gstin: placeholder('GSTIN to be added'),
  registeredAddress: placeholder('Registered office address to be supplied'),
  email: placeholder('hello@example.com'),
  phone: placeholder('+91 00000 00000'),
  hours: placeholder('Mon–Sat, 10 am – 6 pm IST'),
  deliveryNote: placeholder('Freshly packed and dispatched within 1–2 working days. Delivery areas and timelines to be confirmed.'),
  codNote: 'Pay on delivery. Nothing is charged online. You pay when your order reaches you.',
  instagram: placeholder('https://instagram.com/'),
};

export const brands = {
  MT: {
    code: 'MT',
    name: 'Mia Torte',
    short: 'Patisserie',
    blurb: 'Small-batch cookies, brownies and cakes, made with good butter and no hurry.',
  },
  NS: {
    code: 'NS',
    name: 'Nutri Sampoorna',
    short: 'The Pantry',
    blurb: 'Whole grains, stone-ground and honestly made: the staples behind a good kitchen.',
  },
} as const;
export type BrandCode = keyof typeof brands;

// Home page copy (drafts — the client should review the wording).
export const home = {
  heroEyebrow: 'Mia Torte · Patisserie',
  heroTitle: 'Baked slowly,\nmeant to be shared.',
  heroText: placeholder(
    'Cookies with crisp edges and soft centres, brownies dense with dark chocolate, cakes for the days that deserve them. Every batch is small, every box packed by hand.',
  ),
  storyEyebrow: 'Our story',
  storyTitle: 'A kitchen that refuses to rush.',
  storyText: placeholder(
    'Mia Torte began with a simple belief: that the best things come out of the oven when you give them time. We rest our doughs, we brown our butter, and we bake in batches small enough to watch. The founder\'s story goes here.',
  ),
  pantryTitle: 'From the same kitchen, the everyday.',
  pantryText: placeholder(
    'Nutri Sampoorna is our pantry line: multigrain atta and batter mixes made from whole grains, for the meals you cook every day.',
  ),
  promises: [
    { title: 'Small batches', text: 'Baked in quantities we can watch over, never mass-produced.' },
    { title: 'Packed to order', text: 'Boxed by hand when you order, not weeks in advance.' },
    { title: 'Pay on delivery', text: 'No card needed. Pay when your order reaches you.' },
  ],
};

// Policy & information pages. Each section's body is a placeholder for the client to supply.
export interface PolicyPage { slug: string; title: string; intro: Copy; sections: { heading: string; body: Copy }[] }
const needs = (what: string) => placeholder(`${what} — to be supplied by Torte Living.`);

export const pages: Record<string, PolicyPage> = {
  about: {
    slug: 'about', title: 'Our story',
    intro: placeholder('The story of Torte Living, Mia Torte and Nutri Sampoorna: who bakes, where, and why.'),
    sections: [
      { heading: 'Mia Torte', body: needs('Founder\'s story, the kitchen, what makes the bakes different') },
      { heading: 'Nutri Sampoorna', body: needs('Why a pantry line, grain sourcing, milling') },
      { heading: 'How we make things', body: needs('Ingredients policy, batch sizes, food-safety practices') },
    ],
  },
  shipping: {
    slug: 'shipping', title: 'Shipping & delivery',
    intro: placeholder('Where we deliver, how long it takes and what it costs.'),
    sections: [
      { heading: 'Delivery charges', body: placeholder('Pilot rule: ₹60 per order, free on orders above ₹999. Final rule to be confirmed.') },
      { heading: 'Where we deliver', body: needs('Serviceable cities / PIN codes, local vs national couriers') },
      { heading: 'Dispatch & delivery times', body: needs('Packing time, delivery estimates, perishables handling') },
      { heading: 'Pay on delivery', body: needs('Accepted payment methods on delivery (cash / UPI)') },
    ],
  },
  refunds: {
    slug: 'refunds', title: 'Returns & refunds',
    intro: placeholder('What happens if something arrives damaged or is not right.'),
    sections: [
      { heading: 'Damaged or incorrect items', body: needs('How to report, time window, photos required') },
      { heading: 'Cancellations', body: needs('Until when an order can be cancelled') },
      { heading: 'Refunds', body: needs('Refund method and timelines') },
    ],
  },
  privacy: {
    slug: 'privacy', title: 'Privacy policy',
    intro: placeholder('How Torte Living Pvt Limited collects, uses and protects personal data (DPDP Act 2023).'),
    sections: [
      { heading: 'What we collect', body: needs('Name, phone, email, delivery address; purpose of each') },
      { heading: 'Marketing', body: needs('Marketing messages only with separate consent; how to withdraw') },
      { heading: 'Who we share it with', body: needs('Delivery partners, hosting providers') },
      { heading: 'Your rights & grievance officer', body: needs('Contact details of the grievance officer') },
    ],
  },
  terms: {
    slug: 'terms', title: 'Terms of sale',
    intro: placeholder('The terms on which Torte Living Pvt Limited sells through this website.'),
    sections: [
      { heading: 'Orders & pricing', body: needs('Prices include GST; order acceptance; errors') },
      { heading: 'Food safety & allergens', body: needs('Allergen statement, storage advice, shelf life') },
      { heading: 'Governing law', body: needs('Jurisdiction and contact details') },
    ],
  },
};
