import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { useCatalogue } from '../state/store';
import { Icon, Img, PlaceholderTag, Reveal, Text } from '../components/ui';
import { brandList, miaTorte, nutriSampoorna, type Brand } from '../content/brands';
import { images } from '../content/images';
import { SHOW_PLACEHOLDER_FLAGS, house, pages, site } from '../content/site';
import { oneCardPerProduct, paths } from '../lib/brand';
import { breadcrumbLd, snippet, useSeo } from '../lib/seo';
import { copyText } from '../content/site';

// ---------------------------------------------------------------- brand page (story + its products)
export function BrandPage({ brand }: { brand: Brand }) {
  const s = brand.story;
  const { items } = useCatalogue();
  const products = useMemo(() => oneCardPerProduct(items.filter((i) => i.brand_code === brand.code)), [items, brand.code]);
  useSeo({ title: `${brand.name} · ${s.label} · Torte Living`, description: snippet(`${brand.blurb} ${s.intro}`), image: s.image, type: 'article',
    jsonLd: breadcrumbLd([{ name: 'Home', path: '/' }, { name: brand.name, path: paths.brand(brand) }]) });
  return (
    <article className="info info--story">
      <header className="page-head page-head--narrow wrap">
        <p className="eyebrow">{brand.name} · {brand.descriptor}</p>
        <h1 className="display display--lg">{s.title}</h1>
        <p className="lede">{s.intro}</p>
      </header>
      <Reveal className="wrap info__hero"><Img id={s.image} eager sizes="(min-width: 900px) 80vw, 100vw" /></Reveal>
      <div className="wrap info__body info__body--story">
        {s.sections.map((sec, n) => (
          <Reveal as="section" key={sec.heading} className="info__section">
            <span className="info__no" aria-hidden="true">{String(n + 1).padStart(2, '0')}</span>
            <h2>{sec.heading}</h2>
            <Text as="p" copy={sec.body} />
          </Reveal>
        ))}
      </div>
      {products.length > 0 && (
        <section className="section wrap" aria-labelledby="brand-products-h">
          <Reveal className="section__head">
            <p className="eyebrow">{brand.name}</p>
            <h2 id="brand-products-h" className="display display--md">Shop {brand.name}</h2>
            <Link to={`${paths.shop()}?brand=${brand.code}`} className="arrow-link">See all {products.length} <Icon name="arrow" size={18} /></Link>
          </Reveal>
          <div className="grid grid--feature">{products.slice(0, 8).map((i) => <ProductCard key={i.code} code={i.code} />)}</div>
        </section>
      )}
    </article>
  );
}

// ---------------------------------------------------------------- about the company
export function About() {
  useSeo({ title: 'About Torte Living', description: snippet(house.intro) });
  return (
    <article className="info">
      <header className="page-head page-head--narrow wrap">
        <p className="eyebrow">{house.eyebrow}</p>
        <h1 className="display display--lg">{house.title.replace('\n', ' ')}</h1>
        <p className="lede">{house.intro}</p>
      </header>
      <div className="wrap">
        <ul className="beliefs">
          {house.beliefs.map((b, i) => (
            <li key={b.title} className="belief">
              <span className="belief__no">0{i + 1}</span>
              <h2 className="belief__title">{b.title}</h2>
              <p>{b.text}</p>
            </li>
          ))}
        </ul>
        <ul className="company__brands company__brands--about">
          {brandList.map((b) => (
            <li key={b.code}>
              <Link to={paths.brand(b)} className="brand-card">
                <span className="brand-card__name">{b.name}</span>
                <span className="brand-card__line">{b.blurb}</span>
                <span className="arrow-link">{b.story.label} <Icon name="arrow" size={16} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------- contact (one for the whole store)
export function Contact() {
  useSeo({ title: 'Contact · Torte Living', description: 'Questions about an order, a product, gifting or trade: contact Torte Living, makers of Mia Torte and Nutri Sampoorna.' });
  const blocks = [
    ...miaTorte.contact.blocks.filter((b) => b.heading !== 'The kitchen'),
    ...nutriSampoorna.contact.blocks.filter((b) => b.heading !== 'Orders & deliveries'),
  ];
  return (
    <article className="info">
      <header className="page-head page-head--narrow wrap">
        <p className="eyebrow">Help</p>
        <h1 className="display display--lg">Contact us</h1>
        <p className="lede">Questions about an order, a product, gifting or trade. We’d be glad to hear from you.</p>
      </header>
      <div className="wrap contact">
        <div className="contact__card">
          <h2 className="contact__h">Write or call</h2>
          <ul className="contact__lines">
            <li><Icon name="mail" size={18} /> <Text copy={site.email} /></li>
            <li><Icon name="phone" size={18} /> <Text copy={site.phone} /></li>
            <li><Icon name="clock" size={18} /> <Text copy={site.hours} /></li>
          </ul>
          <Link to="/track" className="btn btn--line btn--block">Track an order</Link>
        </div>
        <div className="contact__blocks">
          {blocks.map((b) => (
            <Reveal as="section" key={b.heading} className="info__section">
              <h2>{b.heading}</h2>
              <Text as="p" copy={b.body} />
            </Reveal>
          ))}
          <section className="info__section">
            <h2>Registered office</h2>
            <p className="info__legal">{site.legalEntity} · <Text copy={site.registeredAddress} /> · <Text copy={site.fssaiLicence} /></p>
          </section>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------- policy pages
export function InfoPage({ slug }: { slug: keyof typeof pages }) {
  const p = pages[slug];
  useSeo({ title: `${p.title} · ${site.name}`, description: snippet(copyText(p.intro)) });
  return (
    <article className="info">
      <header className="page-head page-head--narrow wrap">
        <p className="eyebrow">Information</p>
        <h1 className="display display--lg">{p.title}</h1>
        <Text as="p" className="lede" copy={p.intro} />
      </header>
      {SHOW_PLACEHOLDER_FLAGS && (
        <div className="wrap info__notice">
          <p className="banner banner--info"><strong>Draft page.</strong> The text on this page is a placeholder outline. {site.legalEntity} needs to supply the final wording before launch. <PlaceholderTag /></p>
        </div>
      )}
      <div className="wrap info__body">
        {p.sections.map((s) => (
          <Reveal as="section" key={s.heading} className="info__section">
            <h2>{s.heading}</h2>
            <Text as="p" copy={s.body} />
          </Reveal>
        ))}
        <section className="info__section">
          <h2>Contact</h2>
          <p><Text copy={site.email} /> · <Text copy={site.phone} /></p>
          <p className="info__legal">{site.legalEntity} · <Text copy={site.registeredAddress} /> · <Text copy={site.fssaiLicence} /></p>
        </section>
      </div>
    </article>
  );
}

export function Credits() {
  useSeo({ title: `Photo credits · ${site.name}`, description: 'Credits for the photographs used on the Torte Living website.' });
  return (
    <article className="info">
      <header className="page-head page-head--narrow wrap">
        <p className="eyebrow">Information</p>
        <h1 className="display display--lg">Photo credits</h1>
        <p className="lede">The photographs on this site are placeholder stock images used under the <a href="https://unsplash.com/license" rel="noopener" target="_blank">Unsplash Licence</a>. They set the mood and show ingredients; they are not photographs of our products, which are shown as illustrations until our own photography is ready.</p>
      </header>
      <div className="wrap info__body">
        <ul className="credits">
          {Object.entries(images).filter(([, i]) => i.credit).map(([id, i]) => (
            <li key={id}>
              <Img id={id} sizes="120px" className="credits__img" alt="" />
              <span>{i.alt}<br />Photo by <a href={i.credit!.profile} rel="noopener" target="_blank">{i.credit!.photographer}</a> on <a href={i.credit!.url} rel="noopener" target="_blank">{i.credit!.source}</a></span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function NotFound({ what = 'page' }: { what?: string }) {
  useSeo({ title: `Not found · ${site.name}`, noindex: true });
  return (
    <div className="wrap section notfound">
      <p className="eyebrow">404</p>
      <h1 className="display display--lg">We couldn’t find that {what}.</h1>
      <p className="lede">It may no longer be available, or the link may be wrong.</p>
      <div className="closing__cta">
        <Link to={paths.shop()} className="btn btn--dark">Shop all</Link>
        <Link to={paths.search()} className="btn btn--line">Search</Link>
      </div>
    </div>
  );
}
