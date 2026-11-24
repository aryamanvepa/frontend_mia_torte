// =====================================================================
// HOUSE CONTENT — Torte Living details, legal lines and policy pages.
// Brand copy (La Mia Torte, Nutri Sampoorn) lives in ./brands.ts,
// product copy in ./products.ts.
//
// Two kinds of flag are shown on the site while SHOW_PLACEHOLDER_FLAGS is true:
//   placeholder('…')  information we don't have yet (FSSAI no., address …)
//                     → tagged "Placeholder"
//   draft('…')        copy written to the brand brief that states a fact about
//                     recipes, ingredients or methods, so Torte Living must
//                     confirm or correct it → tagged "Draft · confirm"
// Replace either with a plain string once confirmed. The tags (and every other
// internal marker) are hidden whenever VITE_HIDE_TEST_DATA=1, i.e. on the live
// site; they show only in testing builds.
// =====================================================================

export const SHOW_PLACEHOLDER_FLAGS = import.meta.env.VITE_HIDE_TEST_DATA !== '1';

export interface Placeholder { text: string; placeholder: true; kind: 'missing' | 'draft' | 'test' }
export type Copy = string | Placeholder;
export const placeholder = (text: string): Placeholder => ({ text, placeholder: true, kind: 'missing' });
export const draft = (text: string): Placeholder => ({ text, placeholder: true, kind: 'draft' });
/** Made-up values for testing only (src/content/test-labels.ts, docs/test-label-data.md). Never for launch. */
export const testValue = (text: string): Placeholder => ({ text, placeholder: true, kind: 'test' });
export const isPlaceholder = (c: Copy): c is Placeholder => typeof c === 'object' && c !== null && c.placeholder;
export const copyText = (c: Copy) => (isPlaceholder(c) ? c.text : c);

// ---------------------------------------------------------------- business & legal details
// Each detail below is shown on the site ONLY when it has a value. `null` hides it
// everywhere: footer, product pages, contact page, policy pages and search data.
// Legal name, FSSAI registration, GSTIN and registered address are from the
// government certificates (added 2026-11-24). Email, phone, hours and Instagram
// stay hidden until Torte Living confirms which to publish, e.g.
//   email: 'hello@lamiatorte.com',   phone: '+91 98xxx xxxxx',
//   hours: 'Mon–Sat, 10 am – 6 pm IST',   instagram: 'https://instagram.com/…'
// The Contact page and its links appear once there is an email or a phone.
export const site: {
  name: string; legalEntity: string; countryOfOrigin: string; codNote: string;
  fssaiLicence: Copy | null; gstin: Copy | null; registeredAddress: Copy | null;
  /** The same address in parts, for search engines (Organization structured data). */
  address: { street: string; locality: string; city: string; region: string; postalCode: string; country: string } | null;
  email: Copy | null; phone: Copy | null; hours: Copy | null; instagram: string | null;
  dispatchNote: Copy | null; deliveryNote: Copy | null;
} = {
  name: 'Torte Living',
  legalEntity: 'Torte Living Private Limited',
  fssaiLicence: 'FSSAI Reg. No. 23626050000127',
  gstin: 'GSTIN 36AAMCT6790R1Z4',
  registeredAddress: 'Plot No. G-403, Alpha-706, Jayabheri Silicon County, Serilingampally, Kondapur, Hyderabad, Telangana 500084',
  address: {
    street: 'Plot No. G-403, Alpha-706, Jayabheri Silicon County, Serilingampally',
    locality: 'Kondapur', city: 'Hyderabad', region: 'Telangana', postalCode: '500084', country: 'IN',
  },
  email: null,
  phone: null,
  hours: null,
  countryOfOrigin: 'India',
  dispatchNote: null,
  deliveryNote: null,
  codNote: 'Pay on delivery. Nothing is charged online; you pay when your order arrives.',
  instagram: null,
};

/** True once there is a real way to reach us (email or phone): shows the Contact page and its links. */
export const HAS_CONTACT = Boolean(site.email || site.phone);

/**
 * Shipping, Returns & refunds, Privacy and Terms pages. false = the pages, their
 * links and their sitemap entries are all gone. Set true once the final policy
 * text below is in (and replace each needs(…) / placeholder(…) with it).
 */
export const SHOW_POLICY_PAGES = false;

/** Missing-content placeholders (brand-page sections like the founder's story, kitchen
 *  address, trade enquiries) are left out of the site rather than shown as "to be supplied". */
export const HIDE_MISSING_SECTIONS = true;
export const isMissing = (c: Copy | null | undefined) => c == null || (isPlaceholder(c) && c.kind === 'missing' && HIDE_MISSING_SECTIONS);

// The shared landing page at "/".
export const house = {
  eyebrow: 'Torte Living',
  title: 'Two houses.\nOne way of eating well.',
  intro: 'La Mia Torte and Nutri Sampoorn are very different brands that share a conviction: food deserves thought and attention. Good ingredients, carefully developed recipes, and an appreciation of the finer things in everyday living.',
  beliefTitle: 'Food deserves thought.',
  beliefs: [
    { title: 'Ingredients first', text: 'Every recipe begins with the question of what goes into it, and why.' },
    { title: 'Recipes, developed', text: 'Nothing reaches the shelf until it has been tasted, adjusted and tasted again.' },
    { title: 'A point of view', text: 'A small, considered range, rather than a little of everything.' },
  ],
  doors: {
    MT: { kicker: 'The boutique bakery', line: 'Little indulgences, beautifully made.', cta: 'Enter La Mia Torte' },
    NS: { kicker: 'The contemporary pantry', line: 'Tradition, thoughtfully reimagined.', cta: 'Enter Nutri Sampoorn' },
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
