// =====================================================================
// IMAGE REGISTRY — alt text and credits for every photo on the site.
//
// Product photos (mt-…-1 etc.) are Torte Living's own (credit null). The other
// photos are PLACEHOLDER stock photography used for mood and ingredients only
// (never presented as a product), from Unsplash (free to use under the Unsplash Licence:
// https://unsplash.com/license). Products without a photo show an
// illustration instead (src/components/PackArt.tsx). To add or replace one:
//   1. put the real photo in a folder, named <id>.jpg (e.g. mt-classic-choc-chip-1.jpg)
//   2. npm run images -- <that folder>
//   3. add/update its entry below (alt text; credit null for your own photography)
//   4. for a product photo, list the id in that product's `images` (src/content/products.ts)
// =====================================================================
import generated from './images.generated.json';

export interface Credit { photographer: string; profile: string; source: string; url: string }
export interface ImageInfo { alt: string; credit: Credit | null }

const unsplash = (photographer: string, handle: string, photoId: string): Credit => ({
  photographer,
  profile: `https://unsplash.com/@${handle}`,
  source: 'Unsplash',
  url: `https://unsplash.com/photos/${photoId}`,
});

/** TEST IMAGES (stock, Unsplash): stand-ins for product photography while testing. Listed in docs/test-images.md. Remove before launch. */
const stock = (handle: string, image: string): Credit => ({ photographer: `@${handle}`, profile: `https://unsplash.com/@${handle}`, source: 'Unsplash (test image)', url: `https://images.unsplash.com/${image}` });

export const images: Record<string, ImageInfo> = {
  // ---- TEST stock photos standing in for product photography (docs/test-images.md)
  'test-mocha': { alt: 'Chocolate cookies on a plate beside a cup of coffee', credit: stock('bycindys', 'photo-1559594323-25090515ee2f') },
  'test-red-velvet': { alt: 'Red velvet cookies cooling on a rack', credit: stock('fghaessani', 'photo-1673412810103-27c233f77da6') },
  'test-nutella-brownie': { alt: 'Cookies topped with chocolate hazelnut spread', credit: stock('vdphotography', 'photo-1642942000413-d967010dea4b') },
  'test-jowar-jeera': { alt: 'Crisp savoury biscuits with seeds', credit: stock('bohdans', 'photo-1615294209152-571969a7fbfe') },
  'test-orange-muesli': { alt: 'A white bowl of crunchy granola', credit: stock('fallonmichaeltx', 'photo-1578687595055-d15759a04151') },
  'test-veg-chips': { alt: 'Colourful vegetable chips on a plate', credit: stock('khlebnikovayulia', 'photo-1579384264577-79580c9d3a36') },
  'test-mga': { alt: 'A bowl of flour beside ears of wheat', credit: stock('matveevr', 'photo-1714842981153-ffeaf74e7a1a') },
  'test-roti': { alt: 'A flatbread cooking on a hot tawa', credit: stock('champsara', 'photo-1780907084874-14d202d39bf1') },
  'test-gf-atta': { alt: 'A heap of flour with a scoop', credit: stock('tinkerman', 'photo-1627735483792-233bf632619b') },
  'test-ragi': { alt: 'A bag of flour with a sieve', credit: stock('smakoladka', 'photo-1610725664285-7c57e6eeac3f') },
  'test-bajra': { alt: 'Pearl millet growing on the plant', credit: stock('painpt4u', 'photo-1639086407827-0dadcd5718c9') },
  'test-jowar': { alt: 'A clay pot of sorghum grains', credit: stock('hetcfoods', 'photo-1792130910504-a5226d9a98ab') },
  'test-sattu': { alt: 'Roasted chana, the gram sattu is milled from', credit: stock('zoshuacolah', 'photo-1788629072055-736461ae2527') },
  'test-multimillet-dosa': { alt: 'A crisp dosa with coconut chutney and sambar', credit: stock('zoshuacolah', 'photo-1694849789325-914b71ab4075') },
  'test-multigrain-dosa': { alt: 'A crisp dosa with sambar and chutneys', credit: stock('paul19977', 'photo-1668236543090-82eba5ee5976') },
  'test-pesarattu': { alt: 'A thin, crisp dosa with chutneys', credit: stock('pavan_09', 'photo-1751560455942-f859f1215826') },
  'test-peanut-chutney': { alt: 'Idli covered in chutney powder with sambar', credit: stock('zoshuacolah', 'photo-1788621879512-0aefb7a774ff') },

  'craft-flour-hands': { alt: 'A baker\'s hands dusting flour over a dark work table', credit: unsplash('Mae Mu', 'picoftasty', 'rgRbqFweGF0') },
  'craft-kneading': { alt: 'Hands kneading a ball of dough on a floured table', credit: unsplash('Skyler Ewing', 'skylerewing', '2uiZDQYTHBM') },
  'chocolate-cocoa': { alt: 'Dark chocolate and cocoa powder in a metal bowl', credit: unsplash('Monika Grabkowska', 'moniqa', 'jEu4F6oJtUQ') },
  'category-brownies': { alt: 'A stack of fudgy chocolate brownies on a white plate', credit: unsplash('Anna Przepiorka', 'myphotoland', 'LjtviHokbr4') },
  'ns-atta-bowl': { alt: 'A bowl of fine flour with ears of wheat on a dark background', credit: unsplash('Roman Matveev', 'matveevr', 'quVArOn8-30') },
  'category-dosa': { alt: 'A golden dosa served on a banana leaf with chutneys', credit: unsplash('Pavan Reddy', 'pavan_09', 'JJhZ34RRyfk') },
  'pantry-grains': { alt: 'Close-up of whole wheat grains', credit: unsplash('Maria Camila Tobón', 'mcamitobon', '7Fxkt2gfUqg') },
  'category-snacks': { alt: 'Glass display cases of savoury Indian snacks in warm light', credit: unsplash('atelierbyvineeth', 'atelierbyvineeth', 'OlElzH1Hn94') },
  'mt-seasonal-tarts': { alt: 'Small fruit tarts with berries, kiwi and glazed fruit on a dark surface', credit: unsplash('Caramel', 'caramel_works', 'K8z5FJUay74') },
  'ns-muesli-bowl': { alt: 'A white bowl of toasted granola with a spoon on a linen cloth', credit: unsplash('Elena Leya', 'foodistika', 'pqpW5wHweQo') },
  'ns-seeds-spoons': { alt: 'Spoons of seeds and ground grains laid on a sage-green surface', credit: unsplash('lucia tognacci', 'luciatognacci99', 'y3w8WZ6uJWI') },
  // Torte Living's own product photos
  'mt-fruit-nut-muesli-1': { alt: 'Mia Torte Fruit & Nut Muesli in a kraft pouch, beside a bowl of muesli and a glass of milk', credit: null },
  'mt-mango-muesli-1': { alt: 'Mia Torte Nutty Mango Millet Muesli in a kraft pouch, beside a bowl of muesli and fresh mango', credit: null },
  'mt-strawberry-muesli-1': { alt: 'Mia Torte Crunchy Strawberry Millet Muesli in a kraft pouch and a jar, beside a bowl of muesli and fresh strawberries', credit: null },
  'mt-classic-choc-chip-1': { alt: 'Rich chocolate cookies studded with dark and milk chocolate chunks on baking paper', credit: null },
  'mt-carrot-creme-1': { alt: 'A Carrot Crème Melt cookie drizzled with white icing, beside carrots, walnuts and cinnamon', credit: null },
  'mt-biscoff-1': { alt: 'A Biscoff Indulgence cookie with a caramel-spread drizzle and flakes of sea salt', credit: null },
  'mt-pista-1': { alt: 'A Berry Nutty About Pista cookie with a pistachio drizzle, cranberries and chopped pistachios', credit: null },
  'mt-pudina-crunch-1': { alt: 'Pudina Millet Crunch in a wooden bowl with fresh mint and a millet stalk', credit: null },
  'mt-pudina-crunch-2': { alt: 'A jar of Mia Torte Pudina Millet Crunch beside a pink bowl of it, fresh mint and a cup of chai', credit: null },
  'mt-masala-bean-1': { alt: 'A jar of Mia Torte Masala Protein Bean Mix beside a pink bowl of spiced beans', credit: null },
  'mt-trail-mix-1': { alt: 'A jar of Mia Torte Peri Peri Trail Mix beside a bowl of spiced nuts and seeds', credit: null },
  'mt-salted-nuts-1': { alt: 'A jar of Mia Torte Salted Nuts & Bean Crunch beside a bowl of nuts, seeds and green peas', credit: null },
  'mt-salted-nuts-2': { alt: 'Salted Nuts & Bean Crunch in a white bowl with almonds, cashews and seeds scattered on a wooden board', credit: null },
  'mt-cookie-box-1': { alt: 'Mia Torte cookies in gift boxes and a Diwali gift pack of assorted cookies', credit: null },
  'mt-oreo-cream-1': { alt: 'A cookies-and-cream cookie with chocolate sandwich-biscuit pieces and white chocolate chunks', credit: null },
  'ns-grain-texture': { alt: 'A close view of mixed whole grains, seeds and husks', credit: unsplash('Tahamie Farooqui', 'tami171091', 'GN3rHKNSMmc') },
};

export interface Sized { w: number; h: number; widths: number[]; lqip: string }
const sizes = generated as Record<string, Sized>;

export function imageSet(id: string) {
  const s = sizes[id];
  const base = import.meta.env.BASE_URL;
  if (!s) return null;
  return {
    src: `${base}images/${id}-${s.widths[Math.min(1, s.widths.length - 1)]}.webp`,
    srcSet: s.widths.map((w) => `${base}images/${id}-${w}.webp ${w}w`).join(', '),
    width: s.w,
    height: s.h,
    lqip: s.lqip,
    alt: images[id]?.alt ?? '',
  };
}
