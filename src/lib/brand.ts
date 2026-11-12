import { useLocation } from 'react-router-dom';
import { brandList, brands, type Brand, type BrandCode, type Collection } from '../content/brands';
import { contentFor } from '../content/products';
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

/** Product content: its own entry, else its category's defaults. `images` is empty until real photos exist. */
export function itemContent(item: Pick<CatalogueItem, 'product' | 'category'>) {
  return contentFor(item.product, item.category);
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
