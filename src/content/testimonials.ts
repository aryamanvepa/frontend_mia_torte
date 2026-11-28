// =====================================================================
// CUSTOMER TESTIMONIALS — real customers only.
//
// The home page shows "What our customers say" right after the bestsellers, ONLY when this list has
// at least one entry. It is empty today: there are no reviews yet, and we never invent any (fake
// reviews break India's Consumer Protection rules on misleading advertisements and fake reviews).
//
// To add one (Torte Living):
//   1. Ask the customer if you may quote them on the website, and keep their "yes" (a screenshot is fine).
//   2. Copy their words exactly; you may shorten, never change the meaning.
//   3. Add an entry below and set permission: true. First name and city only: never a surname, phone or photo.
//   4. Push: `npm run check` fails the build if an entry has no permission, is too short, has an empty
//      field, names a product we don't sell, or looks like placeholder text.
//
// Example (do not uncomment; it is not a real review):
//   { quote: 'The pudina crunch is the first snack my kids ask for after school.', firstName: 'Ananya',
//     city: 'Hyderabad', product: 'Pudina Millet Crunch', source: 'WhatsApp', date: '2026-12-02', permission: true },
// =====================================================================

export type TestimonialSource = 'Instagram' | 'WhatsApp' | 'Email' | 'Google' | 'In person';

export interface Testimonial {
  /** The customer's own words. */
  quote: string;
  /** First name only. */
  firstName: string;
  city: string;
  /** Exact product name as in the shop, e.g. 'Classic Chocolate Chip'. */
  product: string;
  source: TestimonialSource;
  /** When they said it (YYYY-MM-DD). */
  date: string;
  /** The customer agreed to be quoted on the website. Entries without it are never shown. */
  permission: boolean;
}

export const testimonials: Testimonial[] = [
  // Real, permitted entries only. See the instructions above.
];

/** The entries the site may show. */
export const publishedTestimonials = testimonials.filter((t) => t.permission === true && t.quote.trim().length >= 20);
