import { useLocation } from 'react-router-dom';
import { brandList, type BrandCode } from '../content/brands';
import { storeCategories } from '../content/store';
import { inStoreCategory } from '../lib/brand';
import { useCatalogue } from './store';

/**
 * Which collection the current page belongs to, so the header logo, colours and switcher can follow it:
 * the brand page, a product's brand, the shop filtered to one brand, or a category whose products are all one brand.
 * null = the whole store (home, mixed categories, search, bag, checkout).
 */
export function useBrandContext(): BrandCode | null {
  const { pathname, search } = useLocation();
  const { byCode, items } = useCatalogue();
  const [, first, second] = pathname.split('/');
  const page = brandList.find((b) => b.slug === first);
  if (page) return page.code;
  if (first === 'product' && second) return (byCode.get(decodeURIComponent(second))?.brand_code as BrandCode) ?? null;
  if (first === 'shop') {
    const b = new URLSearchParams(search).get('brand');
    return brandList.find((x) => x.code === b)?.code ?? null;
  }
  const cat = storeCategories.find((c) => c.slug === first);
  if (cat && items.length) {
    const codes = new Set(items.filter((i) => inStoreCategory(i, cat)).map((i) => i.brand_code));
    return codes.size === 1 ? ([...codes][0] as BrandCode) : null;
  }
  return null;
}
