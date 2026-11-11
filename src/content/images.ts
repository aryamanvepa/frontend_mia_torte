// =====================================================================
// IMAGE REGISTRY — alt text and credits for every photo on the site.
//
// All current photos are PLACEHOLDER stock photography from Unsplash
// (free to use under the Unsplash Licence: https://unsplash.com/license).
// They are not Torte Living's products. To replace one:
//   1. put the real photo in a folder, named <id>.jpg (e.g. mt-cookies-choc-chip-1.jpg)
//   2. npm run images -- <that folder>
//   3. update its entry below (alt text; set credit to null for your own photography)
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

export const images: Record<string, ImageInfo> = {
  'hero-cookies-bowl': { alt: 'Chocolate chip cookies piled in a parchment-lined bowl on a dark cloth', credit: unsplash('Mae Mu', 'picoftasty', 'kID9sxbJ3BQ') },
  'craft-flour-hands': { alt: 'A baker\'s hands dusting flour over a dark work table', credit: unsplash('Mae Mu', 'picoftasty', 'rgRbqFweGF0') },
  'craft-kneading': { alt: 'Hands kneading a ball of dough on a floured table', credit: unsplash('Skyler Ewing', 'skylerewing', '2uiZDQYTHBM') },
  'chocolate-cocoa': { alt: 'Dark chocolate and cocoa powder in a metal bowl', credit: unsplash('Monika Grabkowska', 'moniqa', 'jEu4F6oJtUQ') },
  'mt-cookies-choc-chip-1': { alt: 'Golden chocolate chip cookies stacked on parchment paper', credit: unsplash('Oleg Bersenev', 'olegbrsnv', 'UrvxNspQhCc') },
  'mt-cookies-choc-chip-2': { alt: 'A freshly baked chocolate chip cookie broken in half', credit: unsplash('Oleg Bersenev', 'olegbrsnv', 'nKFObFgq0jA') },
  'mt-cookies-choc-chip-3': { alt: 'Chocolate chip cookies laid out on a light table with chocolate pieces', credit: unsplash('Fernanda Martinez', 'fermtz05', 'P4EtUOqkKfc') },
  'category-brownies': { alt: 'A stack of fudgy chocolate brownies on a white plate', credit: unsplash('Anna Przepiorka', 'myphotoland', 'LjtviHokbr4') },
  'category-cakes': { alt: 'A slice of layered chocolate cake on a small plate in soft light', credit: unsplash('yiseul han', 'hanyiseul', '_K-yx6wIgt8') },
  'ns-atta-bowl': { alt: 'A bowl of fine flour with ears of wheat on a dark background', credit: unsplash('Roman Matveev', 'matveevr', 'quVArOn8-30') },
  'ns-atta-sack': { alt: 'A small cloth sack of flour with a scoop on a grey table', credit: unsplash('Olga Kudriavtseva', 'smakoladka', 'xw8pttN8MBg') },
  'category-dosa': { alt: 'A golden dosa served on a banana leaf with chutneys', credit: unsplash('Pavan Reddy', 'pavan_09', 'JJhZ34RRyfk') },
  'pantry-grains': { alt: 'Close-up of whole wheat grains', credit: unsplash('Maria Camila Tobón', 'mcamitobon', '7Fxkt2gfUqg') },
  'category-snacks': { alt: 'Glass display cases of savoury Indian snacks in warm light', credit: unsplash('atelierbyvineeth', 'atelierbyvineeth', 'OlElzH1Hn94') },
  'mt-gifting-box': { alt: 'An open dark gift box of assorted cookies lined with paper', credit: unsplash('César Cabrera', 'gaiostudio', 'xEH_fJlVs2Y') },
  'mt-seasonal-tarts': { alt: 'Small fruit tarts with berries, kiwi and glazed fruit on a dark surface', credit: unsplash('Caramel', 'caramel_works', 'K8z5FJUay74') },
  'ns-muesli-bowl': { alt: 'A white bowl of toasted granola with a spoon on a linen cloth', credit: unsplash('Elena Leya', 'foodistika', 'pqpW5wHweQo') },
  'ns-seeds-spoons': { alt: 'Spoons of seeds and ground grains laid on a sage-green surface', credit: unsplash('lucia tognacci', 'luciatognacci99', 'y3w8WZ6uJWI') },
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
