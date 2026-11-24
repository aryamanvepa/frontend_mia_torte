import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { BrandLogo } from '../components/BrandLogo';
import { useCatalogue } from '../state/store';
import { Icon, Img, Reveal, Text } from '../components/ui';
import { brandList, miaTorte, nutriSampoorn, type Brand } from '../content/brands';
import { images } from '../content/images';
import { HIDE_TEST_DATA, isTestImage } from '../content/test-labels';
import { founder, grievanceOfficer, house, isMissing, mailHref, pages, site, telHref } from '../content/site';
import { oneCardPerProduct, paths } from '../lib/brand';
import { breadcrumbLd, snippet, useSeo } from '../lib/seo';
import { copyText, type Copy } from '../content/site';

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
        <BrandLogo brand={brand} width={200} eager className="brand-logo--page" />
        <p className="eyebrow">{brand.name} · {brand.descriptor}</p>
        <h1 className="display display--lg">{s.title}</h1>
        <p className="lede">{s.intro}</p>
      </header>
      <Reveal className="wrap info__hero"><Img id={s.image} eager sizes="(min-width: 900px) 80vw, 100vw" /></Reveal>
      <div className="wrap info__body info__body--story">
        {s.sections.filter((sec) => !isMissing(sec.body)).map((sec, n) => (
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
        <p className="about__founder"><Link to="/about/founder" className="arrow-link">About the founder, {founder.name} <Icon name="arrow" size={16} /></Link></p>
        <LegalDetails />
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

/** Company details from the government certificates (shown only once each is set in site.ts). */
function LegalDetails() {
  const rows: [string, Copy | null][] = [
    ['Company', site.legalEntity],
    ['Registered office', site.registeredAddress],
    ['FSSAI registration', site.fssaiLicence && copyText(site.fssaiLicence).replace(/^FSSAI Reg\. No\. /, '')],
    ['GSTIN', site.gstin && copyText(site.gstin).replace(/^GSTIN /, '')],
  ];
  const shown = rows.filter(([, v]) => v != null);
  if (shown.length < 2) return null;
  return (
    <section className="legal-details" aria-labelledby="legal-h">
      <h2 id="legal-h" className="eyebrow">Company details</h2>
      <dl>
        {shown.map(([k, v]) => <div key={k}><dt>{k}</dt><dd><Text copy={v} /></dd></div>)}
      </dl>
    </section>
  );
}

// ---------------------------------------------------------------- contact (one for the whole store)
export function Contact() {
  useSeo({ title: 'Contact · Torte Living', description: 'Questions about an order, a product, gifting or trade: contact Torte Living, makers of La Mia Torte and Nutri Sampoorn.' });
  const blocks = [
    ...miaTorte.contact.blocks.filter((b) => b.heading !== 'The kitchen'),
    ...nutriSampoorn.contact.blocks.filter((b) => b.heading !== 'Orders & deliveries'),
  ].filter((b) => !isMissing(b.body));
  const legal = [site.registeredAddress, site.fssaiLicence, site.gstin].filter((c) => c != null);
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
            {site.email && <li><Icon name="mail" size={18} /> <a href={mailHref!}>{copyText(site.email)}</a></li>}
            {site.phone && <li><Icon name="phone" size={18} /> <a href={telHref!}>{copyText(site.phone)}</a></li>}
            {site.instagram && <li><Icon name="instagram" size={18} /> <a href={site.instagram} rel="noopener" target="_blank">Instagram @miatortebakery</a></li>}
            {site.hours && <li><Icon name="clock" size={18} /> <Text copy={site.hours} /></li>}
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
          {legal.length > 0 && (
            <section className="info__section">
              <h2>Registered office</h2>
              <p className="info__legal">{site.legalEntity}{legal.map((c, i) => <span key={i}> · <Text copy={c} /></span>)}</p>
            </section>
          )}
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
        <p className="info__updated">Last updated {p.updated}</p>
      </header>
      <div className="wrap info__body">
        {p.sections.map((s) => (
          <section key={s.heading} className="info__section">
            <h2>{s.heading}</h2>
            {Array.isArray(s.body)
              ? <ul className="info__list">{s.body.map((b) => <li key={b}>{b}</li>)}</ul>
              : <Text as="p" copy={s.body} />}
            {s.after && <p>{s.after}</p>}
          </section>
        ))}
        <section className="info__section">
          <h2>Contact us</h2>
          {(site.email || site.phone) && (
            <p>
              {site.email && <a href={mailHref!}>{copyText(site.email)}</a>}
              {site.email && site.phone && ' · '}
              {site.phone && <a href={telHref!}>{copyText(site.phone)}</a>}
            </p>
          )}
          <p className="info__legal">{site.legalEntity}{[site.registeredAddress, site.fssaiLicence, site.gstin].filter((c) => c != null).map((c, i) => <span key={i}> · <Text copy={c} /></span>)}</p>
        </section>
        {p.grievance && (
          <section className="info__section">
            <h2>Grievance officer</h2>
            <p>{grievanceOfficer.name}, {grievanceOfficer.role}</p>
            <p><a href={`mailto:${grievanceOfficer.email}`}>{grievanceOfficer.email}</a> · <a href={`tel:${grievanceOfficer.phone.replace(/[^\d+]/g, '')}`}>{grievanceOfficer.phone}</a></p>
            {/* COMMITMENT (not confirmed): response times, set to the Consumer Protection (E-Commerce) Rules 2020. */}
            <p>We acknowledge complaints within 48 hours and aim to resolve them within one month.</p>
          </section>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------- about the founder
/** Only the facts Torte Living has given. Her photo and own story appear only once added in site.ts (founder). */
export function Founder() {
  useSeo({
    title: `About the founder · ${founder.name} · Torte Living`,
    description: snippet(`${founder.name} is the founder of Torte Living in Hyderabad, the maker of La Mia Torte cookies, snacks and mueslis and Nutri Sampoorn superseed attas, flours and instant dosa mixes.`),
    type: 'article',
    jsonLd: breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'About Torte Living', path: '/about' }, { name: 'About the founder', path: '/about/founder' }]),
  });
  return (
    <article className="info founder">
      <header className={`page-head page-head--narrow wrap ${founder.photo ? 'founder__head--photo' : ''}`}>
        {founder.photo && <div className="founder__photo"><Img id={founder.photo} eager sizes="(min-width: 900px) 320px, 60vw" /></div>}
        <div>
          <p className="eyebrow">About the founder</p>
          <h1 className="display display--lg">{founder.name}</h1>
          <p className="lede">{founder.role}</p>
        </div>
      </header>
      <div className="wrap info__body">
        {founder.story?.length ? (
          <section className="info__section founder__story">
            <h2>In her words</h2>
            {founder.story.map((para) => <p key={para}>{para}</p>)}
          </section>
        ) : null}
        <section className="info__section">
          <h2>Two brands</h2>
          <p>
            {founder.name} founded Torte Living in Hyderabad and makes both of its brands.{' '}
            <Link to={paths.brand(miaTorte)}>La Mia Torte</Link> is the indulgent side: cookies, snacks and millets &amp; nuts mueslis.{' '}
            <Link to={paths.brand(nutriSampoorn)}>Nutri Sampoorn</Link> is the everyday side: superseed atta blends, single grain flours, and instant dosa mixes and chutneys.
          </p>
        </section>
        <section className="info__section">
          <h2>What Torte Living stands for</h2>
          <ul className="info__list">
            {house.beliefs.map((b) => <li key={b.title}><strong>{b.title}.</strong> {b.text}</li>)}
          </ul>
        </section>
        <section className="info__section">
          <h2>Say hello</h2>
          <p>
            {site.instagram && <><a href={site.instagram} rel="noopener" target="_blank">Instagram @miatortebakery</a>{site.email && ' · '}</>}
            {site.email && <a href={mailHref!}>{copyText(site.email)}</a>}
          </p>
        </section>
        <p><Link to="/about" className="arrow-link">About Torte Living <Icon name="arrow" size={16} /></Link></p>
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
        <p className="lede">Some photographs on this site are stock images used under the <a href="https://unsplash.com/license" rel="noopener" target="_blank">Unsplash Licence</a>. They set the mood and show ingredients{HIDE_TEST_DATA ? '' : ', and a few stand in for products until our own photography is ready'}. Our product photographs are our own.</p>
      </header>
      <div className="wrap info__body">
        <ul className="credits">
          {Object.entries(images).filter(([id, i]) => i.credit && !(HIDE_TEST_DATA && isTestImage(id))).map(([id, i]) => (
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
