import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { PackArt } from '../components/PackArt';
import { Icon, Img, PlaceholderTag, Price, Reveal, StockNote, Stepper, Text } from '../components/ui';
import type { Brand } from '../content/brands';
import { NUTRITION_ROWS, type Dietary } from '../content/products';
import { copyText, site, type Copy } from '../content/site';
import type { CatalogueItem } from '../lib/api';
import { absUrl, breadcrumbLd, imageUrl, snippet, useSeo, type Seo } from '../lib/seo';
import { brandOf, collectionOf, itemContent, oneCardPerProduct, paths } from '../lib/brand';
import { packFull, packKind, packLabel, rupees, titleOf } from '../lib/format';
import { useCart, useCatalogue } from '../state/store';
import { CatalogueStatus } from './Shop';
import { NotFound } from './Info';
import { NotifyMe } from '../components/NotifyMe';

function Needed({ what }: { what: string }) {
  return <span className="is-ph">{what} to be added. <PlaceholderTag label="Content needed" /></span>;
}

function Fact({ label, copy, children, need }: { label: string; copy?: Copy; children?: React.ReactNode; need?: string }) {
  return (
    <div className="facts__row">
      <dt>{label}</dt>
      <dd>{children ?? (copy !== undefined ? <Text copy={copy} /> : <Needed what={need ?? label} />)}</dd>
    </div>
  );
}

/** FSSAI veg / non-veg mark, only from the ops app's `diet` (egg counts as non-vegetarian). */
function DietMark({ d, isDraft }: { d?: Dietary; isDraft?: boolean }) {
  if (d && d !== 'unconfirmed') {
    const veg = d === 'veg' || d === 'vegan';
    const label = d === 'vegan' ? 'Vegetarian (vegan)' : d === 'egg' ? 'Non-vegetarian (contains egg)' : veg ? 'Vegetarian' : 'Non-vegetarian';
    return (
      <span className={`diet ${isDraft ? 'is-ph' : ''}`}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
          <rect x="1" y="1" width="16" height="16" rx="1.5" fill="none" stroke={veg ? '#1f7a3a' : '#7a3b1f'} strokeWidth="1.6" />
          {veg ? <circle cx="9" cy="9" r="4.2" fill="#1f7a3a" /> : <path d="M9 4.6 13.6 12.8H4.4Z" fill="#7a3b1f" />}
        </svg>
        {label}
        {isDraft && <PlaceholderTag kind="draft" />}
      </span>
    );
  }
  return <span className="is-ph">Vegetarian / non-vegetarian mark to be confirmed. <PlaceholderTag /></span>;
}

/**
 * Search and link-preview data for a product page. Every pack size has its own address, but they
 * all point search engines at one canonical page (the pack shown on the shop card), which lists
 * every pack as an offer. Prices are the live website prices; no barcodes, no GST.
 */
function productSeo(item: CatalogueItem, items: CatalogueItem[], brand: Brand): Seo {
  const c = itemContent(item);
  const collection = collectionOf(item);
  const packs = items.filter((i) => i.product === item.product && i.brand_code === item.brand_code).sort((a, b) => a.pack_grams - b.pack_grams);
  const canonical = oneCardPerProduct(packs)[0] ?? item;
  const intro = c.intro ? copyText(c.intro) : '';
  const description = snippet([c.tagline, intro].filter(Boolean).join(' ') || `${item.product} from ${brand.name}. ${collection?.intro ?? brand.blurb}`);
  const availability = (i: CatalogueItem) => (i.availability === 'sold_out' || i.test_stock ? 'https://schema.org/OutOfStock'
    : i.availability === 'low' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock');
  const photo = c.images[0] ? imageUrl(c.images[0]) : undefined;
  return {
    title: `${titleOf(item)} ${packFull(item)} · ${brand.name}`,
    description,
    canonical: paths.product(canonical),
    image: c.images[0],
    type: 'product',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: item.product,
        description,
        brand: { '@type': 'Brand', name: brand.name },
        manufacturer: { '@type': 'Organization', name: site.legalEntity },
        ...(collection ? { category: collection.title } : {}),
        ...(photo ? { image: [photo] } : {}),
        url: absUrl(paths.product(canonical)),
        offers: packs.map((p) => ({
          '@type': 'Offer',
          sku: p.code,
          name: packFull(p),
          url: absUrl(paths.product(p)),
          price: p.price.toFixed(2),
          priceCurrency: 'INR',
          availability: availability(p),
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Organization', name: site.legalEntity },
        })),
      },
      breadcrumbLd([
        { name: brand.name, path: paths.home(brand) },
        ...(collection ? [{ name: collection.title, path: paths.collection(brand, collection) }] : [{ name: brand.shop.title, path: paths.shop(brand) }]),
        { name: item.product, path: paths.product(canonical) },
      ]),
    ],
  };
}

export default function Product({ brand }: { brand: Brand }) {
  const { code = '' } = useParams();
  const { items, byCode, status, comingSoon } = useCatalogue();
  const { add, openDrawer, lines } = useCart();
  const item = byCode.get(code.toUpperCase());
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [adding, setAdding] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => { setQty(1); setActive(0); track.current?.scrollTo({ left: 0 }); }, [code]);
  useSeo(item && item.brand_code === brand.code ? productSeo(item, items, brand) : null);

  if (status === 'loading') return <div className="pdp wrap"><div className="pdp__grid"><div className="sk sk--pdp" /><div><div className="sk sk--line" /><div className="sk sk--line sk--short" /></div></div></div>;
  if (status === 'error' && !item) return <div className="wrap section"><CatalogueStatus /></div>;
  if (!item) return <NotFound what="product" />;
  // A product opened under the other brand's address: send it home.
  if (item.brand_code !== brand.code && brandOf(item.brand_code)) return <Navigate to={paths.product(item)} replace />;

  const c = itemContent(item);
  const collection = collectionOf(item);
  const photos = c.images;
  const siblings = items.filter((i) => i.product === item.product && i.brand_code === item.brand_code).sort((a, b) => a.pack_grams - b.pack_grams);
  const soon = comingSoon(item);
  // Other products from the same brand, one card each; same collection first.
  const related = oneCardPerProduct(items.filter((i) => i.brand_code === item.brand_code && i.product !== item.product && (soon || i.availability !== 'sold_out')))
    .sort((a, b) => Number(collectionOf(b)?.slug === collection?.slug) - Number(collectionOf(a)?.slug === collection?.slug)
      || Number(Boolean(itemContent(b).featured)) - Number(Boolean(itemContent(a).featured)))
    .slice(0, 4);
  const inBag = lines.find((l) => l.code === item.code)?.qty ?? 0;
  const max = Math.max(0, item.max_qty - inBag);
  const soldOut = item.availability === 'sold_out';
  const isMT = brand.theme === 'mt';

  const onAdd = () => {
    setAdding(true);
    add(item.code, Math.min(qty, max));
    setTimeout(() => { setAdding(false); openDrawer(); setQty(1); }, 380);
  };
  const onScroll = () => {
    const el = track.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goTo = (n: number) => {
    setActive(n);
    const el = track.current;
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div className="pdp">
      <nav className="crumbs wrap" aria-label="Breadcrumb">
        <Link to={paths.home(brand)}>{brand.name}</Link><span aria-hidden="true">/</span>
        {collection
          ? <Link to={paths.collection(brand, collection)}>{collection.title}</Link>
          : <Link to={paths.shop(brand)}>{brand.shop.title}</Link>}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{titleOf(item)}</span>
      </nav>

      <div className="wrap pdp__grid">
        <div className="gallery">
          {photos.length === 0 && (
            <div className="gallery__track gallery__track--art"><div className="gallery__slide"><PackArt variant="hero" product={item.product} category={item.category} brandCode={item.brand_code} /></div></div>
          )}
          {photos.length > 0 && <div className="gallery__track" ref={track} onScroll={onScroll} tabIndex={0} aria-label="Product photos">
            {photos.map((id, n) => (
              <div className="gallery__slide" key={id} aria-hidden={n !== active}>
                <Img id={id} eager={n === 0} sizes="(min-width: 900px) 55vw, 100vw" className="zoomable" />
              </div>
            ))}
          </div>}
          {photos.length > 1 && (
            <div className="gallery__thumbs">
              {c.images.map((id, n) => (
                <button key={id} className={`thumb ${n === active ? 'is-on' : ''}`} onClick={() => goTo(n)} aria-label={`Show photo ${n + 1} of ${c.images.length}`} aria-current={n === active}>
                  <Img id={id} sizes="80px" alt="" eager />
                </button>
              ))}
            </div>
          )}
          {photos.length === 0 && <p className="gallery__note">An illustration for now: photographs of this product will follow.</p>}
        </div>

        <div className="pdp__info">
          <p className="eyebrow">{collection?.title ?? brand.name}</p>
          <h1 className="display display--lg pdp__title">{titleOf(item)}</h1>
          {c.tagline && <Text as="p" className="pdp__tagline" copy={c.tagline} />}
          <div className="pdp__intro">{c.intro ? <Text as="p" copy={c.intro} /> : <p><Needed what="Product introduction" /></p>}</div>
          <div className="pdp__price"><Price item={item} size="lg" /></div>
          <p className="pdp__tax">Inclusive of all taxes · Net quantity {packLabel(item)}{packFull(item) !== packLabel(item) ? ` · ${packFull(item).slice(packLabel(item).length + 1)}` : ''}</p>

          {siblings.length > 1 && (
            <fieldset className="sizes">
              <legend>Pack size</legend>
              <div className="sizes__row">
                {siblings.map((s) => (
                  <Link key={s.code} to={paths.product(s)} className={`size ${s.code === item.code ? 'is-on' : ''} ${s.availability === 'sold_out' && !soon ? 'is-out' : ''}`}
                    aria-current={s.code === item.code ? 'true' : undefined} replace>
                    {packFull(s)}
                  </Link>
                ))}
              </div>
            </fieldset>
          )}

          <div className="pdp__stock"><StockNote item={item} soon={soon} /></div>

          {!soldOut && <div className="pdp__buy">
            {!soldOut && max > 0 && <Stepper value={Math.min(qty, max)} max={max} onChange={setQty} label={titleOf(item)} />}
            <button className={`btn ${soon ? 'btn--line btn--soon' : 'btn--dark'} btn--grow ${adding ? 'is-adding' : ''}`} disabled={soldOut || max === 0 || adding} onClick={onAdd}>
              {soon ? 'Coming soon' : soldOut ? 'Sold out' : max === 0 ? 'All available units are in your bag' : adding ? <><Icon name="check" size={18} /> Added</> : <>Add to bag</>}
            </button>
          </div>}
          {soon && <p className="pdp__hint">{isMT ? 'Our first batch is in the kitchen. Orders open here as soon as it is ready.' : 'Arriving on the shelf soon. Orders open here as soon as the first batch is packed.'}</p>}
          {soldOut && !soon && <p className="pdp__hint">{isMT ? 'Sold out for now. The next batch is on its way.' : 'Out of stock for now. We are restocking the shelf.'}</p>}
          {soldOut && <NotifyMe key={item.code} code={item.code} what={`${titleOf(item)}, ${packFull(item)}`} pack={packKind(item) ? packFull(item) : `${packLabel(item)} pack`} soon={soon} />}

          <ul className="pdp__assure" aria-label="Ordering">
            <li><Icon name="hand" size={18} /> {site.codNote}</li>
            <li><Icon name="truck" size={18} /> <span><Text copy={site.dispatchNote} /> <Text copy={site.deliveryNote} /></span></li>
          </ul>
        </div>
      </div>

      <section className="wrap pdp-details" aria-label="Product details">
        <div className="pdp-details__story">
          <Reveal as="section" className="pdp-block">
            <h2 className="pdp-block__h">The ingredients</h2>
            {c.ingredientStory ? <Text as="p" copy={c.ingredientStory} /> : <p><Needed what="A description of the ingredients" /></p>}
          </Reveal>
          <Reveal as="section" className="pdp-block">
            <h2 className="pdp-block__h">{c.experienceLabel ?? (isMT ? 'Flavour & texture' : 'In the kitchen')}</h2>
            {c.experience ? <Text as="p" copy={c.experience} /> : <p><Needed what={isMT ? 'Flavour and texture notes' : 'Preparation notes'} /></p>}
            {c.notes?.length ? (
              <>
                <h3 className="pdp-block__sub">{c.notesLabel ?? (isMT ? 'Tasting notes' : 'Good for')}</h3>
                <ul className="notes">{c.notes.map((n) => <li key={n}>{n}</li>)}</ul>
              </>
            ) : null}
          </Reveal>
          {c.serving && (
            <Reveal as="section" className="pdp-block">
              <h2 className="pdp-block__h">{isMT ? 'To enjoy' : 'Try it'}</h2>
              <Text as="p" copy={c.serving} />
            </Reveal>
          )}
        </div>

        <Reveal as="section" className="facts">
          <h2 className="facts__h">Product information</h2>
          <dl className="facts__list">
            <Fact label="Food type"><DietMark d={c.dietary} isDraft={c.dietaryDraft} /></Fact>
            <Fact label="Net quantity">{packLabel(item)}</Fact>
            <Fact label="MRP">{rupees(item.mrp ?? item.price)} <span className="facts__muted">(inclusive of all taxes)</span></Fact>
            <Fact label="Ingredients" copy={c.ingredientsList} need="Ingredients list" />
            <Fact label="Allergens" copy={c.allergens} need="Allergen information" />
            <Fact label="Storage" copy={c.storage} need="Storage instructions" />
            <Fact label="Best before" copy={c.shelfLife} need="Shelf life" />
            <Fact label="Manufactured & marketed by">{site.legalEntity}, <Text copy={site.registeredAddress} /></Fact>
            <Fact label="FSSAI licence" copy={site.fssaiLicence} />
            <Fact label="Country of origin">{site.countryOfOrigin}</Fact>
            <Fact label="Customer care"><Text copy={site.email} /> · <Text copy={site.phone} /></Fact>
          </dl>

          <table className="nutrition">
            <caption>Nutritional information <span>{c.nutrition?.basis ?? 'per 100 g (approx.)'}</span></caption>
            <tbody>
              {(c.nutrition?.rows ?? NUTRITION_ROWS.map((r) => [r, '—'] as [string, string])).map(([label, value]) => (
                <tr key={label} className={label.startsWith('of which') ? 'is-sub' : ''}><th scope="row">{label}</th><td>{value}</td></tr>
              ))}
            </tbody>
          </table>
          {!c.nutrition && <p className="facts__note is-ph">Values to be supplied from laboratory analysis. <PlaceholderTag /></p>}
          {c.nutrition?.draft && <p className="facts__note is-ph">Values entered by Torte Living, to be confirmed against the pack label. <PlaceholderTag kind="draft" /></p>}
          <p className="facts__note">Please read the label on the pack before eating. In case of any difference, the pack label prevails.</p>
        </Reveal>
      </section>

      {related.length > 0 && (
        <section className="section wrap" aria-labelledby="related-h">
          <Reveal className="section__head">
            <p className="eyebrow">{isMT ? 'Also on the counter' : 'Also on the shelf'}</p>
            <h2 id="related-h" className="display display--md">{isMT ? 'You may also enjoy' : 'Keep exploring'}</h2>
          </Reveal>
          <div className="grid grid--feature">
            {related.map((i, n) => <Reveal key={i.code} delay={n * 80}><ProductCard code={i.code} /></Reveal>)}
          </div>
        </section>
      )}
    </div>
  );
}
