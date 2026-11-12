// =====================================================================
// HOUSE CONTENT — Torte Living details, legal lines and policy pages.
// Brand copy (Mia Torte, Nutri Sampoorna) lives in ./brands.ts,
// product copy in ./products.ts.
//
// Two kinds of flag are shown on the site while SHOW_PLACEHOLDER_FLAGS is true:
//   placeholder('…')  information we don't have yet (FSSAI no., address …)
//                     → tagged "Placeholder"
//   draft('…')        copy written to the brand brief that states a fact about
//                     recipes, ingredients or methods, so Torte Living must
//                     confirm or correct it → tagged "Draft · confirm"
// Replace either with a plain string once confirmed, and set
// SHOW_PLACEHOLDER_FLAGS = false before launch.
// =====================================================================

export const SHOW_PLACEHOLDER_FLAGS = true;

export interface Placeholder { text: string; placeholder: true; kind: 'missing' | 'draft' }
export type Copy = string | Placeholder;
export const placeholder = (text: string): Placeholder => ({ text, placeholder: true, kind: 'missing' });
export const draft = (text: string): Placeholder => ({ text, placeholder: true, kind: 'draft' });
export const isPlaceholder = (c: Copy): c is Placeholder => typeof c === 'object' && c !== null && c.placeholder;
export const copyText = (c: Copy) => (isPlaceholder(c) ? c.text : c);

export const site = {
  name: 'Torte Living',
  legalEntity: 'Torte Living Pvt. Ltd.',
  fssaiLicence: placeholder('FSSAI Lic. No. 00000000000000'),
  gstin: placeholder('GSTIN to be added'),
  registeredAddress: placeholder('Registered office address to be supplied'),
  email: placeholder('hello@example.com'),
  phone: placeholder('+91 00000 00000'),
  hours: placeholder('Mon–Sat, 10 am – 6 pm IST'),
  countryOfOrigin: 'India',
  dispatchNote: placeholder('Packed to order and dispatched within 1–2 working days.'),
  deliveryNote: placeholder('Delivery ₹60, complimentary on orders above ₹999. Delivery areas to be confirmed.'),
  codNote: 'Pay on delivery. Nothing is charged online; you pay when your order arrives.',
  instagram: placeholder('https://instagram.com/'),
};

// The shared landing page at "/".
export const house = {
  eyebrow: 'Torte Living',
  title: 'Two houses.\nOne way of eating well.',
  intro: 'Mia Torte and Nutri Sampoorna are very different brands that share a conviction: food deserves thought and attention. Good ingredients, carefully developed recipes, and an appreciation of the finer things in everyday living.',
  beliefTitle: 'Food deserves thought.',
  beliefs: [
    { title: 'Ingredients first', text: 'Every recipe begins with the question of what goes into it, and why.' },
    { title: 'Recipes, developed', text: 'Nothing reaches the shelf until it has been tasted, adjusted and tasted again.' },
    { title: 'A point of view', text: 'A small, considered range, rather than a little of everything.' },
  ],
  doors: {
    MT: { kicker: 'The boutique bakery', line: 'Little indulgences, beautifully made.', cta: 'Enter Mia Torte' },
    NS: { kicker: 'The contemporary pantry', line: 'Tradition, thoughtfully reimagined.', cta: 'Enter Nutri Sampoorna' },
  },
};

// Policy & information pages. Section bodies are placeholders for the client to supply.
export interface PolicyPage { slug: string; title: string; intro: Copy; sections: { heading: string; body: Copy }[] }
const needs = (what: string) => placeholder(`${what}: to be supplied by Torte Living.`);

export const pages: Record<string, PolicyPage> = {
  shipping: {
    slug: 'shipping', title: 'Shipping & delivery',
    intro: placeholder('Where we deliver, how long it takes and what it costs.'),
    sections: [
      { heading: 'Delivery charges', body: placeholder('Pilot rule: ₹60 per order, complimentary on orders above ₹999. Final rule to be confirmed.') },
      { heading: 'Where we deliver', body: needs('Serviceable cities / PIN codes, local and national couriers') },
      { heading: 'Dispatch & delivery times', body: needs('Packing time, delivery estimates, handling of fresh bakes') },
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
    intro: placeholder('How Torte Living Pvt. Ltd. collects, uses and protects personal data (DPDP Act 2023).'),
    sections: [
      { heading: 'What we collect', body: needs('Name, phone, email, delivery address; the purpose of each') },
      { heading: 'Marketing', body: needs('Marketing messages only with separate consent; how to withdraw it') },
      { heading: 'Back-in-stock alerts', body: draft('If you ask us to email you when a product is available, we keep your email address (and first name, if you give it) only to send you that one email. We do not use it for marketing or share it. To be removed before then, write to us and we will delete it. How long requests are kept is to be confirmed by Torte Living.') },
      { heading: 'Who we share it with', body: needs('Delivery partners, hosting providers') },
      { heading: 'Your rights & grievance officer', body: needs('Contact details of the grievance officer') },
    ],
  },
  terms: {
    slug: 'terms', title: 'Terms of sale',
    intro: placeholder('The terms on which Torte Living Pvt. Ltd. sells through this website.'),
    sections: [
      { heading: 'Orders & pricing', body: needs('Prices include GST; order acceptance; errors') },
      { heading: 'Food safety & allergens', body: needs('Allergen statement, storage advice, shelf life') },
      { heading: 'Governing law', body: needs('Jurisdiction and contact details') },
    ],
  },
};
