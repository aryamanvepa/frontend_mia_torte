import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { Reveal } from '../components/ui';
import { contentFor } from '../content/products';
import { brands, type BrandCode } from '../content/site';
import { useCatalogue } from '../state/store';

const SORTS = { featured: 'Featured', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', name: 'Name' } as const;
type Sort = keyof typeof SORTS;

export default function Shop() {
  const { items, status } = useCatalogue();
  const [params, setParams] = useSearchParams();
  const brand = (params.get('brand') ?? '') as BrandCode | '';
  const category = params.get('category') ?? '';
  const sort = ((params.get('sort') ?? 'featured') in SORTS ? params.get('sort') ?? 'featured' : 'featured') as Sort;

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    if (k === 'brand') next.delete('category');
    setParams(next, { replace: true });
  };

  const brandItems = useMemo(() => items.filter((i) => !brand || i.brand_code === brand), [items, brand]);
  const cats = useMemo(() => [...new Set(brandItems.map((i) => i.category).filter(Boolean) as string[])], [brandItems]);
  const shown = useMemo(() => {
    const list = brandItems.filter((i) => !category || i.category === category);
    const rank = (code: string, cat: string | null) => (contentFor(code, cat).featured ? 0 : 1);
    const avail = (a: string) => (a === 'sold_out' ? 1 : 0);
    return [...list].sort((a, b) => avail(a.availability) - avail(b.availability) || (
      sort === 'price-asc' ? a.price - b.price
      : sort === 'price-desc' ? b.price - a.price
      : sort === 'name' ? a.name.localeCompare(b.name)
      : rank(a.code, a.category) - rank(b.code, b.category) || a.brand_code.localeCompare(b.brand_code) || a.pack_grams - b.pack_grams));
  }, [brandItems, category, sort]);

  const b = brand && brands[brand];
  const title = category || (b ? b.name : 'The shop');
  const intro = b ? b.blurb : 'Patisserie from Mia Torte and wholesome staples from Nutri Sampoorna, all from one kitchen.';

  return (
    <div className={`shop ${brand === 'NS' ? 'shop--ns' : ''}`}>
      <header className="page-head wrap">
        <p className="eyebrow">{b ? b.short : 'Shop'}</p>
        <h1 className="display display--lg">{title}</h1>
        <p className="lede page-head__lede">{intro}</p>
      </header>

      <div className="filters wrap" role="region" aria-label="Filter products">
        <div className="seg" role="group" aria-label="Brand">
          {[['', 'All'], ['MT', brands.MT.name], ['NS', brands.NS.name]].map(([v, l]) => (
            <button key={v} aria-pressed={brand === v} className={`seg__btn ${brand === v ? 'is-on' : ''}`} onClick={() => set('brand', v)}>{l}</button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Category">
          <button className={`chip ${!category ? 'is-on' : ''}`} aria-pressed={!category} onClick={() => set('category', '')}>All</button>
          {cats.map((c) => (
            <button key={c} className={`chip ${category === c ? 'is-on' : ''}`} aria-pressed={category === c} onClick={() => set('category', category === c ? '' : c)}>{c}</button>
          ))}
        </div>
        <label className="sort">
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => set('sort', e.target.value === 'featured' ? '' : e.target.value)}>
            {Object.entries(SORTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
      </div>

      <section className="wrap shop__results" aria-live="polite">
        {status === 'loading' && <GridSkeleton n={6} />}
        {status === 'error' && <CatalogueStatus />}
        {status === 'ready' && (
          <>
            <p className="shop__count">{shown.length} {shown.length === 1 ? 'product' : 'products'}</p>
            {shown.length ? (
              <div className="grid">
                {shown.map((i, n) => <Reveal key={i.code} delay={(n % 4) * 60}><ProductCard code={i.code} priority={n < 2} /></Reveal>)}
              </div>
            ) : (
              <div className="empty">
                <p className="display display--sm">Nothing here just yet.</p>
                <p>New bakes and pantry staples are on their way.</p>
                <button className="btn btn--line" onClick={() => setParams({}, { replace: true })}>Show everything</button>
              </div>
            )}
          </>
        )}
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
