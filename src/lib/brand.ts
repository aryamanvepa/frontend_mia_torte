import { useLocation } from 'react-router-dom';
import { brandList, brands, type Brand, type BrandCode, type Collection } from '../content/brands';
import { contentFor, FALLBACK_IMAGE } from '../content/products';
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

/** Product content with a sensible photo fallback (its collection's, else the brand's). */
export function itemContent(item: Pick<CatalogueItem, 'code' | 'brand_code' | 'category'>) {
  const fallback = collectionOf(item)?.image ?? FALLBACK_IMAGE[(item.brand_code as BrandCode) in FALLBACK_IMAGE ? (item.brand_code as BrandCode) : 'NS'];
  return contentFor(item.code, fallback);
}

/** Main photo for a bag line (the product may have left the catalogue). */
export function lineImage(code: string, item?: Pick<CatalogueItem, 'code' | 'brand_code' | 'category'> | null) {
  if (item) return itemContent(item).images[0];
  return contentFor(code, FALLBACK_IMAGE[code.startsWith('MT') ? 'MT' : 'NS']).images[0];
}
