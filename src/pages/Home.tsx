import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { PackArt } from '../components/PackArt';
import { Icon, Img, PlaceholderTag, Reveal } from '../components/ui';
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

/**
 * The store's home page (Website Design Brief §5, iteration 2): banner → craving → bestsellers → a lead
 * Better Snacking feature → treats → everyday nourishment → new & seasonal → gifting → about. Products and
 * Quick Add in every section, so shoppers move from the home page straight into the basket.
 */
export function StoreHome() {
  const { items, statusOf } = useCatalogue();
  useSeo({
    title: 'Torte Living · Cookies, better snacks and everyday staples',
    description: snippet(`${storeHome.heroTitle.replace('\n', ' ')} ${storeHome.heroText}`),
    image: 'craft-flour-hands',
    jsonLd: organisationLd,
  });

  const best = useMemo(() => bestsellers(items, 8), [items]);
  const cards = useMemo(() => oneCardPerProduct(items), [items]);
  // Within a section, products you can buy now come first.
  const byStatus = (list: CatalogueItem[]) => [...list].sort((a, b) => Number(statusOf(a) !== 'available') - Number(statusOf(b) !== 'available'));
  const inCat = (slug: string) => byStatus(cards.filter((i) => inStoreCategory(i, cat(slug))));
  const snacking = useMemo(() => inCat('better-snacking').filter((i) => cat('better-snacking').categories.some((c) => c.toLowerCase() === (i.category ?? '').toLowerCase())), [cards]); // eslint-disable-line react-hooks/exhaustive-deps
  const treats = useMemo(() => inCat('indulgence-treats'), [cards]); // eslint-disable-line react-hooks/exhaustive-deps
  const nourishing = useMemo(() => inCat('everyday-nourishment'), [cards]); // eslint-disable-line react-hooks/exhaustive-deps
  const gifting = useMemo(() => inCat('gifting-discovery'), [cards]); // eslint-disable-line react-hooks/exhaustive-deps
  // New & seasonal: the backend's "new" flag; until it means something, products not already shown above.
  const discoveries = useMemo(() => {
    const flagged = newProducts(items);
    if (flagged.length) return flagged;
    const shown = new Set([...best.slice(0, 4), ...snacking.slice(0, 4), ...treats.slice(0, 4), ...nourishing.slice(0, 4)].map((i) => i.product));
    return cards.filter((i) => !shown.has(i.product));
  }, [items, cards, best, snacking, treats, nourishing]);
  const nourishCounts = (type: string) => new Set(items.filter((i) => (i.category ?? '').toLowerCase() === type.toLowerCase()).map((i) => i.product)).size;
  const sn = storeHome.snacking;
  const hero = snacking.find((i) => i.product === 'Peri Peri Trail Mix') ?? snacking[0];

  return (
    <>
      {/* 1 · Main banner */}
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

      {/* 2 · Shop by craving */}
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

      {/* 3 · Bestsellers */}
      <section className="section section--tight wrap" aria-label="Bestsellers">
        <SectionHead title={storeHome.bestsellersTitle} to={paths.bestsellers()} cta="See all bestsellers" />
        <Grid items={best} />
      </section>

      {/* 4 · Better Snacking: the lead category feature */}
      <section className="snack-feature" aria-labelledby="snack-h">
        <div className="wrap snack-feature__top">
          <Reveal className="snack-feature__media">
            {sn.image
              ? <Img id={sn.image} sizes="(min-width: 900px) 50vw, 100vw" alt="" />
              : <>
                  {hero && <PackArt variant="hero" product={hero.product} category={hero.category} brandCode={hero.brand_code} />}
                  <p className="snack-feature__shot">{sn.shot} <PlaceholderTag label="Photo needed" /></p>
                </>}
          </Reveal>
          <Reveal className="snack-feature__text" delay={80}>
            <p className="eyebrow eyebrow--light">{sn.eyebrow}</p>
            <h2 id="snack-h" className="display snack-feature__title">{lines(sn.title)}</h2>
            <p className="lede">{sn.text}</p>
            <ul className="snack-feature__pillars">
              {sn.pillars.map((p, n) => (
                <li key={p.title}><span className="snack-feature__n" aria-hidden="true">0{n + 1}</span><strong>{p.title}</strong><span>{p.text}</span></li>
              ))}
            </ul>
            <Link to={paths.category(cat('better-snacking'))} className="btn btn--cream">Shop Better Snacking <Icon name="arrow" size={18} /></Link>
          </Reveal>
        </div>
        <div className="wrap snack-feature__products">
          <Rail items={snacking} label="Better Snacking products" />
        </div>
      </section>

      {/* 5 · Indulgence & Treats */}
      <section className="section section--tight wrap" aria-label="Indulgence & Treats">
        <SectionHead eyebrow={storeHome.treats.eyebrow} title={storeHome.treats.title} to={paths.category(cat('indulgence-treats'))} cta={storeHome.treats.cta} />
        <Grid items={treats} />
      </section>

      {/* 6 · Everyday Nourishment */}
      <section className="section section--tight wrap nourish" aria-labelledby="nourish-h">
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

      {/* 7 · New & seasonal */}
      {discoveries.length > 0 && (
        <section className="section section--tight wrap" aria-label="New and seasonal">
          <SectionHead eyebrow={storeHome.discoveries.eyebrow} title={storeHome.discoveries.title} to={paths.shop()} cta="Shop all" />
          <Grid items={discoveries} />
        </section>
      )}

      {/* 8 · Gifting & bundles */}
      <section className="gifting" aria-labelledby="gift-h">
        <div className="wrap gifting__grid">
          <Reveal className="gifting__media"><Img id="mt-cookie-box-1" sizes="(min-width: 900px) 40vw, 100vw" /></Reveal>
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

      {/* 9 · About Torte Living: the food and the range; brand stories live on their own pages */}
      <section className="section wrap company company--single" aria-labelledby="company-h">
        <Reveal className="company__intro">
          <p className="eyebrow">{storeHome.company.eyebrow}</p>
          <h2 id="company-h" className="display display--md">{storeHome.company.title}</h2>
          <p className="lede">{storeHome.company.text}</p>
          <p className="company__links">
            <Link to="/about" className="arrow-link">Our story <Icon name="arrow" size={18} /></Link>
            <span className="company__brands-note">Our ranges: {brandList.map((b, n) => <span key={b.code}>{n > 0 && ' · '}<Link to={paths.brand(b)}>{b.name}</Link></span>)}</span>
          </p>
        </Reveal>
      </section>
    </>
  );
}

/** A horizontal row of product cards: swipe on phones, a grid on wide screens. */
function Rail({ items, label }: { items: CatalogueItem[]; label: string }) {
  const { status } = useCatalogue();
  if (status === 'loading') return <GridSkeleton n={4} />;
  if (status === 'error') return <CatalogueStatus />;
  return (
    <ul className="rail" aria-label={label}>
      {items.map((i, k) => <li key={i.code}><Reveal delay={(k % 4) * 60}><ProductCard code={i.code} /></Reveal></li>)}
    </ul>
  );
}
