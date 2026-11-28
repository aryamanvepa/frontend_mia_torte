import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { Icon, Img, Reveal } from '../components/ui';
import { storeCategories, storeHome } from '../content/store';
import { publishedTestimonials } from '../content/testimonials';
import { bestsellers, paths } from '../lib/brand';
import { rupees } from '../lib/format';
import { organisationLd, snippet, useSeo } from '../lib/seo';
import { useCatalogue } from '../state/store';
import { CatalogueStatus, GridSkeleton } from './Shop';

const lines = (t: string) => t.split('\n').map((l, i) => <span key={i} className="hero__line">{l}</span>);

/**
 * The store's home page (2026-11-28): a bright full-width hero, the four collections (each with
 * "Shop now"), the curated bestsellers in a scrolling row, then customer testimonials (only once
 * real, permitted ones exist: content/testimonials.ts). Nothing else, then the footer.
 */
export function StoreHome() {
  const { items, shipping } = useCatalogue();
  useSeo({
    title: 'Torte Living · Cookies, better snacks and everyday staples',
    description: snippet(`${storeHome.heroTitle.replace('\n', ' ')} ${storeHome.heroText}`),
    // No image: shares use the brand card (La Mia Torte logo + Torte Living), see SHARE_CARD in lib/seo.
    jsonLd: organisationLd,
  });
  const best = useMemo(() => bestsellers(items, 10), [items]);

  return (
    <>
      {/* 1 · Hero: the photo across the top half of the screen, the message in a frosted cream box */}
      <section className="home-hero" aria-labelledby="home-hero-h">
        <Img id="mt-cookie-box-1" eager sizes="100vw" className="home-hero__img" />
        <div className="wrap home-hero__inner">
          <div className="home-hero__box hero__in">
            <h1 id="home-hero-h" className="display home-hero__title">{lines(storeHome.heroTitle)}</h1>
            <p className="home-hero__text">{storeHome.heroText}</p>
            <div className="hero__cta">
              <Link to={paths.shop()} className="btn btn--terracotta">Shop now</Link>
              <Link to={paths.bestsellers()} className="btn btn--line">Bestsellers</Link>
            </div>
            {/* Trust line: facts only (the shop's own delivery and payment rules), never review counts. */}
            <p className="home-hero__trust">
              Cash on delivery{shipping ? <> · Free delivery over {rupees(shipping.free_above)}</> : null}
            </p>
          </div>
        </div>
      </section>

      {/* 2 · Collections, each with its own Shop now */}
      <section className="section section--tight wrap" aria-labelledby="collections-h">
        <Reveal className="section__head"><h2 id="collections-h" className="display display--md">{storeHome.cravingTitle}</h2></Reveal>
        <ul className="cats cats--4 cats--cta">
          {storeCategories.map((c, n) => (
            <Reveal as="li" key={c.slug} delay={n * 70} className="cat">
              <Link to={paths.category(c)} className="cat__link">
                <Img id={c.image} sizes="(min-width: 900px) 24vw, 50vw" className="cat__img" />
                <span className="cat__body">
                  <span className="cat__brand">{c.title}</span>
                  <span className="cat__name">{c.craving}</span>
                  <span className="btn btn--terracotta btn--sm cat__cta" aria-hidden="true">Shop now</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* 3 · Bestsellers: Torte Living's curated order, in a row that scrolls */}
      <section className="section section--tight wrap" aria-labelledby="best-h">
        <Reveal className="section__head">
          <h2 id="best-h" className="display display--md">{storeHome.bestsellersTitle}</h2>
          <Link to={paths.bestsellers()} className="arrow-link">See all bestsellers <Icon name="arrow" size={18} /></Link>
        </Reveal>
        <ScrollRow items={best} label="Bestsellers" />
      </section>

      {/* 4 · Testimonials: social proof right before the decision. Hidden until real, permitted entries exist. */}
      {publishedTestimonials.length > 0 && (
        <section className="section section--tight wrap testimonials" aria-labelledby="testimonials-h">
          <Reveal className="section__head"><h2 id="testimonials-h" className="display display--md">What our customers say</h2></Reveal>
          <ul className="testimonials__list">
            {publishedTestimonials.map((t) => (
              <li key={`${t.firstName}-${t.date}`} className="testimonial">
                <blockquote><p>“{t.quote}”</p></blockquote>
                <p className="testimonial__by">{t.firstName}, {t.city}</p>
                <p className="testimonial__meta">{t.product} · via {t.source}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

/** A horizontal row of product cards that scrolls on every screen: swipe, trackpad, the arrow buttons, or the keyboard. */
function ScrollRow({ items, label }: { items: ReturnType<typeof bestsellers>; label: string }) {
  const { status } = useCatalogue();
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [items.length]);
  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  if (status === 'loading') return <GridSkeleton n={4} />;
  if (status === 'error') return <CatalogueStatus />;
  return (
    <div className="scrollrow">
      <button type="button" className="scrollrow__btn scrollrow__btn--prev" onClick={() => page(-1)} disabled={edge.start} aria-label={`Previous ${label.toLowerCase()}`}>
        <Icon name="back" size={20} />
      </button>
      {/* Focusable so arrow keys scroll it; each card's links are reachable with Tab as usual. */}
      <ul ref={ref} className="rail rail--scroll" aria-label={label} tabIndex={0} onScroll={update}>
        {items.map((i) => <li key={i.code}><ProductCard code={i.code} /></li>)}
      </ul>
      <button type="button" className="scrollrow__btn scrollrow__btn--next" onClick={() => page(1)} disabled={edge.end} aria-label={`Next ${label.toLowerCase()}`}>
        <Icon name="arrow" size={20} />
      </button>
    </div>
  );
}
