import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { Icon, Img, Reveal } from '../components/ui';
import { brands, type BrandCode } from '../content/brands';
import { bestsellersPage, shopAllPage, storeCategories, typeLabel, type StoreCategory } from '../content/store';
import type { CatalogueItem } from '../lib/api';
import { trackViewItemList } from '../lib/analytics';
import { bestsellers, inStoreCategory, itemContent, oneCardPerProduct, paths } from '../lib/brand';
import { breadcrumbLd, snippet, useSeo } from '../lib/seo';
import { useCatalogue } from '../state/store';

const SORTS = { featured: 'Recommended', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', name: 'Name A–Z', new: 'Newest' } as const;
type Sort = keyof typeof SORTS;

// Filter buckets (§6). A product matches when any of its pack sizes does.
const PRICES = [
  { key: 'u150', label: 'Under ₹150', test: (p: number) => p < 150 },
  { key: '150-300', label: '₹150 – ₹300', test: (p: number) => p >= 150 && p < 300 },
  { key: '300-500', label: '₹300 – ₹500', test: (p: number) => p >= 300 && p < 500 },
  { key: 'o500', label: '₹500 and above', test: (p: number) => p >= 500 },
];
const SIZES = [
  { key: 's', label: 'Up to 100 g', test: (g: number) => g <= 100 },
  { key: 'm', label: '101 – 250 g', test: (g: number) => g > 100 && g <= 250 },
  { key: 'l', label: '251 – 500 g', test: (g: number) => g > 250 && g <= 500 },
  { key: 'xl', label: '1 kg and above', test: (g: number) => g >= 1000 },
];
const DIETS: Record<string, string> = { veg: 'Vegetarian', vegan: 'Vegan', egg: 'Contains egg', non_veg: 'Non-vegetarian' };

type Mode = 'all' | 'category' | 'bestsellers';

/** Shop All, a store category, or Bestsellers: filters, sorting, product grid with Quick Add, and related categories. */
export default function Listing({ mode, category }: { mode: Mode; category?: StoreCategory }) {
  const { items, status } = useCatalogue();
  const [params, setParams] = useSearchParams();
  const get = (k: string) => params.get(k) ?? '';
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };
  const sortParam = get('sort') as Sort;
  const sort: Sort = sortParam in SORTS ? sortParam : 'featured';

  const head = mode === 'category' && category
    ? { title: category.title, intro: category.intro, image: category.image, path: paths.category(category) }
    : mode === 'bestsellers'
      ? { title: bestsellersPage.title, intro: bestsellersPage.intro, image: bestsellersPage.image, path: paths.bestsellers() }
      : { title: shopAllPage.title, intro: shopAllPage.intro, image: undefined as string | undefined, path: paths.shop() };

  useSeo({
    title: `${head.title} · Torte Living`,
    description: snippet(head.intro),
    image: head.image,
    jsonLd: breadcrumbLd([{ name: 'Home', path: '/' }, { name: head.title, path: head.path }]),
  });

  // The products in this listing (every pack), before filters.
  const scope = useMemo(() => {
    if (mode === 'bestsellers') {
      const top = new Set(bestsellers(items, 50).map((i) => i.product));
      return items.filter((i) => top.has(i.product));
    }
    return mode === 'category' && category ? items.filter((i) => inStoreCategory(i, category)) : items;
  }, [items, mode, category]);

  const packsOf = useMemo(() => {
    const m = new Map<string, CatalogueItem[]>();
    for (const i of scope) m.set(i.product, [...(m.get(i.product) ?? []), i]);
    return m;
  }, [scope]);

  // Filter options with counts (only options that exist here).
  const productsWith = (pred: (packs: CatalogueItem[]) => boolean) => [...packsOf.values()].filter(pred).length;
  const types = [...new Set(scope.map((i) => typeLabel(i.category)))].sort();
  const brandCodes = [...new Set(scope.map((i) => i.brand_code))].filter((b) => b in brands).sort();
  const diets = [...new Set(scope.map((i) => i.details?.diet).filter(Boolean) as string[])];
  const priceOpts = PRICES.filter((p) => productsWith((ps) => ps.some((x) => p.test(x.price))));
  const sizeOpts = SIZES.filter((s) => productsWith((ps) => ps.some((x) => s.test(x.pack_grams))));

  const f = { type: get('type'), brand: get('brand'), price: get('price'), size: get('size'), diet: get('diet') };
  const active = Object.values(f).some(Boolean);

  const shown = useMemo(() => {
    const price = PRICES.find((p) => p.key === f.price);
    const size = SIZES.find((s) => s.key === f.size);
    const keep = [...packsOf.entries()].filter(([, ps]) => {
      const i = ps[0];
      if (f.type && typeLabel(i.category) !== f.type) return false;
      if (f.brand && i.brand_code !== f.brand) return false;
      if (f.diet && i.details?.diet !== f.diet) return false;
      if (price && !ps.some((x) => price.test(x.price))) return false;
      if (size && !ps.some((x) => size.test(x.pack_grams))) return false;
      return true;
    }).flatMap(([, ps]) => ps);
    const cards = oneCardPerProduct(keep);
    const rankOf = (i: CatalogueItem) => i.bestseller_rank ?? (itemContent(i).featured ? 1000 : 2000);
    const sold = (i: CatalogueItem) => (i.availability === 'sold_out' ? 1 : 0);
    return cards.sort((a, b) => sold(a) - sold(b) || (
      sort === 'price-asc' ? a.price - b.price
      : sort === 'price-desc' ? b.price - a.price
      : sort === 'name' ? a.product.localeCompare(b.product)
      : sort === 'new' ? Number(Boolean(b.is_new)) - Number(Boolean(a.is_new)) || a.product.localeCompare(b.product)
      : rankOf(a) - rankOf(b) || (a.category ?? '').localeCompare(b.category ?? '') || a.product.localeCompare(b.product)));
  }, [packsOf, f.type, f.brand, f.price, f.size, f.diet, sort]);

  useEffect(() => {
    if (status === 'ready' && shown.length) trackViewItemList(head.title, shown);
  }, [status, head.title, shown.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const others = storeCategories.filter((c) => c.slug !== category?.slug);
  const select = (key: keyof typeof f, label: string, options: { value: string; label: string }[]) => options.length > 1 || f[key] ? (
    <label className="filter">
      <span className="filter__label">{label}</span>
      <select value={f[key]} onChange={(e) => set(key, e.target.value)}>
        <option value="">All</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  ) : null;

  return (
    <div className="shop">
      <header className={`coll-head wrap ${head.image ? 'coll-head--media' : ''}`}>
        <div className="coll-head__text">
          <nav className="crumbs crumbs--inline" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {mode !== 'all' && <><span aria-hidden="true">/</span><Link to={paths.shop()}>Shop all</Link></>}
          </nav>
          <h1 className="display display--lg">{head.title}</h1>
          <p className="lede">{head.intro}</p>
        </div>
        {head.image && <div className="coll-head__media"><Img id={head.image} eager sizes="(min-width: 900px) 40vw, 100vw" /></div>}
      </header>

      <div className="filters wrap" role="region" aria-label="Filter and sort">
        <div className="filters__row">
          {select('type', 'Type', types.map((t) => ({ value: t, label: t })))}
          {select('brand', 'Brand', brandCodes.map((b) => ({ value: b, label: brands[b as BrandCode].name })))}
          {select('price', 'Price', priceOpts.map((p) => ({ value: p.key, label: p.label })))}
          {select('size', 'Pack size', sizeOpts.map((s) => ({ value: s.key, label: s.label })))}
          {diets.length > 0 && select('diet', 'Diet', diets.map((d) => ({ value: d, label: DIETS[d] ?? d })))}
          <label className="filter filter--sort">
            <span className="filter__label">Sort</span>
            <select value={sort} onChange={(e) => set('sort', e.target.value === 'featured' ? '' : e.target.value)}>
              {Object.entries(SORTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          {active && (
            <button type="button" className="linkbtn filters__clear" onClick={() => setParams(params.get('sort') ? { sort: params.get('sort')! } : {}, { replace: true })}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      <section className="wrap shop__results" aria-live="polite" aria-label={head.title}>
        {status === 'loading' && <GridSkeleton n={4} />}
        {status === 'error' && <CatalogueStatus />}
        {status === 'ready' && (shown.length ? (
          <>
            <p className="shop__count">{shown.length} {shown.length === 1 ? 'product' : 'products'}</p>
            <div className="grid">
              {shown.map((i, n) => <Reveal key={i.code} delay={(n % 4) * 60}><ProductCard code={i.code} priority={n < 2} /></Reveal>)}
            </div>
          </>
        ) : (
          <div className="soon">
            <p className="eyebrow">{active ? 'No matches' : 'Coming soon'}</p>
            <p className="soon__text">{active ? 'Nothing matches those filters. Try removing one.' : category?.empty ?? 'New products are on their way.'}</p>
            <div className="soon__cta">
              {active
                ? <button type="button" className="btn btn--line" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
                : <Link to={paths.shop()} className="btn btn--line">Shop all</Link>}
              <Link to="/contact" className="arrow-link">Write to us <Icon name="arrow" size={18} /></Link>
            </div>
          </div>
        ))}
      </section>

      <section className="wrap section section--tight related-cats" aria-labelledby="more-h">
        <h2 id="more-h" className="display display--sm">{mode === 'category' ? 'Explore more' : 'Shop by craving'}</h2>
        <ul className="related-cats__list">
          {(mode === 'category' ? others : storeCategories).map((c) => (
            <li key={c.slug}>
              <Link to={paths.category(c)} className="related-cat">
                <span className="related-cat__img"><Img id={c.image} sizes="120px" alt="" /></span>
                <span><strong>{c.title}</strong><small>{c.craving}</small></span>
                <Icon name="arrow" size={18} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function GridSkeleton({ n }: { n: number }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="card card--skeleton"><div className="sk sk--media" /><div className="sk sk--line" /><div className="sk sk--line sk--short" /></div>
      ))}
    </div>
  );
}

export function CatalogueStatus() {
  const { error, reload } = useCatalogue();
  return (
    <div className="empty" role="alert">
      <p className="display display--sm">The shop is taking a moment.</p>
      <p>{error ?? 'Please try again.'}</p>
      <button className="btn btn--line" onClick={reload}>Try again</button>
    </div>
  );
}
