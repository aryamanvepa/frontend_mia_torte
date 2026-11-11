import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { Icon, Img, Reveal, Text } from '../components/ui';
import { miaTorte, mtHome, nsHome, nutriSampoorna, type Brand } from '../content/brands';
import { house, site } from '../content/site';
import { inCollection, itemContent, paths } from '../lib/brand';
import { rupees, titleOf } from '../lib/format';
import type { CatalogueItem } from '../lib/api';
import { useCatalogue } from '../state/store';
import { CatalogueStatus, GridSkeleton } from './Shop';

/** One card per product (smallest pack), featured first, sold-out last. */
function useFeatured(brand: Brand, n = 4) {
  const { items } = useCatalogue();
  return useMemo(() => {
    const seen = new Set<string>();
    return items
      .filter((i) => i.brand_code === brand.code)
      .sort((a, b) => Number(a.availability === 'sold_out') - Number(b.availability === 'sold_out')
        || Number(Boolean(itemContent(b).featured)) - Number(Boolean(itemContent(a).featured)) || a.pack_grams - b.pack_grams)
      .filter((i) => !seen.has(i.product) && seen.add(i.product))
      .slice(0, n);
  }, [items, brand.code, n]);
}

function Featured({ brand, eyebrow, title }: { brand: Brand; eyebrow: string; title: string }) {
  const { status } = useCatalogue();
  const featured = useFeatured(brand);
  return (
    <section className="section wrap" aria-labelledby={`featured-${brand.code}`}>
      <Reveal className="section__head">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`featured-${brand.code}`} className="display display--md">{title}</h2>
        <Link to={paths.shop(brand)} className="arrow-link">Shop {brand.name} <Icon name="arrow" size={18} /></Link>
      </Reveal>
      {status === 'loading' && <GridSkeleton n={3} />}
      {status === 'error' && <CatalogueStatus />}
      {status === 'ready' && (
        <div className="grid grid--feature">
          {featured.map((i, n) => <Reveal key={i.code} delay={n * 80}><ProductCard code={i.code} /></Reveal>)}
        </div>
      )}
    </section>
  );
}

const countIn = (items: CatalogueItem[], brand: Brand) => (slug: string) =>
  items.filter((i) => i.brand_code === brand.code && inCollection(i, brand.collections.find((c) => c.slug === slug)!)).length;

// ================================================================ Torte Living landing
export function Landing() {
  useEffect(() => { document.title = 'Torte Living · Mia Torte & Nutri Sampoorna'; }, []);
  return (
    <>
      <h1 className="sr-only">Torte Living: Mia Torte and Nutri Sampoorna</h1>
      <section className="doors" aria-label="Our brands">
        <Link to={paths.home(miaTorte)} className="door door--mt theme-mt">
          <Img id="hero-cookies-bowl" eager className="door__img" sizes="(min-width: 900px) 56vw, 100vw" alt="" />
          <span className="door__body">
            <span className="door__kicker">{house.doors.MT.kicker}</span>
            <span className="door__name">Mia Torte</span>
            <span className="door__line">{house.doors.MT.line}</span>
            <span className="door__cta">{house.doors.MT.cta} <Icon name="arrow" size={18} /></span>
          </span>
        </Link>
        <Link to={paths.home(nutriSampoorna)} className="door door--ns theme-ns">
          <span className="door__frame"><Img id="ns-seeds-spoons" eager className="door__img" sizes="(min-width: 900px) 40vw, 100vw" alt="" /></span>
          <span className="door__body">
            <span className="door__kicker">{house.doors.NS.kicker}</span>
            <span className="door__name">Nutri Sampoorna</span>
            <span className="door__line">{house.doors.NS.line}</span>
            <span className="door__cta">{house.doors.NS.cta} <Icon name="arrow" size={18} /></span>
          </span>
        </Link>
      </section>

      <section className="house wrap" aria-labelledby="house-h">
        <Reveal className="house__intro">
          <p className="eyebrow">{house.eyebrow}</p>
          <h2 id="house-h" className="display display--lg">{house.title.split('\n').map((l, i) => <span key={i} className="hero__line">{i === 1 ? <em>{l}</em> : l}</span>)}</h2>
          <p className="lede">{house.intro}</p>
        </Reveal>
        <ul className="beliefs">
          {house.beliefs.map((b, i) => (
            <Reveal as="li" key={b.title} delay={i * 90} className="belief">
              <span className="belief__no">0{i + 1}</span>
              <h3 className="belief__title">{b.title}</h3>
              <p>{b.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="closing wrap">
        <Reveal className="closing__inner">
          <Icon name="hand" size={30} />
          <h2 className="display display--sm">One bag, both houses.</h2>
          <p>Shop Mia Torte and Nutri Sampoorna together and check out once. {site.codNote}</p>
          <div className="closing__cta">
            <Link to="/track" className="btn btn--line">Track an order</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

// ================================================================ Mia Torte
export function MtHome() {
  const brand = miaTorte;
  const { items } = useCatalogue();
  const count = countIn(items, brand);
  const hero = useFeatured(brand, 1)[0];
  useEffect(() => { document.title = `${brand.name} · ${brand.tagline}`; }, [brand]);

  return (
    <>
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow hero__in" style={{ animationDelay: '80ms' }}>{mtHome.heroEyebrow}</p>
          <h1 className="display hero__title hero__in" style={{ animationDelay: '160ms' }}>
            {mtHome.heroTitle.split('\n').map((l, i) => <span key={i} className="hero__line">{i === 1 ? <em>{l}</em> : l}</span>)}
          </h1>
          <p className="lede hero__in" style={{ animationDelay: '240ms' }}>{mtHome.heroText}</p>
          <div className="hero__cta hero__in" style={{ animationDelay: '320ms' }}>
            <Link to={paths.shop(brand)} className="btn btn--dark">Visit the counter</Link>
            <Link to={paths.story(brand)} className="btn btn--line">Our story</Link>
          </div>
        </div>
        <div className="hero__media">
          <Img id="hero-cookies-bowl" eager sizes="(min-width: 900px) 52vw, 100vw" className="hero__img" />
          {hero && (
            <Link to={paths.product(hero)} className="hero__chip">
              <span className="hero__chip-label">On the counter</span>
              <span className="hero__chip-name">{titleOf(hero)}</span>
              <span className="hero__chip-price">{rupees(hero.price)} <Icon name="arrow" size={16} /></span>
            </Link>
          )}
        </div>
      </section>

      <section className="manifesto" aria-label="Our approach">
        <Reveal className="wrap manifesto__inner">
          <p className="manifesto__quote">{mtHome.manifesto}</p>
        </Reveal>
      </section>

      <Featured brand={brand} eyebrow={mtHome.featuredEyebrow} title={mtHome.featuredTitle} />

      <section className="story" aria-labelledby="story-h">
        <Reveal className="story__media"><Img id="craft-flour-hands" sizes="(min-width: 900px) 45vw, 100vw" /></Reveal>
        <Reveal className="story__text" delay={120}>
          <p className="eyebrow eyebrow--light">{mtHome.storyEyebrow}</p>
          <h2 id="story-h" className="display display--md">{mtHome.storyTitle}</h2>
          <p className="lede">{mtHome.storyText}</p>
          <Link to={paths.story(brand)} className="arrow-link arrow-link--light">Read our story <Icon name="arrow" size={18} /></Link>
        </Reveal>
      </section>

      <section className="section wrap" aria-labelledby="cat-h">
        <Reveal className="section__head">
          <p className="eyebrow">{mtHome.repertoireEyebrow}</p>
          <h2 id="cat-h" className="display display--md">{mtHome.repertoireTitle}</h2>
        </Reveal>
        <ul className="cats cats--4">
          {brand.collections.map((c, n) => {
            const k = count(c.slug);
            return (
              <Reveal as="li" key={c.slug} delay={(n % 4) * 80} className="cat">
                <Link to={paths.collection(brand, c)} className="cat__link" aria-label={`${c.title}${k ? '' : ', coming soon'}`}>
                  <Img id={c.image} sizes="(min-width: 900px) 24vw, 50vw" className="cat__img" />
                  <span className="cat__body">
                    <span className="cat__brand">{k ? `${k} ${k === 1 ? 'creation' : 'creations'}` : 'Coming soon'}</span>
                    <span className="cat__name">{c.title}</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section className="promises" aria-label="How we bake">
        <ul className="wrap promises__list">
          {mtHome.principles.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 90} className="promise">
              <span className="promise__no">0{i + 1}</span>
              <h2 className="promise__title">{p.title}</h2>
              <Text as="p" copy={p.text} />
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="bespoke" aria-labelledby="bespoke-h">
        <div className="wrap bespoke__grid">
          <Reveal className="bespoke__media"><Img id="mt-seasonal-tarts" sizes="(min-width: 900px) 40vw, 100vw" /></Reveal>
          <Reveal className="bespoke__text" delay={100}>
            <p className="eyebrow">{mtHome.bespokeEyebrow}</p>
            <h2 id="bespoke-h" className="display display--md">{mtHome.bespokeTitle}</h2>
            <Text as="p" className="lede" copy={mtHome.bespokeText} />
            <div className="hero__cta">
              <Link to={paths.contact(brand)} className="btn btn--dark">Enquire</Link>
              <Link to={paths.collection(brand, brand.collections[2])} className="btn btn--line">Gifting</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// ================================================================ Nutri Sampoorna
export function NsHome() {
  const brand = nutriSampoorna;
  const { items } = useCatalogue();
  const count = countIn(items, brand);
  useEffect(() => { document.title = `${brand.name} · ${brand.tagline}`; }, [brand]);

  return (
    <>
      <section className="ns-hero wrap">
        <div className="ns-hero__text">
          <p className="eyebrow hero__in" style={{ animationDelay: '80ms' }}>{nsHome.heroEyebrow}</p>
          <h1 className="display ns-hero__title hero__in" style={{ animationDelay: '160ms' }}>
            {nsHome.heroTitle.split('\n').map((l, i) => <span key={i} className="hero__line">{i === 1 ? <em>{l}</em> : l}</span>)}
          </h1>
          <p className="lede hero__in" style={{ animationDelay: '240ms' }}>{nsHome.heroText}</p>
          <div className="hero__cta hero__in" style={{ animationDelay: '320ms' }}>
            <Link to={paths.shop(brand)} className="btn btn--dark">Explore the shelf</Link>
            <Link to={paths.story(brand)} className="btn btn--line">Our philosophy</Link>
          </div>
        </div>
        <div className="ns-hero__media hero__in" style={{ animationDelay: '200ms' }}>
          <Img id="ns-atta-bowl" eager sizes="(min-width: 900px) 42vw, 100vw" />
        </div>
      </section>

      <section className="index wrap" aria-labelledby="index-h">
        <Reveal className="section__head">
          <p className="eyebrow">{nsHome.shelfEyebrow}</p>
          <h2 id="index-h" className="display display--md">{nsHome.shelfTitle}</h2>
        </Reveal>
        <ol className="index__list">
          {brand.collections.map((c, n) => {
            const k = count(c.slug);
            return (
              <Reveal as="li" key={c.slug} delay={n * 60}>
                <Link to={paths.collection(brand, c)} className="index__row">
                  <span className="index__no">{String(n + 1).padStart(2, '0')}</span>
                  <span className="index__thumb"><Img id={c.image} sizes="120px" alt="" /></span>
                  <span className="index__main">
                    <span className="index__title">{c.title}</span>
                    <span className="index__intro">{c.intro}</span>
                  </span>
                  <span className="index__count">{k ? `${k} ${k === 1 ? 'product' : 'products'}` : 'In development'}</span>
                  <Icon name="arrow" size={20} className="index__arrow" />
                </Link>
              </Reveal>
            );
          })}
        </ol>
      </section>

      <Featured brand={brand} eyebrow={nsHome.featuredEyebrow} title={nsHome.featuredTitle} />

      <section className="band" aria-labelledby="band-h">
        <Img id="ns-grain-texture" sizes="100vw" className="band__img" alt="" />
        <Reveal className="band__card">
          <h2 id="band-h" className="display display--md">{nsHome.bandTitle}</h2>
          <p>{nsHome.bandText}</p>
          <Link to={paths.story(brand)} className="arrow-link">Our philosophy <Icon name="arrow" size={18} /></Link>
        </Reveal>
      </section>

      <section className="section wrap" aria-labelledby="principles-h">
        <Reveal className="section__head">
          <h2 id="principles-h" className="display display--md">{nsHome.principlesTitle}</h2>
        </Reveal>
        <ul className="principles">
          {nsHome.principles.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 70} className="principle">
              <span className="principle__no">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="principle__title">{p.title}</h3>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="library" aria-labelledby="library-h">
        <div className="wrap">
          <Reveal className="section__head">
            <p className="eyebrow">{nsHome.libraryEyebrow}</p>
            <h2 id="library-h" className="display display--md">{nsHome.libraryTitle}</h2>
            <p className="lede">{nsHome.libraryIntro}</p>
          </Reveal>
          <ul className="library__grid">
            {nsHome.library.map((g, i) => (
              <Reveal as="li" key={g.name} delay={(i % 3) * 70} className="grain">
                <h3 className="grain__name">{g.name}</h3>
                <p className="grain__also">{g.also}</p>
                <p className="grain__text">{g.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
