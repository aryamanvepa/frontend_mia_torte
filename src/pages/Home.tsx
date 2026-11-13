import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { Icon, Img, Reveal } from '../components/ui';
import { brandList } from '../content/brands';
import { nourishmentTypes, storeCategories, storeHome } from '../content/store';
import { bestsellers, inStoreCategory, newProducts, oneCardPerProduct, paths } from '../lib/brand';
import { organisationLd, snippet, useSeo } from '../lib/seo';
import type { CatalogueItem } from '../lib/api';
import { useCatalogue } from '../state/store';
import { CatalogueStatus, GridSkeleton } from './Shop';

const cat = (slug: string) => storeCategories.find((c) => c.slug === slug)!;
const lines = (t: string) => t.split('\n').map((l, i) => <span key={i} className="hero__line">{l}</span>);

function Grid({ items, n = 4 }: { items: CatalogueItem[]; n?: number }) {
  const { status } = useCatalogue();
  if (status === 'loading') return <GridSkeleton n={n} />;
  if (status === 'error') return <CatalogueStatus />;
  return (
    <div className="grid grid--feature">
      {items.slice(0, n).map((i, k) => <Reveal key={i.code} delay={k * 70}><ProductCard code={i.code} /></Reveal>)}
    </div>
  );
}

function SectionHead({ eyebrow, title, to, cta }: { eyebrow?: string; title: string; to: string; cta: string }) {
  return (
    <Reveal className="section__head">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="display display--md">{lines(title)}</h2>
      <Link to={to} className="arrow-link">{cta} <Icon name="arrow" size={18} /></Link>
    </Reveal>
  );
}

/** The store's home page (Website Design Brief §5): appetite and discovery first, company story last. */
export function StoreHome() {
  const { items } = useCatalogue();
  useSeo({
    title: 'Torte Living · Cookies, better snacks and everyday staples',
    description: snippet(`${storeHome.heroTitle.replace('\n', ' ')} ${storeHome.heroText}`),
    image: 'craft-flour-hands',
    jsonLd: organisationLd,
  });

  const best = useMemo(() => bestsellers(items, 8), [items]);
  const cards = useMemo(() => oneCardPerProduct(items), [items]);
  const snacking = useMemo(() => cards.filter((i) => inStoreCategory(i, cat('better-snacking'))), [cards]);
  const nourishing = useMemo(() => cards.filter((i) => inStoreCategory(i, cat('everyday-nourishment'))), [cards]);
  const gifting = useMemo(() => cards.filter((i) => inStoreCategory(i, cat('gifting-discovery'))), [cards]);
  // New discoveries: the backend's "new" flag; until it exists, products not already shown above.
  const discoveries = useMemo(() => {
    const flagged = newProducts(items);
    if (flagged.length) return flagged;
    const shown = new Set([...best.slice(0, 4), ...snacking.slice(0, 4), ...nourishing.slice(0, 4)].map((i) => i.product));
    return cards.filter((i) => !shown.has(i.product));
  }, [items, cards, best, snacking, nourishing]);
  const nourishCounts = (type: string) => new Set(items.filter((i) => (i.category ?? '').toLowerCase() === type.toLowerCase()).map((i) => i.product)).size;

  return (
    <>
      {/* 2 · Main banner */}
      <section className="store-hero">
        <div className="store-hero__media"><Img id="craft-flour-hands" eager sizes="100vw" className="store-hero__img" alt="" /></div>
        <div className="wrap store-hero__inner">
          <div className="store-hero__card hero__in">
            <h1 className="display store-hero__title">{lines(storeHome.heroTitle)}</h1>
            <p className="lede">{storeHome.heroText}</p>
            <div className="hero__cta">
              <Link to={paths.shop()} className="btn btn--dark">Shop now</Link>
              <Link to={paths.bestsellers()} className="btn btn--line">Bestsellers</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · Shop by craving */}
      <section className="section section--tight wrap" aria-labelledby="craving-h">
        <Reveal className="section__head"><h2 id="craving-h" className="display display--md">{storeHome.cravingTitle}</h2></Reveal>
        <ul className="cats cats--4">
          {storeCategories.map((c, n) => (
            <Reveal as="li" key={c.slug} delay={n * 70} className="cat">
              <Link to={paths.category(c)} className="cat__link">
                <Img id={c.image} sizes="(min-width: 900px) 24vw, 50vw" className="cat__img" />
                <span className="cat__body">
                  <span className="cat__brand">{c.title}</span>
                  <span className="cat__name">{c.craving}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* 4 · Bestsellers */}
      <section className="section section--tight wrap" aria-label="Bestsellers">
        <SectionHead title={storeHome.bestsellersTitle} to={paths.bestsellers()} cta="See all bestsellers" />
        <Grid items={best} />
      </section>

      {/* 5 · Better Snacking */}
      <section className="feature-band" aria-labelledby="snack-h">
        <div className="wrap feature-band__grid">
          <Reveal className="feature-band__text">
            <p className="eyebrow eyebrow--light">{storeHome.snacking.eyebrow}</p>
            <h2 id="snack-h" className="display display--md">{lines(storeHome.snacking.title)}</h2>
            <p className="lede">{storeHome.snacking.text}</p>
            <Link to={paths.category(cat('better-snacking'))} className="btn btn--cream">Shop Better Snacking</Link>
          </Reveal>
          <div className="feature-band__products"><Grid items={snacking} n={4} /></div>
        </div>
      </section>

      {/* 6 · Everyday Nourishment */}
      <section className="section wrap" aria-labelledby="nourish-h">
        <Reveal className="section__head">
          <p className="eyebrow">{storeHome.nourishment.eyebrow}</p>
          <h2 id="nourish-h" className="display display--md">{storeHome.nourishment.title}</h2>
          <p className="lede">{storeHome.nourishment.text}</p>
        </Reveal>
        <ul className="type-links">
          {nourishmentTypes.map((t) => (
            <li key={t}>
              <Link to={`${paths.category(cat('everyday-nourishment'))}?type=${encodeURIComponent(t)}`} className="type-link">
                <span>{t}</span><small>{nourishCounts(t) || ''} {nourishCounts(t) === 1 ? 'product' : nourishCounts(t) ? 'products' : ''}</small>
                <Icon name="arrow" size={18} />
              </Link>
            </li>
          ))}
        </ul>
        <Grid items={nourishing} />
      </section>

      {/* 7 · New discoveries */}
      {discoveries.length > 0 && (
        <section className="section section--tight wrap" aria-label="New discoveries">
          <SectionHead eyebrow={storeHome.discoveries.eyebrow} title={storeHome.discoveries.title} to={paths.shop()} cta="Shop all" />
          <Grid items={discoveries} />
        </section>
      )}

      {/* 8 · Bundles and gifting */}
      <section className="gifting" aria-labelledby="gift-h">
        <div className="wrap gifting__grid">
          <Reveal className="gifting__media"><Img id="mt-gifting-box" sizes="(min-width: 900px) 40vw, 100vw" /></Reveal>
          <Reveal className="gifting__text" delay={80}>
            <p className="eyebrow">{storeHome.gifting.eyebrow}</p>
            <h2 id="gift-h" className="display display--md">{storeHome.gifting.title}</h2>
            <p className="lede">{storeHome.gifting.text}</p>
            {gifting.length > 0
              ? <Link to={paths.category(cat('gifting-discovery'))} className="btn btn--dark">Shop gifting</Link>
              : <p className="gifting__soon">{cat('gifting-discovery').empty} <Link to="/contact">Write to us</Link></p>}
          </Reveal>
        </div>
        {gifting.length > 0 && <div className="wrap"><Grid items={gifting} /></div>}
      </section>

      {/* 9 · Brand and company information */}
      <section className="section wrap company" aria-labelledby="company-h">
        <Reveal className="company__intro">
          <p className="eyebrow">{storeHome.company.eyebrow}</p>
          <h2 id="company-h" className="display display--sm">{storeHome.company.title}</h2>
          <p>{storeHome.company.text}</p>
          <Link to="/about" className="arrow-link">About Torte Living <Icon name="arrow" size={18} /></Link>
        </Reveal>
        <ul className="company__brands">
          {brandList.map((b) => (
            <li key={b.code}>
              <Link to={paths.brand(b)} className="brand-card">
                <span className="brand-card__name">{b.name}</span>
                <span className="brand-card__line">{b.tagline}</span>
                <span className="arrow-link">Our story <Icon name="arrow" size={16} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
