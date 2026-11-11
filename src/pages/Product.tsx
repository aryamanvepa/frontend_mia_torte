import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { Icon, Img, PlaceholderTag, Price, Reveal, StockNote, Stepper, Text } from '../components/ui';
import { contentFor } from '../content/products';
import { SHOW_PLACEHOLDER_FLAGS, brands, site, type BrandCode } from '../content/site';
import { packLabel, titleOf } from '../lib/format';
import { useCart, useCatalogue } from '../state/store';
import { CatalogueStatus } from './Shop';
import { NotFound } from './Info';

export default function Product() {
  const { code = '' } = useParams();
  const { items, byCode, status } = useCatalogue();
  const { add, openDrawer, lines } = useCart();
  const item = byCode.get(code.toUpperCase());
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [adding, setAdding] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => { setQty(1); setActive(0); track.current?.scrollTo({ left: 0 }); }, [code]);
  useEffect(() => { if (item) document.title = `${titleOf(item)} ${packLabel(item)} · ${item.brand}`; }, [item]);

  if (status === 'loading') return <div className="pdp wrap"><div className="pdp__grid"><div className="sk sk--pdp" /><div><div className="sk sk--line" /><div className="sk sk--line sk--short" /></div></div></div>;
  if (status === 'error' && !item) return <div className="wrap section"><CatalogueStatus /></div>;
  if (!item) return <NotFound what="product" />;

  const c = contentFor(item.code, item.category);
  const siblings = items.filter((i) => i.product === item.product && i.brand_code === item.brand_code).sort((a, b) => a.pack_grams - b.pack_grams);
  const related = items.filter((i) => i.code !== item.code && i.product !== item.product && i.availability !== 'sold_out')
    .sort((a, b) => Number(b.brand_code === item.brand_code) - Number(a.brand_code === item.brand_code)).slice(0, 4);
  const inBag = lines.find((l) => l.code === item.code)?.qty ?? 0;
  const max = Math.max(0, item.max_qty - inBag);
  const soldOut = item.availability === 'sold_out';
  const isMT = item.brand_code === 'MT';
  const brandInfo = brands[item.brand_code as BrandCode];

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
    <div className={`pdp ${isMT ? '' : 'pdp--ns'}`}>
      <nav className="crumbs wrap" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link><span aria-hidden="true">/</span>
        <Link to={`/shop?brand=${item.brand_code}`}>{item.brand}</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{titleOf(item)}</span>
      </nav>

      <div className="wrap pdp__grid">
        <div className="gallery">
          <div className="gallery__track" ref={track} onScroll={onScroll} tabIndex={0} aria-label="Product photos">
            {c.images.map((id, n) => (
              <div className="gallery__slide" key={id} aria-hidden={n !== active}>
                <Img id={id} eager={n === 0} sizes="(min-width: 900px) 55vw, 100vw" className="zoomable" />
              </div>
            ))}
          </div>
          {c.images.length > 1 && (
            <div className="gallery__thumbs">
              {c.images.map((id, n) => (
                <button key={id} className={`thumb ${n === active ? 'is-on' : ''}`} onClick={() => goTo(n)} aria-label={`Show photo ${n + 1} of ${c.images.length}`} aria-current={n === active}>
                  <Img id={id} sizes="80px" alt="" eager />
                </button>
              ))}
            </div>
          )}
          {SHOW_PLACEHOLDER_FLAGS && <p className="gallery__note">Stock photography, to be replaced <PlaceholderTag label="Placeholder" /></p>}
        </div>

        <div className="pdp__info">
          <p className="eyebrow">{item.brand} · {item.category}</p>
          <h1 className="display display--lg pdp__title">{titleOf(item)}</h1>
          {c.tagline && <Text as="p" className="pdp__tagline" copy={c.tagline} />}
          <div className="pdp__price"><Price item={item} size="lg" /></div>
          <p className="pdp__tax">Inclusive of all taxes · {packLabel(item)}</p>

          {siblings.length > 1 && (
            <fieldset className="sizes">
              <legend>Pack size</legend>
              <div className="sizes__row">
                {siblings.map((s) => (
                  <Link key={s.code} to={`/product/${s.code}`} className={`size ${s.code === item.code ? 'is-on' : ''} ${s.availability === 'sold_out' ? 'is-out' : ''}`}
                    aria-current={s.code === item.code ? 'true' : undefined} replace>
                    {packLabel(s)}
                  </Link>
                ))}
              </div>
            </fieldset>
          )}

          <div className="pdp__stock"><StockNote item={item} /></div>

          <div className="pdp__buy">
            {!soldOut && max > 0 && <Stepper value={Math.min(qty, max)} max={max} onChange={setQty} label={titleOf(item)} />}
            <button className={`btn btn--dark btn--grow ${adding ? 'is-adding' : ''}`} disabled={soldOut || max === 0 || adding} onClick={onAdd}>
              {soldOut ? 'Sold out' : max === 0 ? 'All available units are in your bag' : adding ? <><Icon name="check" size={18} /> Added</> : <>Add to bag</>}
            </button>
          </div>
          {soldOut && <p className="pdp__hint">This one is sold out for now. Fresh batches are on their way.</p>}

          <ul className="pdp__assure">
            <li><Icon name="hand" size={18} /> {site.codNote}</li>
            <li><Icon name="truck" size={18} /> <Text copy={site.deliveryNote} /></li>
          </ul>

          <div className="accordion">
            <details open>
              <summary>Description</summary>
              {c.description ? <Text as="p" copy={c.description} /> : <p className="is-ph">Details coming soon. <PlaceholderTag label="Content needed" /></p>}
            </details>
            {c.notes?.length ? (
              <details>
                <summary>{isMT ? 'Tasting notes' : 'Highlights'}</summary>
                <ul className="notes">{c.notes.map((n) => <li key={n}>{n}</li>)}</ul>
              </details>
            ) : null}
            <details>
              <summary>Ingredients &amp; allergens</summary>
              {c.ingredients ? <Text as="p" copy={c.ingredients} /> : <p className="is-ph">Ingredients to be added. <PlaceholderTag label="Content needed" /></p>}
              {c.allergens ? <Text as="p" className="allergens" copy={c.allergens} /> : <p className="is-ph">Allergen information to be added. <PlaceholderTag label="Content needed" /></p>}
            </details>
            <details>
              <summary>Storage</summary>
              {c.storage ? <Text as="p" copy={c.storage} /> : <p className="is-ph">Storage advice to be added. <PlaceholderTag label="Content needed" /></p>}
            </details>
          </div>
          <p className="pdp__brandline">{brandInfo?.blurb}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section wrap" aria-labelledby="related-h">
          <Reveal className="section__head">
            <p className="eyebrow">You may also like</p>
            <h2 id="related-h" className="display display--md">From the same kitchen</h2>
          </Reveal>
          <div className="grid grid--feature">
            {related.map((i, n) => <Reveal key={i.code} delay={n * 80}><ProductCard code={i.code} /></Reveal>)}
          </div>
        </section>
      )}
    </div>
  );
}
