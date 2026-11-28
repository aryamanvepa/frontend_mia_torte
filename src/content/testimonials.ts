// =====================================================================
// CUSTOMER TESTIMONIALS — real customers only.
//
// The home page shows "What our customers say" right after the bestsellers. While this list is empty
// it invites reviews instead (WhatsApp / Instagram); real, permitted entries replace the invitation
// automatically. We never invent reviews for the live site (India's Consumer Protection rules and the
// CCPA guidelines on fake reviews). The design playground alone shows SAMPLE entries, clearly marked.
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
  /** Playground only: a made-up entry for judging the layout. Never allowed in `testimonials`. */
  sample?: boolean;
}

export const testimonials: Testimonial[] = [
  // Real, permitted entries only. See the instructions above.
];

/** The entries the site may show. */
export const publishedTestimonials = testimonials.filter((t) => t.permission === true && !t.sample && t.quote.trim().length >= 20);

/**
 * DESIGN PLAYGROUND ONLY (VITE_PLAYGROUND=1): made-up entries, each shown with a "Sample" badge, so the
 * layout can be judged. In every other build this is an empty list and the text is left out of the
 * bundle; `npm run check` fails a live build that contains any of it.
 */
export const sampleTestimonials: Testimonial[] = import.meta.env.VITE_PLAYGROUND === '1'
  ? [
      { quote: 'Sample review: the cookies arrived soft in the middle and crisp at the edge, exactly as described.', firstName: 'Sample', city: 'Hyderabad', product: 'Classic Chocolate Chip', source: 'WhatsApp', date: '2026-11-01', permission: true, sample: true },
      { quote: 'Sample review: the pudina millet crunch is now the evening snack in our house.', firstName: 'Sample', city: 'Bengaluru', product: 'Pudina Millet Crunch', source: 'Instagram', date: '2026-11-02', permission: true, sample: true },
      { quote: 'Sample review: just add water and the pesarattu batter is ready. Perfect for busy mornings.', firstName: 'Sample', city: 'Pune', product: 'Instant Pesarattu Dosa Mix', source: 'WhatsApp', date: '2026-11-03', permission: true, sample: true },
    ]
  : [];
