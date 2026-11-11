import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Img, PlaceholderTag, Reveal, Text } from '../components/ui';
import { images } from '../content/images';
import { SHOW_PLACEHOLDER_FLAGS, pages, site } from '../content/site';

export function InfoPage({ slug }: { slug: keyof typeof pages }) {
  const p = pages[slug];
  useEffect(() => { document.title = `${p.title} · ${site.name}`; }, [p.title]);
  const isAbout = slug === 'about';
  return (
    <article className={`info ${isAbout ? 'info--about' : ''}`}>
      <header className="page-head page-head--narrow wrap">
        <p className="eyebrow">{isAbout ? site.legalEntity : 'Information'}</p>
        <h1 className="display display--lg">{p.title}</h1>
        <Text as="p" className="lede" copy={p.intro} />
      </header>
      {SHOW_PLACEHOLDER_FLAGS && (
        <div className="wrap info__notice">
          <p className="banner banner--info"><strong>Draft page.</strong> The text on this page is a placeholder outline. {site.legalEntity} needs to supply the final wording before launch. <PlaceholderTag /></p>
        </div>
      )}
      {isAbout && <Reveal className="wrap info__hero"><Img id="craft-kneading" sizes="(min-width: 900px) 70vw, 100vw" /></Reveal>}
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
  useEffect(() => { document.title = `Not found · ${site.name}`; }, []);
  return (
    <div className="wrap section notfound">
      <p className="eyebrow">404</p>
      <h1 className="display display--lg">We couldn’t find that {what}.</h1>
      <p className="lede">It may have sold out for good, or the link may be wrong.</p>
      <div className="closing__cta"><Link to="/shop" className="btn btn--dark">Browse the shop</Link><Link to="/" className="btn btn--line">Home</Link></div>
    </div>
  );
}
