import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Img, PlaceholderTag, Reveal, Text } from '../components/ui';
import { brandList, type Brand } from '../content/brands';
import { images } from '../content/images';
import { SHOW_PLACEHOLDER_FLAGS, pages, site } from '../content/site';
import { paths, useBrand } from '../lib/brand';

// ---------------------------------------------------------------- brand: story / philosophy
export function BrandStory({ brand }: { brand: Brand }) {
  const s = brand.story;
  const other = brandList.find((b) => b.code !== brand.code)!;
  useEffect(() => { document.title = `${s.label} · ${brand.name}`; }, [s.label, brand.name]);
  return (
    <article className="info info--story">
      <header className="page-head page-head--narrow wrap">
        <p className="eyebrow">{s.label}</p>
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
      <div className="wrap story-end">
        <Link to={paths.shop(brand)} className="btn btn--dark">Shop {brand.name}</Link>
        <Link to={paths.home(other)} className="arrow-link">Visit {other.name} <Icon name="arrow" size={18} /></Link>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------- brand: contact
export function BrandContact({ brand }: { brand: Brand }) {
  const c = brand.contact;
  useEffect(() => { document.title = `Contact · ${brand.name}`; }, [brand.name]);
  return (
    <article className="info">
      <header className="page-head page-head--narrow wrap">
        <p className="eyebrow">{brand.name}</p>
        <h1 className="display display--lg">{c.title}</h1>
        <p className="lede">{c.intro}</p>
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
          {c.blocks.map((b) => (
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
  useEffect(() => { document.title = `${p.title} · ${site.name}`; }, [p.title]);
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
  useEffect(() => { document.title = `Photo credits · ${site.name}`; }, []);
  return (
    <article className="info">
      <header className="page-head page-head--narrow wrap">
        <p className="eyebrow">Information</p>
        <h1 className="display display--lg">Photo credits</h1>
        <p className="lede">The photographs on this site are placeholder stock images used under the <a href="https://unsplash.com/license" rel="noopener" target="_blank">Unsplash Licence</a>. They will be replaced with photography of our own products.</p>
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
  const brand = useBrand();
  useEffect(() => { document.title = `Not found · ${brand?.name ?? site.name}`; }, [brand]);
  return (
    <div className="wrap section notfound">
      <p className="eyebrow">404</p>
      <h1 className="display display--lg">We couldn’t find that {what}.</h1>
      <p className="lede">It may no longer be available, or the link may be wrong.</p>
      <div className="closing__cta">
        {brand
          ? <><Link to={paths.shop(brand)} className="btn btn--dark">Shop {brand.name}</Link><Link to={paths.home(brand)} className="btn btn--line">{brand.name} home</Link></>
          : <Link to="/" className="btn btn--dark">Torte Living home</Link>}
      </div>
    </div>
  );
}
