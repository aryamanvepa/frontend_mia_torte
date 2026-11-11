import { Link } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { Icon, Img, Reveal, Text } from '../components/ui';
import { categories, contentFor } from '../content/products';
import { brands, home } from '../content/site';
import { rupees, titleOf } from '../lib/format';
import { useCatalogue } from '../state/store';
import { CatalogueStatus, GridSkeleton } from './Shop';

export default function Home() {
  const { items, status } = useCatalogue();
  // One card per product (the first pack size), featured first, patisserie before pantry.
  const seen = new Set<string>();
  const featured = [...items]
    .sort((a, b) => Number(Boolean(contentFor(b.code, b.category).featured)) - Number(Boolean(contentFor(a.code, a.category).featured)))
    .filter((i) => i.availability !== 'sold_out' && !seen.has(i.brand_code + i.product) && seen.add(i.brand_code + i.product))
    .slice(0, 4);
  const hero = items.find((i) => i.brand_code === 'MT' && i.availability !== 'sold_out');
  const pantry = items.filter((i) => i.brand_code === 'NS').slice(0, 3);
  const countIn = (cat: string) => items.filter((i) => i.category === cat).length;

  return (
    <>
      {/* ------------------------------------------------ hero */}
      <section className="hero">
        <div className="hero__text wrap-l">
          <p className="eyebrow hero__in" style={{ animationDelay: '80ms' }}>{home.heroEyebrow}</p>
          <h1 className="display hero__title hero__in" style={{ animationDelay: '160ms' }}>
            {home.heroTitle.split('\n').map((l, i) => <span key={i} className="hero__line">{i === 1 ? <em>{l}</em> : l}</span>)}
          </h1>
          <Text as="p" className="lede hero__in" copy={home.heroText} />
          <div className="hero__cta hero__in" style={{ animationDelay: '320ms' }}>
            <Link to="/shop?brand=MT" className="btn btn--dark">Shop the patisserie</Link>
            <Link to="/shop?brand=NS" className="btn btn--line">Visit the pantry</Link>
          </div>
        </div>
        <div className="hero__media">
          <Img id="hero-cookies-bowl" eager sizes="(min-width: 900px) 52vw, 100vw" className="hero__img" />
          {hero && (
            <Link to={`/product/${hero.code}`} className="hero__chip">
              <span className="hero__chip-label">Fresh this week</span>
              <span className="hero__chip-name">{titleOf(hero)}</span>
              <span className="hero__chip-price">{rupees(hero.price)} <Icon name="arrow" size={16} /></span>
            </Link>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ promises */}
      <section className="promises" aria-label="Our promises">
        <ul className="wrap promises__list">
          {home.promises.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 90} className="promise">
              <span className="promise__no">0{i + 1}</span>
              <h2 className="promise__title">{p.title}</h2>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------ featured */}
      <section className="section wrap" aria-labelledby="featured-h">
        <Reveal className="section__head">
          <p className="eyebrow">The collection</p>
          <h2 id="featured-h" className="display display--md">Made in small batches</h2>
          <Link to="/shop" className="arrow-link">Shop everything <Icon name="arrow" size={18} /></Link>
        </Reveal>
        {status === 'loading' && <GridSkeleton n={3} />}
        {status === 'error' && <CatalogueStatus />}
        {status === 'ready' && (
          <div className="grid grid--feature">
            {featured.map((i, n) => <Reveal key={i.code} delay={n * 80}><ProductCard code={i.code} /></Reveal>)}
          </div>
        )}
      </section>

      {/* ------------------------------------------------ story */}
      <section className="story" aria-labelledby="story-h">
        <Reveal className="story__media"><Img id="craft-flour-hands" sizes="(min-width: 900px) 45vw, 100vw" /></Reveal>
        <Reveal className="story__text" delay={120}>
          <p className="eyebrow eyebrow--light">{home.storyEyebrow}</p>
          <h2 id="story-h" className="display display--md">{home.storyTitle}</h2>
          <Text as="p" className="lede" copy={home.storyText} />
          <Link to="/about" className="arrow-link arrow-link--light">Read our story <Icon name="arrow" size={18} /></Link>
        </Reveal>
      </section>

      {/* ------------------------------------------------ categories */}
      <section className="section wrap" aria-labelledby="cat-h">
        <Reveal className="section__head">
          <p className="eyebrow">Browse</p>
          <h2 id="cat-h" className="display display--md">Something for every table</h2>
        </Reveal>
        <ul className="cats">
          {Object.entries(categories).map(([name, c], n) => {
            const count = countIn(name);
            const brand = ['Atta', 'Dosa & batter mixes', 'Snacks'].includes(name) ? brands.NS.name : brands.MT.name;
            return (
              <Reveal as="li" key={name} delay={(n % 3) * 80} className="cat">
                <Link to={count ? `/shop?category=${encodeURIComponent(name)}` : '/shop'} className="cat__link" aria-label={`${name}${count ? '' : ', coming soon'}`}>
                  <Img id={c.image} sizes="(min-width: 900px) 30vw, 50vw" className="cat__img" />
                  <span className="cat__body">
                    <span className="cat__brand">{brand}</span>
                    <span className="cat__name">{name}</span>
                    <span className="cat__line">{count ? c.line : 'Coming soon'}</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------ pantry */}
      <section className="pantry" aria-labelledby="pantry-h">
        <div className="wrap pantry__grid">
          <Reveal className="pantry__intro">
            <p className="eyebrow">{brands.NS.name} · {brands.NS.short}</p>
            <h2 id="pantry-h" className="display display--md">{home.pantryTitle}</h2>
            <Text as="p" className="lede" copy={home.pantryText} />
            <Link to="/shop?brand=NS" className="btn btn--line">Shop the pantry</Link>
          </Reveal>
          <Reveal className="pantry__media" delay={100}><Img id="pantry-grains" sizes="(min-width: 900px) 40vw, 100vw" /></Reveal>
        </div>
        {pantry.length > 0 && (
          <div className="wrap grid grid--pantry">
            {pantry.map((i, n) => <Reveal key={i.code} delay={n * 80}><ProductCard code={i.code} /></Reveal>)}
          </div>
        )}
      </section>

      {/* ------------------------------------------------ closing */}
      <section className="closing wrap">
        <Reveal className="closing__inner">
          <Icon name="truck" size={32} />
          <h2 className="display display--sm">Pay when it arrives.</h2>
          <p>Order today and pay on delivery. Already ordered? Follow it with your order number and phone.</p>
          <div className="closing__cta">
            <Link to="/shop" className="btn btn--dark">Start shopping</Link>
            <Link to="/track" className="btn btn--line">Track an order</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
