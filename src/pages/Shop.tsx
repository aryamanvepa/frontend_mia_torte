import { useEffect, useMemo } from 'react';
import { Link, NavLink, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { Icon, Img, Reveal } from '../components/ui';
import type { Brand, Collection } from '../content/brands';
import { inCollection, itemContent, paths } from '../lib/brand';
import { useCatalogue } from '../state/store';

const SORTS = { featured: 'Featured', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', name: 'Name' } as const;
type Sort = keyof typeof SORTS;

/** A brand's shop ("/mia-torte/shop") or one of its collections ("/mia-torte/gifting"). */
export default function BrandShop({ brand, collection }: { brand: Brand; collection?: Collection }) {
  const { items, status } = useCatalogue();
  const [params, setParams] = useSearchParams();
  const sort = ((params.get('sort') ?? 'featured') in SORTS ? params.get('sort') ?? 'featured' : 'featured') as Sort;
  const setSort = (v: string) => {
    const next = new URLSearchParams(params);
    if (v && v !== 'featured') next.set('sort', v); else next.delete('sort');
    setParams(next, { replace: true });
  };

  const title = collection?.title ?? brand.shop.title;
  useEffect(() => { document.title = `${title} · ${brand.name}`; }, [title, brand.name]);

  const brandItems = useMemo(() => items.filter((i) => i.brand_code === brand.code), [items, brand.code]);
  const shown = useMemo(() => {
    const list = collection ? brandItems.filter((i) => inCollection(i, collection)) : brandItems;
    const rank = (i: (typeof list)[number]) => (itemContent(i).featured ? 0 : 1);
    const avail = (a: string) => (a === 'sold_out' ? 1 : 0);
    return [...list].sort((a, b) => avail(a.availability) - avail(b.availability) || (
      sort === 'price-asc' ? a.price - b.price
      : sort === 'price-desc' ? b.price - a.price
      : sort === 'name' ? a.name.localeCompare(b.name)
      : rank(a) - rank(b) || a.product.localeCompare(b.product) || a.pack_grams - b.pack_grams));
  }, [brandItems, collection, sort]);
  const ready = brand.collections.filter((c) => brandItems.some((i) => inCollection(i, c)));

  return (
    <div className="shop">
      <header className={`coll-head wrap ${collection ? 'coll-head--media' : ''}`}>
        <div className="coll-head__text">
          <nav className="crumbs crumbs--inline" aria-label="Breadcrumb">
            <Link to={paths.home(brand)}>{brand.name}</Link>
            {collection && <><span aria-hidden="true">/</span><Link to={paths.shop(brand)}>{brand.shop.title}</Link></>}
          </nav>
          <h1 className="display display--lg">{title}</h1>
          <p className="lede">{collection?.intro ?? brand.shop.intro}</p>
        </div>
        {collection && <div className="coll-head__media"><Img id={collection.image} eager sizes="(min-width: 900px) 40vw, 100vw" /></div>}
      </header>

      <div className="filters wrap" role="region" aria-label="Collections and sorting">
        <nav className="chips" aria-label={`${brand.name} collections`}>
          <NavLink to={paths.shop(brand)} end className="chip">All</NavLink>
          {brand.collections.map((c) => <NavLink key={c.slug} to={paths.collection(brand, c)} className="chip">{c.title}</NavLink>)}
        </nav>
        {shown.length > 1 && (
          <label className="sort">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
        )}
      </div>

      <section className="wrap shop__results" aria-live="polite" aria-label={title}>
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
            <p className="eyebrow">{brand.theme === 'mt' ? 'In the kitchen' : 'In development'}</p>
            <p className="soon__text">{collection?.comingSoon ?? 'New products are on their way.'}</p>
            <div className="soon__cta">
              {ready.filter((c) => c.slug !== collection?.slug).slice(0, 2).map((c) => (
                <Link key={c.slug} to={paths.collection(brand, c)} className="btn btn--line">See {c.title}</Link>
              ))}
              <Link to={paths.contact(brand)} className="arrow-link">Write to us <Icon name="arrow" size={18} /></Link>
            </div>
          </div>
        ))}
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
