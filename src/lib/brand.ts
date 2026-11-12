import { useLocation } from 'react-router-dom';
import { brandList, brands, type Brand, type BrandCode, type Collection } from '../content/brands';
import { contentFor, NUTRITION_KEYS, type Dietary } from '../content/products';
import { draft } from '../content/site';
import type { CatalogueItem } from './api';

/** Which brand a URL belongs to: /mia-torte/… → Mia Torte, /nutri-sampoorna/… → Nutri Sampoorna, else null (house pages). */
export function brandFromPath(pathname: string): Brand | null {
  const seg = pathname.split('/')[1];
  return brandList.find((b) => b.slug === seg) ?? null;
}
export function useBrand(): Brand | null {
  return brandFromPath(useLocation().pathname);
}

export const brandOf = (code: string | null | undefined): Brand | null => (code ? brands[code as BrandCode] ?? null : null);

export const paths = {
  home: (b: Brand) => `/${b.slug}`,
  shop: (b: Brand) => `/${b.slug}/shop`,
  story: (b: Brand) => `/${b.slug}/${b.story.slug}`,
  contact: (b: Brand) => `/${b.slug}/contact`,
  collection: (b: Brand, c: Collection) => `/${b.slug}/${c.slug}`,
  product: (item: Pick<CatalogueItem, 'code' | 'brand_code'>) => {
    const b = brandOf(item.brand_code);
    return b ? `/${b.slug}/product/${item.code}` : `/product/${item.code}`;
  },
};

/** The brand collection a product belongs to, by its ops-app category. */
export function collectionOf(item: Pick<CatalogueItem, 'brand_code' | 'category'>): Collection | null {
  const b = brandOf(item.brand_code);
  if (!b || !item.category) return null;
  const cat = item.category.trim().toLowerCase();
  return b.collections.find((c) => c.categories.some((x) => x.toLowerCase() === cat)) ?? null;
}

export function inCollection(item: Pick<CatalogueItem, 'brand_code' | 'category'>, c: Collection) {
  return collectionOf(item)?.slug === c.slug;
}

const DIET: Record<string, Dietary> = { veg: 'veg', vegan: 'vegan', egg: 'egg', non_veg: 'non-veg' };
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ''));

/** "90 days", "about 6 months (180 days)" */
function shelfLifeText(days: number) {
  if (days >= 60 && days % 30 === 0) return `${days / 30} months (${days} days) from the date of packing`;
  return `${days} ${days === 1 ? 'day' : 'days'} from the date of packing`;
}

/**
 * Product content: its own entry, else its category's defaults, with the
 * label details from the ops app (Admin → Products) laid on top wherever they
 * are filled in. Until Torte Living marks them confirmed, those facts carry a
 * "Draft · confirm" tag. `images` is empty until real photos exist.
 */
export function itemContent(item: Pick<CatalogueItem, 'product' | 'category'> & { details?: CatalogueItem['details'] }) {
  const c = contentFor(item.product, item.category);
  const d = item.details;
  if (!d) return c;
  const fact = (v: string | null | undefined) => (v && v.trim() ? (d.confirmed ? v.trim() : draft(v.trim())) : undefined);
  const out = { ...c };
  out.intro = fact(d.description) ?? c.intro;
  out.ingredientsList = fact(d.ingredients) ?? c.ingredientsList;
  out.allergens = fact(d.allergens) ?? c.allergens;
  out.storage = fact(d.storage) ?? c.storage;
  if (d.shelf_life_days != null && d.shelf_life_days > 0) out.shelfLife = fact(shelfLifeText(d.shelf_life_days));
  if (d.diet && DIET[d.diet]) { out.dietary = DIET[d.diet]; out.dietaryDraft = !d.confirmed; }
  const n = d.nutrition_per_100g;
  if (n && Object.values(n).some((v) => v != null)) {
    out.nutrition = {
      basis: 'per 100 g',
      draft: !d.confirmed,
      rows: NUTRITION_KEYS
        .filter(([k, , mandatory]) => mandatory || n[k] != null)
        .map(([k, label]) => [label, n[k] != null ? fmt(Number(n[k])) : '—']),
    };
  }
  return out;
}

/** One card per product: its smallest pack that can still be bought, else its smallest pack. */
export function oneCardPerProduct<T extends Pick<CatalogueItem, 'product' | 'brand_code' | 'availability' | 'pack_grams'>>(items: T[]): T[] {
  const best = new Map<string, T>();
  for (const i of items) {
    const k = `${i.brand_code}|${i.product}`;
    const cur = best.get(k);
    const rank = (x: T) => (x.availability === 'sold_out' ? 1e9 : 0) + x.pack_grams;
    if (!cur || rank(i) < rank(cur)) best.set(k, i);
  }
  return [...best.values()];
}
