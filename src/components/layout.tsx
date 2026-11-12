import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { brandList, type Brand } from '../content/brands';
import { site } from '../content/site';
import type { CatalogueItem } from '../lib/api';
import { collectionOf, itemContent, paths, useBrand } from '../lib/brand';
import { rupees, packFull, packLabel, titleOf } from '../lib/format';
import { useBag, useCart, useCatalogue } from '../state/store';
import { Icon, Img, Stepper, Text } from './ui';
import { PackArt } from './PackArt';

function navFor(brand: Brand | null) {
  if (!brand) {
    return [
      ...brandList.map((b) => ({ to: paths.home(b), label: b.name, end: false })),
      { to: '/track', label: 'Track an order', end: true },
    ];
  }
  return [
    { to: paths.shop(brand), label: 'Shop', end: true },
    ...brand.collections.map((c) => ({ to: paths.collection(brand, c), label: c.title, end: true })),
    { to: paths.story(brand), label: brand.story.label, end: true },
    { to: paths.contact(brand), label: 'Contact', end: true },
  ];
}

export function Wordmark({ brand, as: Tag = 'span' }: { brand: Brand | null; as?: 'span' | 'p' }) {
  if (!brand) {
    return <Tag className="wordmark wordmark--house"><span className="wordmark__name">Torte Living</span><span className="wordmark__sub">Mia Torte · Nutri Sampoorna</span></Tag>;
  }
  return (
    <Tag className={`wordmark wordmark--${brand.theme}`}>
      <span className="wordmark__name">{brand.name}</span>
      <span className="wordmark__sub">{brand.descriptor}</span>
    </Tag>
  );
}

// ---------------------------------------------------------------- header
export function Header() {
  const brand = useBrand();
  const { count, openDrawer, bump } = useCart();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const [pulse, setPulse] = useState(false);
  const links = navFor(brand);
  const other = brand ? brandList.find((b) => b.code !== brand.code)! : null;
  const headerRef = useRef<HTMLElement>(null);

  // Sticky bars below the header (shop filters, product info) offset by its real height,
  // whatever the screen size, font size or number of nav links.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty('--header-total', `${el.offsetHeight}px`);
    set();
    const ro = 'ResizeObserver' in window ? new ResizeObserver(set) : null;
    ro?.observe(el);
    window.addEventListener('resize', set);
    return () => { ro?.disconnect(); window.removeEventListener('resize', set); };
  }, []);

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    if (!bump) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 650);
    return () => clearTimeout(t);
  }, [bump]);
  useEffect(() => {
    document.body.classList.toggle('no-scroll', menu);
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  return (
    <>
      <div className="topbar">
        <div className="wrap topbar__inner">
          <nav className="topbar__brands" aria-label="Torte Living brands">
            <NavLink to="/" end className="topbar__link">Torte Living</NavLink>
            {brandList.map((b) => <NavLink key={b.code} to={paths.home(b)} className="topbar__link">{b.name}</NavLink>)}
          </nav>
          <div className="topbar__right">
            <span className="topbar__note"><Icon name="hand" size={15} /> Pay on delivery</span>
            <NavLink to="/track" className="topbar__link">Track an order</NavLink>
          </div>
        </div>
      </div>
      <header className="header" ref={headerRef}>
        <div className="header__bar wrap">
          <div className="header__left">
            <button className="header__menu-btn icon-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-menu"
              aria-label={menu ? 'Close menu' : 'Open menu'}>
              <Icon name={menu ? 'close' : 'menu'} size={24} />
            </button>
          </div>
          <Link to={brand ? paths.home(brand) : '/'} className="header__mark" aria-label={`${brand?.name ?? site.name}, home`}>
            <Wordmark brand={brand} />
          </Link>
          <div className="header__right">
            <button className={`bag-btn ${pulse ? 'is-pulse' : ''}`} onClick={openDrawer} aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}>
              <Icon name="bag" size={24} />
              <span className={`bag-btn__count ${count ? '' : 'is-empty'}`} aria-hidden="true">{count}</span>
            </button>
          </div>
        </div>
        <nav className="header__nav" aria-label={brand ? `${brand.name}` : 'Main'}>
          <ul className="wrap">
            {links.map((l) => <li key={l.to}><NavLink to={l.to} end={l.end} className="navlink">{l.label}</NavLink></li>)}
          </ul>
        </nav>
        <div id="mobile-menu" className={`mobile-menu ${menu ? 'is-open' : ''}`} hidden={!menu}>
          <nav aria-label="Mobile">
            <ul>
              {links.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}
            </ul>
            <ul className="mobile-menu__minor">
              {other && <li><Link to={paths.home(other)}>Visit {other.name} <Icon name="arrow" size={16} /></Link></li>}
              {brand && <li><Link to="/track">Track an order</Link></li>}
              <li><Link to="/">Torte Living</Link></li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}

// ---------------------------------------------------------------- footer
export function Footer() {
  const brand = useBrand();
  const other = brand ? brandList.find((b) => b.code !== brand.code)! : null;
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <Wordmark brand={brand} as="p" />
          <p className="footer__line">{brand ? brand.tagline : 'Food deserves thought and attention.'}</p>
          <ul className="footer__contact">
            <li><Text copy={site.email} /></li>
            <li><Text copy={site.phone} /></li>
            <li><Text copy={site.hours} /></li>
          </ul>
        </div>
        {brand ? (
          <>
            <nav aria-label={`Shop ${brand.name}`} className="footer__col">
              <h2 className="footer__h">Shop</h2>
              <ul>
                <li><Link to={paths.shop(brand)}>{brand.shop.title}</Link></li>
                {brand.collections.map((c) => <li key={c.slug}><Link to={paths.collection(brand, c)}>{c.title}</Link></li>)}
              </ul>
            </nav>
            <nav aria-label={`About ${brand.name}`} className="footer__col">
              <h2 className="footer__h">{brand.name}</h2>
              <ul>
                <li><Link to={paths.story(brand)}>{brand.story.label}</Link></li>
                <li><Link to={paths.contact(brand)}>Contact</Link></li>
                {other && <li><Link to={paths.home(other)}>Visit {other.name}</Link></li>}
                <li><Link to="/">Torte Living</Link></li>
              </ul>
            </nav>
          </>
        ) : (
          brandList.map((b) => (
            <nav key={b.code} aria-label={b.name} className="footer__col">
              <h2 className="footer__h">{b.name}</h2>
              <ul>
                <li><Link to={paths.home(b)}>Home</Link></li>
                <li><Link to={paths.shop(b)}>Shop</Link></li>
                <li><Link to={paths.story(b)}>{b.story.label}</Link></li>
                <li><Link to={paths.contact(b)}>Contact</Link></li>
              </ul>
            </nav>
          ))
        )}
        <nav aria-label="Help" className="footer__col">
          <h2 className="footer__h">Help</h2>
          <ul>
            <li><Link to="/track">Track an order</Link></li>
            <li><Link to="/shipping">Shipping &amp; delivery</Link></li>
            <li><Link to="/refunds">Returns &amp; refunds</Link></li>
            <li><Link to="/privacy">Privacy policy</Link></li>
            <li><Link to="/terms">Terms of sale</Link></li>
          </ul>
        </nav>
      </div>
      <div className="wrap footer__legal">
        <p>{brand ? `${brand.name} is a brand of ` : ''}{site.legalEntity} · <Text copy={site.fssaiLicence} /></p>
        <p>© {year} {site.legalEntity}. All prices include GST.</p>
        <p><Link to="/credits">Photo credits</Link></p>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------- cart drawer
export function CartDrawer() {
  const brand = useBrand();
  const { drawerOpen, closeDrawer, setQty, remove, count } = useCart();
  const { rows, subtotal, hasProblems } = useBag();
  const { status } = useCatalogue();
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => { closeDrawer(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  // Closed drawer: keep it out of the tab order and the accessibility tree.
  useEffect(() => { panel.current?.toggleAttribute('inert', !drawerOpen); }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    returnTo.current = document.activeElement as HTMLElement;
    document.body.classList.add('no-scroll');
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
      if (e.key === 'Tab' && panel.current) {
        const f = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea')];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      returnTo.current?.focus?.();
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={`drawer ${drawerOpen ? 'is-open' : ''}`} aria-hidden={!drawerOpen}>
      <div className="drawer__scrim" onClick={closeDrawer} />
      <div className="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" ref={panel}>
        <div className="drawer__head">
          <h2 id="drawer-title" className="drawer__title">Your bag <span className="drawer__count">{count ? `(${count})` : ''}</span></h2>
          <button className="icon-btn" onClick={closeDrawer} aria-label="Close bag" data-autofocus><Icon name="close" size={24} /></button>
        </div>

        {rows.length === 0 ? (
          <div className="drawer__empty">
            <p className="drawer__empty-title">Your bag is empty.</p>
            <p>{brand ? brand.emptyBag : 'Something to savour, or something for the pantry?'}</p>
            <div className="drawer__empty-cta">
              {(brand ? [brand] : brandList).map((b) => <Link key={b.code} to={paths.shop(b)} className={`btn ${brand ? 'btn--dark' : 'btn--line'}`}>Browse {b.name}</Link>)}
            </div>
          </div>
        ) : (
          <>
            <ul className="drawer__lines">
              {rows.map((r) => {
                const href = r.item ? paths.product(r.item) : '/';
                return (
                  <li key={r.code} className={`line ${r.short ? 'line--problem' : ''}`}>
                    <Link to={href} className="line__img"><ProductThumb code={r.code} item={r.item} sizes="96px" /></Link>
                    <div className="line__body">
                      <p className="line__brand">{r.item?.brand ?? ' '}</p>
                      <p className="line__name"><Link to={href}>{r.item ? titleOf(r.item) : r.code}</Link></p>
                      {r.item && <p className="line__meta">{packFull(r.item)} · {rupees(r.item.price)}</p>}
                      {r.short && (
                        <p className="line__warn" role="status">
                          {!r.item || r.max === 0 ? 'No longer available' : `Only ${r.max} available`}
                          {r.item && r.max > 0 && <button className="linkbtn" onClick={() => setQty(r.code, r.max)}>Update to {r.max}</button>}
                        </p>
                      )}
                      <div className="line__row">
                        {r.item && r.max > 0
                          ? <Stepper size="sm" value={Math.min(r.qty, Math.max(r.max, 1))} max={r.max} label={titleOf(r.item)} onChange={(n) => setQty(r.code, n)} />
                          : <span />}
                        <button className="linkbtn" onClick={() => remove(r.code)}>Remove</button>
                      </div>
                    </div>
                    <p className="line__total">{r.item ? rupees(r.item.price * r.qty) : ''}</p>
                  </li>
                );
              })}
            </ul>
            <div className="drawer__foot">
              <div className="drawer__sum"><span>Subtotal</span><span>{status === 'ready' ? rupees(subtotal) : '—'}</span></div>
              <p className="drawer__note">Prices include GST. Delivery and the final total are confirmed at checkout.</p>
              <button className="btn btn--dark btn--block" disabled={hasProblems} onClick={() => navigate('/checkout')}>
                Checkout <Icon name="arrow" size={18} />
              </button>
              {hasProblems && <p className="drawer__note drawer__note--warn">Please update the items marked above to continue.</p>}
              <button className="btn btn--ghost btn--block" onClick={closeDrawer}>Continue shopping</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- product thumbnail (bag, checkout)
/** The product's first photo, or its illustrated placeholder. */
export function ProductThumb({ code, item, sizes }: { code: string; item: CatalogueItem | null; sizes: string }) {
  const img = item ? itemContent(item).images[0] : undefined;
  if (img) return <Img id={img} sizes={sizes} alt="" />;
  return <PackArt variant="thumb" product={item?.product} category={item?.category} brandCode={item?.brand_code ?? code.slice(0, 2)} />;
}

// ---------------------------------------------------------------- product card
/** Keep "500 g" on one line. */
const nb = (t: string) => t.replace(/ /g, '\u00a0');

/** One card per product. With several pack sizes it shows "from" the smallest and links to the product page to choose. */
export function ProductCard({ code, priority }: { code: string; priority?: boolean }) {
  const { byCode, items, comingSoon } = useCatalogue();
  const { add } = useCart();
  const item = byCode.get(code);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);
  if (!item) return null;
  const c = itemContent(item);
  const packs = items.filter((i) => i.product === item.product && i.brand_code === item.brand_code).sort((a, b) => a.pack_grams - b.pack_grams);
  const many = packs.length > 1;
  const soon = comingSoon(item);
  const soldOut = item.availability === 'sold_out';
  const href = paths.product(item);
  const minPrice = Math.min(...packs.map((p) => p.price));

  return (
    <article className="card">
      <Link to={href} className="card__media" tabIndex={-1} aria-hidden="true">
        {c.images[0]
          ? <Img id={c.images[0]} sizes="(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw" eager={priority} />
          : <PackArt product={item.product} category={item.category} brandCode={item.brand_code} />}
        {c.images[1] && <Img id={c.images[1]} className="card__alt" sizes="(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw" />}
        {soldOut && !soon && <span className="card__badge">Sold out</span>}
        {!soldOut && item.only_left && <span className="card__badge card__badge--low">Only {item.only_left} left</span>}
      </Link>
      <div className="card__body">
        <p className="card__brand">{collectionOf(item)?.title ?? item.brand}</p>
        <h3 className="card__title"><Link to={href}>{titleOf(item)}</Link></h3>
        {c.tagline && <p className="card__tagline">{c.tagline}</p>}
        <p className="card__pack">{many ? `${nb(packLabel(packs[0]))} to ${nb(packLabel(packs[packs.length - 1]))} · ${packs.length}\u00a0sizes` : nb(packFull(item))}</p>
        <div className="card__foot">
          <span className="card__price">
            {many && minPrice !== Math.max(...packs.map((p) => p.price)) && <span className="card__from">from </span>}
            {rupees(many ? minPrice : item.price)}
            {!many && item.mrp && item.mrp > item.price && <s className="card__mrp">{rupees(item.mrp)}</s>}
          </span>
          {soon ? (
            <span className="card__soon">Coming soon</span>
          ) : many ? (
            <Link to={href} className="add-btn" aria-label={`Choose a size of ${titleOf(item)}`}>
              <span className="add-btn__label">Choose size</span>
            </Link>
          ) : (
            <button
              className={`add-btn ${added ? 'is-added' : ''}`}
              disabled={soldOut}
              onClick={() => { add(code); setAdded(true); }}
              aria-label={soldOut ? `${titleOf(item)} is sold out` : `Add ${titleOf(item)}, ${packFull(item)} to bag`}
            >
              <span className="add-btn__icon"><Icon name={added ? 'check' : 'plus'} size={18} /></span>
              <span className="add-btn__label">{soldOut ? 'Sold out' : added ? 'Added' : 'Add'}</span>
            </button>
          )}
        </div>
      </div>
      <span className="sr-only" role="status">{added ? `${titleOf(item)} added to bag` : ''}</span>
    </article>
  );
}
