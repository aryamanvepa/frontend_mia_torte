import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard, useComplements } from '../components/layout';
import { PackArt } from '../components/PackArt';
import { Icon, Img, PlaceholderTag, Price, Reveal, Spinner, StockNote, Stepper, Text } from '../components/ui';
import { NUTRITION_ROWS, type Dietary } from '../content/products';
import { copyText, draft, site, type Copy } from '../content/site';
import { deliveryFallback, deliveryText } from '../content/store';
import { getQuote, type CatalogueItem, type Delivery } from '../lib/api';
import { trackViewItem } from '../lib/analytics';
import { absUrl, breadcrumbLd, imageUrl, snippet, useSeo, type Seo } from '../lib/seo';
import { brandOf, buyingKindOf, itemContent, oneCardPerProduct, paths, primaryCategoryOf, storeCategoriesOf } from '../lib/brand';
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

/** Price per 100 g (or per kg for big packs): the "value" a considered buyer compares. Display only. */
function unitPrice(i: CatalogueItem) {
  if (!i.pack_grams) return null;
  return i.pack_grams >= 1000 ? `${rupees(Math.round((i.price / i.pack_grams) * 1000))} per kg` : `${rupees(Math.round((i.price / i.pack_grams) * 100))} per 100 g`;
}

/** Delivery for this product: the server's charges and, once live, its PIN check and estimated delivery (§7, §9). */
function DeliveryCheck({ item }: { item: CatalogueItem }) {
  const [pin, setPin] = useState(() => { try { return localStorage.getItem('torte-pin') ?? ''; } catch { return ''; } });
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [rule, setRule] = useState<{ flat: number; free_above: number } | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const valid = /^[1-9]\d{5}$/.test(pin);

  async function check(p?: string) {
    setState('loading');
    const q = await getQuote([{ sku_code: item.code, qty: 1 }], p ? { pincode: p } : undefined);
    if (!q.ok) { setState('error'); return; }
    setRule(q.shipping_rule);
    setDelivery(p ? q.delivery ?? deliveryFallback(p) : null);
    setState('done');
  }
  useEffect(() => { check(valid ? pin : undefined); }, [item.code]); // eslint-disable-line react-hooks/exhaustive-deps
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try { localStorage.setItem('torte-pin', pin); } catch { /* ignore */ }
    check(pin);
  };

  return (
    <section className="delivery" aria-labelledby="delivery-h">
      <h2 id="delivery-h" className="delivery__h"><Icon name="truck" size={18} /> Delivery</h2>
      {rule && <p>{rupees(rule.flat)} delivery, free on orders above {rupees(rule.free_above)}. Pay on delivery.</p>}
      <form className="delivery__form" onSubmit={submit}>
        <label className="sr-only" htmlFor="pin">Delivery PIN code</label>
        <input id="pin" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="Enter PIN code" autoComplete="postal-code" />
        <button className="btn btn--line" disabled={!valid || state === 'loading'}>{state === 'loading' ? <Spinner /> : 'Check'}</button>
      </form>
      <div aria-live="polite">
        {state === 'error' && <p className="delivery__msg">We couldn’t check delivery just now.</p>}
        {state === 'done' && valid && delivery && (
          delivery.serviceable
            ? <p className="delivery__msg delivery__msg--ok">{deliveryText(delivery, pin)}</p>
            : <p className="delivery__msg delivery__msg--no">{deliveryText(delivery, pin)}</p>
        )}
      </div>
    </section>
  );
}

/**
 * Search and link-preview data. Every pack size has its own address, but all point search engines at
 * one canonical page per product, which lists every pack as an offer. Website prices; no barcodes, no GST.
 */
function productSeo(item: CatalogueItem, items: CatalogueItem[]): Seo {
  const c = itemContent(item);
  const cat = primaryCategoryOf(item);
  const brand = brandOf(item.brand_code);
  const packs = items.filter((i) => i.product === item.product && i.brand_code === item.brand_code).sort((a, b) => a.pack_grams - b.pack_grams);
  const canonical = oneCardPerProduct(packs)[0] ?? item;
  const intro = c.intro ? copyText(c.intro) : '';
  const description = snippet([c.tagline, intro].filter(Boolean).join(' ') || `${item.product} from ${item.brand}. ${cat?.intro ?? ''}`);
  const availability = (i: CatalogueItem) => (i.status === 'discontinued' ? 'https://schema.org/Discontinued' : i.availability === 'sold_out' || i.test_stock ? 'https://schema.org/OutOfStock'
    : i.availability === 'low' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock');
  const photo = c.images[0] ? imageUrl(c.images[0]) : undefined;
  return {
    title: `${titleOf(item)} ${packFull(item)} · ${item.brand}`,
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
        brand: { '@type': 'Brand', name: brand?.name ?? item.brand },
        manufacturer: { '@type': 'Organization', name: site.legalEntity },
        ...(cat ? { category: cat.title } : {}),
        ...(photo ? { image: [photo] } : {}),
        ...(item.rating && item.review_count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: item.rating, reviewCount: item.review_count } } : {}),
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
        { name: 'Home', path: '/' },
        ...(cat ? [{ name: cat.title, path: paths.category(cat) }] : [{ name: 'Shop all', path: paths.shop() }]),
        { name: item.product, path: paths.product(canonical) },
      ]),
    ],
  };
}

const STATUS_TEXT = {
  available: '',
  out_of_stock: 'Temporarily out of stock. The next batch is on its way.',
  coming_soon: 'Coming soon. Our first batch is being made; orders open here as soon as it is ready.',
  discontinued: 'This product is no longer available. You may like one of these instead.',
} as const;

/** The best-value pack of a product, by price per kg (display only; prices come from the server). */
function bestValue(packs: CatalogueItem[]) {
  const priced = packs.filter((p) => p.pack_grams > 0);
  if (priced.length < 2) return null;
  const perKg = (p: CatalogueItem) => (p.price / p.pack_grams) * 1000;
  const best = priced.reduce((a, b) => (perKg(b) < perKg(a) ? b : a));
  const worst = priced.reduce((a, b) => (perKg(b) > perKg(a) ? b : a));
  const saving = Math.round((1 - perKg(best) / perKg(worst)) * 100);
  return saving >= 5 ? { pack: best, text: `${packFull(best)} is the best value, at ${rupees(Math.round(perKg(best)))} per kg (${saving}% less per kg than the ${packLabel(worst)} pack).` } : null;
}

/**
 * Product page. Two layouts for two kinds of purchase (Brief §8):
 *  - sensory (cookies, brownies, snacks, muesli): photo, taste and texture first; a short, fast buy; add-ons from
 *    other categories straight after; label details folded away below.
 *  - considered (atta, dosa mixes, pantry): an "At a glance" panel with taste, ingredients, nutrition, how to use
 *    and value; full preparation, ingredients and nutrition open on the page; "Complete the meal" suggestions.
 */
export default function Product() {
  const { code = '' } = useParams();
  const { items, byCode, status, statusOf } = useCatalogue();
  const { add, openDrawer, lines } = useCart();
  const item = byCode.get(code.toUpperCase());
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [adding, setAdding] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const complements = useComplements(item ? [item.code] : [], 4);

  useEffect(() => { setQty(1); setActive(0); track.current?.scrollTo({ left: 0 }); }, [code]);
  useEffect(() => { if (item) trackViewItem(item); }, [item?.code]); // eslint-disable-line react-hooks/exhaustive-deps
  useSeo(item ? { ...productSeo(item, items), ...(statusOf(item) === 'discontinued' ? { noindex: true } : {}) } : null);

  if (status === 'loading') return <div className="pdp wrap"><div className="pdp__grid"><div className="sk sk--pdp" /><div><div className="sk sk--line" /><div className="sk sk--line sk--short" /></div></div></div>;
  if (status === 'error' && !item) return <div className="wrap section"><CatalogueStatus /></div>;
  if (!item) return <NotFound what="product" />;

  const c = itemContent(item);
  const cat = primaryCategoryOf(item);
  const brand = brandOf(item.brand_code);
  const considered = buyingKindOf(item) === 'considered';
  const photos = c.images;
  const siblings = [...byCode.values()].filter((i) => i.product === item.product && i.brand_code === item.brand_code && (i.status !== 'discontinued' || i.code === item.code)).sort((a, b) => a.pack_grams - b.pack_grams);
  const st = statusOf(item);
  const myCats = new Set(storeCategoriesOf(item).map((x) => x.slug));
  // More from the same category first, then others.
  const related = oneCardPerProduct(items.filter((i) => i.product !== item.product))
    .sort((a, b) => Number(statusOf(a) !== 'available') - Number(statusOf(b) !== 'available')
      || Number(storeCategoriesOf(b).some((x) => myCats.has(x.slug))) - Number(storeCategoriesOf(a).some((x) => myCats.has(x.slug)))
      || Number(Boolean(itemContent(b).featured)) - Number(Boolean(itemContent(a).featured)))
    .slice(0, 4);
  const pairs = complements.filter((x) => !related.some((r) => r.product === x.product)).slice(0, 4);
  const inBag = lines.find((l) => l.code === item.code)?.qty ?? 0;
  const max = st === 'available' ? Math.max(0, item.max_qty - inBag) : 0;
  const unit = item.price > 0 ? unitPrice(item) : null;
  const value = considered ? bestValue(siblings.filter((s) => statusOf(s) !== 'discontinued')) : null;
  const firstStep = c.experience ? copyText(c.experience).split(/(?<=\.)\s/)[0] : undefined;

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

  const experience = (
    <Reveal as="section" className="pdp-block" key="exp">
      <h2 className="pdp-block__h">{considered ? 'How to use' : c.experienceLabel ?? 'Flavour & texture'}</h2>
      {c.experience ? <Text as="p" copy={c.experience} /> : <p><Needed what={considered ? 'Preparation notes' : 'Flavour and texture notes'} /></p>}
      {considered && c.notes?.length ? (
        <>
          <h3 className="pdp-block__sub">{c.notesLabel ?? 'Good for'}</h3>
          <ul className="notes">{c.notes.map((n) => <li key={n}>{n}</li>)}</ul>
        </>
      ) : null}
    </Reveal>
  );
  const ingredients = (
    <Reveal as="section" className="pdp-block" key="ing">
      <h2 className="pdp-block__h">The ingredients</h2>
      {c.ingredientStory ? <Text as="p" copy={c.ingredientStory} /> : c.ingredientsList ? <Text as="p" copy={c.ingredientsList} /> : <p><Needed what="A description of the ingredients" /></p>}
    </Reveal>
  );
  const serving = c.serving ? (
    <Reveal as="section" className="pdp-block" key="srv">
      <h2 className="pdp-block__h">{considered ? 'Serving suggestions' : 'To enjoy'}</h2>
      <Text as="p" copy={c.serving} />
    </Reveal>
  ) : null;
  const facts = (
    <Reveal as="section" className="facts">
      <h2 className="facts__h">Product information</h2>
      <dl className="facts__list">
        <Fact label="Brand">{brand ? <Link to={paths.brand(brand)}>{item.brand}</Link> : item.brand}</Fact>
        <Fact label="Food type"><DietMark d={c.dietary} isDraft={c.dietaryDraft} /></Fact>
        <Fact label="Net quantity">{packLabel(item)}</Fact>
        {st !== 'discontinued' && <Fact label="MRP">{rupees(item.mrp ?? item.price)} <span className="facts__muted">(inclusive of all taxes)</span></Fact>}
        {unit && <Fact label="Unit price">{unit}</Fact>}
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
          {(c.nutrition?.rows ?? NUTRITION_ROWS.map((r) => [r, '—'] as [string, string])).map(([label, v]) => (
            <tr key={label} className={label.startsWith('of which') ? 'is-sub' : ''}><th scope="row">{label}</th><td>{v}</td></tr>
          ))}
        </tbody>
      </table>
      {!c.nutrition && <p className="facts__note is-ph">Values to be supplied from laboratory analysis. <PlaceholderTag /></p>}
      {c.nutrition?.test && <p className="facts__note is-ph">Made-up values for testing only, not from the pack label. <PlaceholderTag kind="test" /></p>}
      {c.nutrition?.draft && <p className="facts__note is-ph">Values entered by Torte Living, to be confirmed against the pack label. <PlaceholderTag kind="draft" /></p>}
      <p className="facts__note">Please read the label on the pack before eating. In case of any difference, the pack label prevails.</p>
    </Reveal>
  );
  const grid = (id: string, eyebrow: string, title: string, list: CatalogueItem[]) => list.length > 0 && (
    <section className="section section--tight wrap" aria-labelledby={id}>
      <Reveal className="section__head">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="display display--md">{title}</h2>
      </Reveal>
      <div className="grid grid--feature">
        {list.map((i, n) => <Reveal key={i.code} delay={n * 80}><ProductCard code={i.code} /></Reveal>)}
      </div>
    </section>
  );

  return (
    <div className={`pdp pdp--${considered ? 'considered' : 'sensory'}`}>
      <nav className="crumbs wrap" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">/</span>
        {cat ? <Link to={paths.category(cat)}>{cat.title}</Link> : <Link to={paths.shop()}>Shop all</Link>}
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
                <Img id={id} eager={n === 0} sizes="(min-width: 900px) 55vw, 100vw" className="zoomable" alt={n === 0 ? `${item.product}, ${packFull(item)}` : ''} />
              </div>
            ))}
          </div>}
          {photos.length > 1 && (
            <div className="gallery__thumbs">
              {photos.map((id, n) => (
                <button key={id} className={`thumb ${n === active ? 'is-on' : ''}`} onClick={() => goTo(n)} aria-label={`Show photo ${n + 1} of ${photos.length}`} aria-current={n === active}>
                  <Img id={id} sizes="80px" alt="" eager />
                </button>
              ))}
            </div>
          )}
          {photos.length === 0 && <p className="gallery__note">An illustration for now: photographs of this product will follow.</p>}
        </div>

        <div className="pdp__info">
          {cat && <p className="eyebrow"><Link to={paths.category(cat)} className="pdp__cat">{cat.title}</Link></p>}
          <h1 className="display display--lg pdp__title">{titleOf(item)}</h1>
          {item.rating && item.review_count ? (
            <a href="#reviews" className="pdp__rating" aria-label={`Rated ${item.rating} out of 5 from ${item.review_count} reviews`}>
              <span aria-hidden="true">{'★'.repeat(Math.round(item.rating))}{'☆'.repeat(5 - Math.round(item.rating))}</span> {item.review_count} reviews
            </a>
          ) : null}
          {(c.summary || c.tagline) && <p className="pdp__summary">{c.summary ?? c.tagline}</p>}
          <p className="pdp__by">{brand ? <>From the <Link to={paths.brand(brand)}>{item.brand}</Link> range</> : item.brand}</p>

          {!considered && c.notes?.length ? <ul className="notes notes--top" aria-label={c.notesLabel ?? 'Tasting notes'}>{c.notes.map((n) => <li key={n}>{n}</li>)}</ul> : null}

          {st !== 'discontinued' && <>
            <div className="pdp__price"><Price item={item} size="lg" /></div>
            <p className="pdp__tax">Inclusive of all taxes · {packFull(item)}{unit ? ` · ${unit}` : ''}</p>
          </>}

          {siblings.length > 1 && (
            <fieldset className="sizes">
              <legend>Pack size</legend>
              <div className="sizes__row">
                {siblings.map((s) => {
                  const ss = statusOf(s);
                  const n = lines.find((l) => l.code === s.code)?.qty ?? 0;
                  return (
                    <Link key={s.code} to={paths.product(s)} className={`size ${s.code === item.code ? 'is-on' : ''} ${ss !== 'available' ? 'is-out' : ''}`}
                      aria-current={s.code === item.code ? 'true' : undefined} replace>
                      <span>{packFull(s)}</span><small>{ss === 'available' ? rupees(s.price) : ss === 'coming_soon' ? 'Coming soon' : ss === 'discontinued' ? 'Discontinued' : 'Out of stock'}</small>
                      {n > 0 && <span className="size__count" aria-label={`${n} in bag`}>{n}</span>}
                    </Link>
                  );
                })}
              </div>
            </fieldset>
          )}

          {st === 'available' ? (
            <>
              <div className="pdp__stock"><StockNote item={item} /></div>
              <div className="pdp__buy">
                {max > 0 && <Stepper value={Math.min(qty, max)} max={max} onChange={setQty} label={titleOf(item)} />}
                <button className={`btn btn--dark btn--grow ${adding ? 'is-adding' : ''}`} disabled={max === 0 || adding} onClick={onAdd}>
                  {max === 0 ? 'All available units are in your bag' : adding ? <><Icon name="check" size={18} /> Added</> : <>Add to bag · {rupees(item.price * Math.max(1, Math.min(qty, max)))}</>}
                </button>
              </div>
            </>
          ) : (
            <p className={`pdp__status pdp__status--${st}`} role="status">{STATUS_TEXT[st]}</p>
          )}
          {inBag > 0 && <p className="pdp__inbag" role="status"><Icon name="check" size={16} /> {inBag} of this size in your bag · <button type="button" className="linkbtn" onClick={openDrawer}>View bag</button></p>}
          {(st === 'out_of_stock' || st === 'coming_soon') && <NotifyMe key={item.code} code={item.code} what={`${titleOf(item)}, ${packFull(item)}`} pack={packKind(item) ? packFull(item) : `${packLabel(item)} pack`} soon={st === 'coming_soon'} />}

          {considered && (
            <section className="glance" aria-labelledby="glance-h">
              <h2 id="glance-h" className="glance__h">At a glance</h2>
              <dl>
              <div><dt>Taste</dt><dd>{c.taste ? <Text copy={draft(c.taste)} /> : <Needed what="Taste notes" />}</dd></div>
              <div><dt>Ingredients</dt><dd><Text copy={c.ingredientsList} /></dd></div>
              <div><dt>Nutrition per 100 g</dt><dd>{c.nutrition ? c.nutrition.rows.filter(([l]) => !l.startsWith('of which')).slice(0, 4).map(([l, v]) => `${l.replace(/ \(.*\)/, '')} ${v}${/\((\w+)\)/.exec(l)?.[1] ?? ''}`).join(' · ') : <Needed what="Nutrition values" />}</dd></div>
              <div><dt>How to use</dt><dd>{firstStep ? <Text copy={draft(firstStep)} /> : <Needed what="Preparation" />} <a href="#details" className="glance__more">Full method</a></dd></div>
              <div><dt>Value</dt><dd>{unit}{value ? <><br /><span className="glance__value">{value.text}</span></> : null}</dd></div>
              </dl>
            </section>
          )}

          {st !== 'discontinued' && <DeliveryCheck item={item} />}
        </div>
      </div>

      {st === 'discontinued' && grid('alt-h', 'Instead', 'You may also like', related)}

      {considered ? (
        <>
          <section className="wrap pdp-details" id="details" aria-label="Product details">
            <div className="pdp-details__story">{experience}{ingredients}{serving}</div>
            {facts}
          </section>
          {grid('pairs-h', 'Complete the meal', 'Goes well with', pairs)}
          {st !== 'discontinued' && grid('related-h', cat?.title ?? 'More to explore', 'You may also like', related)}
        </>
      ) : (
        <>
          {grid('pairs-h', 'Complete the basket', 'Goes well with', pairs)}
          <section className="wrap pdp-details pdp-details--fold" id="details" aria-label="Product details">
            <div className="pdp-details__story">{experience}{serving}</div>
            <details className="fold">
              <summary>Ingredients, nutrition and storage <Icon name="chevron" size={18} /></summary>
              {ingredients}
              {facts}
            </details>
          </section>
          {st !== 'discontinued' && grid('related-h', cat?.title ?? 'More to explore', 'You may also like', related)}
        </>
      )}

      {item.rating && item.review_count ? (
        <section className="wrap section section--tight" id="reviews" aria-labelledby="reviews-h">
          <h2 id="reviews-h" className="display display--sm">Reviews</h2>
          <p>{item.rating.toFixed(1)} out of 5, from {item.review_count} reviews.</p>
        </section>
      ) : null}
    </div>
  );
}
