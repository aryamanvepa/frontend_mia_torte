import { useLocation } from 'react-router-dom';
import { brandList, brands, type Brand, type BrandCode } from '../content/brands';
import { storeCategories, type BuyingKind, type StoreCategory } from '../content/store';
import { contentFor, NUTRITION_KEYS, type Dietary } from '../content/products';
import { draft } from '../content/site';
import type { CatalogueItem } from './api';

export const brandOf = (code: string | null | undefined): Brand | null => (code ? brands[code as BrandCode] ?? null : null);

/** Brand page for a URL (/mia-torte, /nutri-sampoorna), else null. Kept for the brand pages only: the store is not split by brand. */
export function brandFromPath(pathname: string): Brand | null {
  const seg = pathname.split('/')[1];
  return brandList.find((b) => b.slug === seg) ?? null;
}
export function useBrand(): Brand | null {
  return brandFromPath(useLocation().pathname);
}

export const paths = {
  shop: () => '/shop',
  category: (c: Pick<StoreCategory, 'slug'>) => `/${c.slug}`,
  bestsellers: () => '/bestsellers',
  search: (q?: string) => (q ? `/search?q=${encodeURIComponent(q)}` : '/search'),
  brand: (b: Brand) => `/${b.slug}`,
  product: (item: Pick<CatalogueItem, 'code'>) => `/product/${item.code}`,
};

type CatItem = Pick<CatalogueItem, 'product' | 'category'>;

/** Every store category a product appears in (by its ops category, plus cross-listings). */
export function storeCategoriesOf(item: CatItem): StoreCategory[] {
  const cat = (item.category ?? '').trim().toLowerCase();
  return storeCategories.filter((c) => c.categories.some((x) => x.toLowerCase() === cat) || c.alsoIncludes?.includes(item.product));
}
/** The product's main store category (its own ops category), for breadcrumbs and labels. */
export function primaryCategoryOf(item: CatItem): StoreCategory | null {
  const cat = (item.category ?? '').trim().toLowerCase();
  return storeCategories.find((c) => c.categories.some((x) => x.toLowerCase() === cat)) ?? storeCategoriesOf(item)[0] ?? null;
}
export const inStoreCategory = (item: CatItem, c: StoreCategory) => storeCategoriesOf(item).some((x) => x.slug === c.slug);
export const buyingKindOf = (item: CatItem): BuyingKind => primaryCategoryOf(item)?.kind ?? 'sensory';

/** Bestsellers: ranked by the backend's sales rank when it provides one, else the hand-picked featured products. */
export function bestsellers<T extends CatalogueItem>(items: T[], n = 8): T[] {
  const cards = oneCardPerProduct(items);
  const ranked = cards.filter((i) => i.bestseller_rank != null).sort((a, b) => a.bestseller_rank! - b.bestseller_rank!);
  if (ranked.length >= Math.min(4, cards.length)) return ranked.slice(0, n);
  const featured = cards.filter((i) => itemContent(i).featured);
  return [...ranked, ...featured.filter((f) => !ranked.includes(f))].slice(0, n);
}
/**
 * The backend's is_new flag only means something when it singles out a few products. When about
 * half or more carry it (e.g. every product was created on the same day), it is ignored.
 */
export function newFlagMeaningful(items: CatalogueItem[]) {
  const products = new Set(items.map((i) => i.product)), flagged = new Set(items.filter((i) => i.is_new).map((i) => i.product));
  return flagged.size > 0 && flagged.size < products.size / 2;
}
export const isNew = (item: CatalogueItem, items: CatalogueItem[]) => Boolean(item.is_new) && newFlagMeaningful(items);
/** New products (backend's is_new flag), or none while the flag isn't meaningful. */
export const newProducts = <T extends CatalogueItem>(items: T[]) => (newFlagMeaningful(items) ? oneCardPerProduct(items).filter((i) => i.is_new) : []);

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
export function itemContent(item: Pick<CatalogueItem, 'product' | 'category'> & { details?: CatalogueItem['details']; images?: string[] }) {
  const base = contentFor(item.product, item.category);
  // Photos held in the backend replace the site's own (there are none yet: illustrations show instead).
  const c = item.images?.length ? { ...base, images: item.images } : base;
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
