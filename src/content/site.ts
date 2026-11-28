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
// government certificates (added 2026-11-24). Email and phone approved by
// Torte Living on 2026-11-24. Hours stay hidden until confirmed, e.g.
//   hours: 'Mon–Sat, 10 am – 6 pm IST'
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
  email: 'miatorte@gmail.com',
  phone: '+91 73306 16222',
  hours: null,
  countryOfOrigin: 'India',
  dispatchNote: null,
  deliveryNote: null,
  codNote: 'Pay on delivery. Nothing is charged online; you pay when your order arrives.',
  instagram: 'https://www.instagram.com/miatortebakery',
};

/** WhatsApp and Instagram (info bar and footer). Approved 2026-11-28. */
export const social = {
  whatsapp: `https://wa.me/917330616222?text=${encodeURIComponent('Hi! I have a question about La Mia Torte / Nutri Sampoorn')}`,
  instagramMT: 'https://www.instagram.com/miatortebakery',
  instagramNS: 'https://www.instagram.com/nutrisampoorn/',
};

/** mailto: / tel: links for the published email and phone. */
export const mailHref = site.email ? `mailto:${copyText(site.email)}` : null;
export const telHref = site.phone ? `tel:${copyText(site.phone).replace(/[^\d+]/g, '')}` : null;

/** Grievance officer (Consumer Protection (E-Commerce) Rules 2020; DPDP Act 2023). Approved 2026-11-24. */
export const grievanceOfficer = {
  name: 'Meenakshi Sareen',
  role: 'Director, Torte Living Private Limited',
  email: 'miatorte@gmail.com',
  phone: '+91 73306 16222',
};

/** True once there is a real way to reach us (email or phone): shows the Contact page and its links. */
export const HAS_CONTACT = Boolean(site.email || site.phone);

/**
 * Which policy pages are live. false = the page, its links and its sitemap entry are all gone.
 * Shipping & returns is live (2026-11-24). Privacy and Terms are drafts (text below, and
 * ../reports/policy-drafts-2026-11-24/) waiting for Torte Living's approval.
 */
export const POLICY_LIVE = { shipping: true, privacy: false, terms: false } as const;

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

// ---------------------------------------------------------------- policy pages
// Section bodies are paragraphs (a string) or bullet lists (an array). Every statement
// is based on what the shop and the backend actually do; commitments the business has
// not confirmed yet are marked "COMMITMENT" in comments so they are easy to review.
export interface PolicySection { heading: string; body: Copy | string[]; after?: string }
export interface PolicyPage { slug: string; title: string; intro: Copy; updated: string; sections: PolicySection[]; grievance?: boolean }

const legalLine = `${site.legalEntity}, ${copyText(site.registeredAddress ?? '')}`;

export const pages: Record<'shipping' | 'privacy' | 'terms', PolicyPage> = {
  shipping: {
    slug: 'shipping', title: 'Shipping & returns', updated: '24 November 2026', grievance: true,
    intro: 'How we deliver, what it costs, how to cancel, and what to do if something isn’t right with your order.',
    sections: [
      { heading: 'Payment', body: 'Cash on delivery only. Nothing is charged online: you pay when your order arrives.' },
      {
        heading: 'Delivery charges',
        body: ['₹60 per order.', 'Free delivery on orders above ₹999.', 'The delivery charge is shown in your bag and at checkout before you place your order.'],
      },
      {
        heading: 'Where we deliver',
        body: [
          'Hyderabad (PIN codes 500001 to 500100): local delivery, usually the same or next day after dispatch.',
          'Other PIN codes from 500000 to 509999: usually 2 to 4 days after dispatch.',
          'The rest of India: usually 3 to 7 days after dispatch.',
          'Some areas, including PIN codes starting with 99, aren’t served yet.',
        ],
        after: 'Check your PIN code on any product page or at checkout. Delivery times are estimates from dispatch, not guarantees.',
      },
      // COMMITMENT (not confirmed): dispatch time.
      { heading: 'Dispatch', body: 'Orders are usually dispatched within 2 to 3 working days of being placed.' },
      { heading: 'Tracking your order', body: 'Use Track an order with your order code (shown on your order confirmation) and the phone number you ordered with.' },
      {
        heading: 'Cancelling an order',
        body: 'You can ask to cancel from the Track an order page until your order is dispatched. If it hasn’t been packed yet, it’s cancelled straight away; if it has been packed, we’ll review your request and let you know. As you pay on delivery, there is nothing to refund for a cancelled order.',
      },
      {
        heading: 'Returns',
        body: 'Our products are packaged food, so we can’t accept returns for a change of mind.',
      },
      {
        heading: 'Damaged, wrong or expired items',
        body: [
          'Tell us within 48 hours of delivery, by email or phone (below).',
          'Include your order code and photos of the item and its packaging.',
          'Once we’ve checked, we’ll replace the item or refund it.',
        ],
      },
      // COMMITMENT (not confirmed): refund method and timeline for cash-on-delivery orders.
      { heading: 'Refunds', body: 'As you pay on delivery, approved refunds are made by bank transfer or UPI, usually within 7 working days of approval.' },
    ],
  },

  privacy: {
    slug: 'privacy', title: 'Privacy policy', updated: '24 November 2026 (draft)', grievance: true,
    intro: `How ${site.legalEntity} collects, uses and protects your personal data when you use this website, under the Digital Personal Data Protection Act, 2023.`,
    sections: [
      { heading: 'Who we are', body: `This website is run by ${legalLine}. We are responsible for your personal data as the “data fiduciary”.` },
      {
        heading: 'What we collect',
        body: [
          'When you order: your name, phone number, email address (if you give one), delivery address and any order notes, and whether you agreed to marketing messages.',
          'When you ask to be told a product is available: your email address, your first name (if you give it) and the product.',
          'On your device: your bag and the last PIN code you checked are kept in your own browser so they are there when you come back. They are not sent to us until you check delivery or place an order.',
        ],
      },
      {
        heading: 'Why we use it',
        body: [
          'To accept, pack, deliver and support your order, including contacting you about delivery.',
          'To keep the records Indian tax and accounting law requires.',
          'To send you one email when a product you asked about is available.',
          'To send you marketing messages, only if you ticked the box at checkout. You can withdraw that consent at any time.',
        ],
      },
      {
        heading: 'Cookies, analytics and advertising',
        body: 'This website uses no analytics or advertising trackers. If we ever add them, we will ask for your consent first and keep your choice on your device.',
      },
      {
        heading: 'Who we share it with',
        body: [
          'Delivery partners, who receive your name, phone number and address to deliver your order.',
          'The providers that host this website and store its data: Cloudflare and GitHub (website hosting) and Supabase (database).',
        ],
        after: 'We do not sell your personal data.',
      },
      {
        heading: 'How long we keep it',
        body: [
          'Back-in-stock requests are erased 180 days after they have been handled.',
          'Order records are kept for as long as Indian tax and accounting law requires.',
        ],
      },
      // COMMITMENT (not confirmed): security wording.
      { heading: 'Keeping it safe', body: 'We use reasonable security safeguards, and only people who need your data to run your order can see it.' },
      {
        heading: 'Your rights',
        body: [
          'Ask for a summary of the personal data we hold about you and how we use it.',
          'Ask us to correct, complete or update it.',
          'Ask us to erase it, unless the law requires us to keep it.',
          'Withdraw any consent you have given.',
          'Nominate someone to exercise these rights for you in case of death or incapacity.',
          'Raise a grievance with us, and then with the Data Protection Board of India if you are not satisfied.',
        ],
        after: 'To use any of these rights, write to our grievance officer (below).',
      },
      { heading: 'Changes to this policy', body: 'If we change this policy, we will update it here with a new date.' },
    ],
  },

  terms: {
    slug: 'terms', title: 'Terms of use and sale', updated: '24 November 2026 (draft)', grievance: true,
    intro: 'The terms on which you use this website and buy from us. Please read them before you order.',
    sections: [
      {
        heading: 'Who we are',
        body: `This website and its shop are run by ${legalLine}. La Mia Torte and Nutri Sampoorn are our brands. ${copyText(site.gstin ?? '')}. ${copyText(site.fssaiLicence ?? '')}.`,
      },
      { heading: 'Prices and payment', body: 'Prices are in Indian rupees and include GST. The delivery charge is shown before you order. Payment is cash on delivery only.' },
      {
        heading: 'Orders and stock',
        body: 'Placing an order is an offer to buy. Stock and prices are checked when you place it, and your order is accepted when you see the confirmation page. If we later can’t fulfil it, for example because an item is unavailable or a price was shown in error, we will tell you and cancel all or part of it.',
      },
      { heading: 'Delivery, cancellations and returns', body: 'These are set out on our Shipping & returns page, which forms part of these terms.' },
      {
        heading: 'Product information and allergens',
        body: 'We describe our products as accurately as we can, but photos are for illustration. Always read the label on the pack, which takes precedence over the website. If you have an allergy or a dietary question, please contact us before ordering.',
      },
      { heading: 'Intellectual property', body: 'The names, logos, text and photos on this website belong to us or are used with permission. Please don’t copy or reuse them without our written consent. Other brand names mentioned belong to their owners.' },
      // COMMITMENT (not confirmed): liability wording.
      {
        heading: 'Our responsibility to you',
        body: 'We are responsible for supplying products that are as described and safe to eat when stored as the label says. Nothing in these terms limits your rights under the Consumer Protection Act, 2019. Beyond those rights, our responsibility for any order is limited to the amount you paid for it, and we are not responsible for losses that could not reasonably have been foreseen.',
      },
      { heading: 'Governing law', body: 'These terms are governed by the laws of India. The courts at Hyderabad, Telangana have jurisdiction, without affecting your right to approach a consumer commission.' },
      { heading: 'Changes to these terms', body: 'We may update these terms. The version on this page when you place an order applies to that order.' },
    ],
  },
};

/**
 * About the founder. Only facts Torte Living has given. `photo` (an images.ts id) and `story`
 * (her own words, one paragraph per entry) stay null until supplied: the page shows nothing for them.
 */
export const founder = {
  name: 'Meenakshi Sareen',
  role: 'Founder and Director, Torte Living Private Limited, Hyderabad',
  photo: null as string | null,
  story: null as string[] | null,
};
