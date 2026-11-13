// =====================================================================
// SEARCH — across the whole catalogue (Website Design Brief §8).
// Matches product names, categories, brands, descriptions, ingredients and
// common synonyms, so "multigrain flour" finds the atta even though the
// product is called "Multigrain Superseed Atta". Runs in the browser over the
// live catalogue (small enough to search instantly). Add synonyms below.
// =====================================================================
import { copyText } from '../content/site';
import type { CatalogueItem } from './api';
import { itemContent, oneCardPerProduct, storeCategoriesOf } from './brand';

/** Words that mean the same thing to a shopper. Each group is matched both ways. */
const SYNONYMS: string[][] = [
  ['atta', 'flour', 'aata', 'ata', 'chakki'],
  ['multigrain', 'multi grain', 'mixed grain', 'mga'],
  ['millet', 'millets', 'siridhanya', 'ragi', 'jowar', 'bajra', 'foxtail'],
  ['ragi', 'finger millet', 'nachni', 'nachani', 'mandua'],
  ['jowar', 'sorghum', 'jonna'],
  ['bajra', 'pearl millet', 'sajje', 'kambu'],
  ['sattu', 'roasted gram', 'chana', 'gram flour', 'besan'],
  ['gluten free', 'gluten-free', 'glutenfree', 'gf'],
  ['dosa', 'dosai', 'crepe', 'pesarattu', 'batter', 'idli'],
  ['pesarattu', 'moong', 'green gram', 'mung'],
  ['instant', 'ready mix', 'quick'],
  ['chutney', 'podi', 'powder', 'gunpowder'],
  ['putana', 'pottukadalai', 'putnalu', 'roasted chana dal', 'dalia'],
  ['peanut', 'groundnut', 'moongphali', 'shengdana'],
  ['muesli', 'granola', 'cereal', 'breakfast', 'oats'],
  ['cookie', 'cookies', 'biscuit', 'biscuits'],
  ['brownie', 'brownies', 'fudge'],
  ['chocolate', 'choco', 'cocoa', 'choc'],
  ['mocha', 'coffee'],
  ['snack', 'snacks', 'namkeen', 'munchies', 'savoury', 'savory'],
  ['chips', 'crisps', 'wafers'],
  ['vegie', 'veggie', 'vegetable'],
  ['peri peri', 'piri piri', 'spicy', 'chilli', 'chili'],
  ['pudina', 'mint'],
  ['jeera', 'cumin'],
  ['pista', 'pistachio'],
  ['nuts', 'nut', 'dry fruits', 'almond', 'cashew'],
  ['trail mix', 'mixture', 'mix'],
  ['bean', 'beans', 'legume', 'rajma', 'soya'],
  ['gift', 'gifting', 'hamper', 'present', 'box'],
  ['strawberry', 'berry', 'berries'],
  ['orange', 'citrus'],
];

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** The query's words, each with its synonyms (multi-word phrases kept whole). */
function expand(query: string): string[][] {
  let q = ` ${norm(query)} `;
  const groups: string[][] = [];
  // Phrases first ("green gram", "gluten free"), so they aren't split into words.
  for (const group of SYNONYMS) {
    for (const term of group.filter((t) => t.includes(' '))) {
      if (q.includes(` ${term} `)) { groups.push([...new Set(group.map(norm))]); q = q.replace(` ${term} `, ' '); }
    }
  }
  for (const word of q.trim().split(' ').filter((w) => w.length > 1)) {
    const syn = SYNONYMS.filter((g) => g.some((t) => norm(t) === word || (word.length > 3 && norm(t).startsWith(word))));
    groups.push([...new Set([word, ...syn.flat().map(norm)])]);
  }
  return groups;
}

interface Doc { item: CatalogueItem; name: string; strong: string; body: string }

function docFor(item: CatalogueItem): Doc {
  const c = itemContent(item);
  const strong = [item.category, item.brand, ...storeCategoriesOf(item).map((s) => s.title), c.tagline].filter(Boolean).join(' ');
  const body = [c.intro && copyText(c.intro), c.ingredientsList && copyText(c.ingredientsList), item.details?.ingredients, item.details?.description, ...(c.notes ?? [])]
    .filter(Boolean).join(' ');
  return { item, name: norm(item.product), strong: norm(strong), body: norm(body) };
}

const has = (text: string, term: string) => (term.includes(' ') ? text.includes(term) : new RegExp(`\\b${term}`).test(text));

/** One result per product, best first. Every query word (or one of its synonyms) must match somewhere. */
export function search(items: CatalogueItem[], query: string): CatalogueItem[] {
  const groups = expand(query);
  if (!groups.length) return [];
  const scored: { item: CatalogueItem; score: number }[] = [];
  for (const doc of oneCardPerProduct(items).map(docFor)) {
    let score = 0;
    let all = true;
    for (const group of groups) {
      const word = group[0];
      let best = 0;
      for (const term of group) {
        const exact = term === word ? 1 : 0.7; // the word typed counts more than a synonym
        if (has(doc.name, term)) best = Math.max(best, 10 * exact);
        else if (has(doc.strong, term)) best = Math.max(best, 5 * exact);
        else if (has(doc.body, term)) best = Math.max(best, 2 * exact);
      }
      if (!best) { all = false; break; }
      score += best;
    }
    if (all) scored.push({ item: doc.item, score: score + (doc.item.availability === 'sold_out' ? 0 : 0.5) });
  }
  return scored.sort((a, b) => b.score - a.score || a.item.product.localeCompare(b.item.product)).map((s) => s.item);
}
