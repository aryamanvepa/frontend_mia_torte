import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { brandList } from '../content/brands';
import { site } from '../content/site';
import { pairings, storeCategories } from '../content/store';
import { openConsentSettings, analyticsConfigured } from '../lib/analytics';
import type { CatalogueItem } from '../lib/api';
import { bestsellers, isNew, itemContent, oneCardPerProduct, paths, primaryCategoryOf, storeCategoriesOf } from '../lib/brand';
import { rupees, packFull, savingPct, titleOf } from '../lib/format';
import { search } from '../lib/search';
import { useBag, useCart, useCatalogue } from '../state/store';
import { Icon, Img, Stepper, Text } from './ui';
import { PackArt } from './PackArt';

const NAV = [
  { to: paths.shop(), label: 'Shop All' },
  ...storeCategories.map((c) => ({ to: paths.category(c), label: c.title })),
  { to: paths.bestsellers(), label: 'Bestsellers' },
];

export function Wordmark({ as: Tag = 'span' }: { as?: 'span' | 'p' }) {
  return <Tag className="wordmark wordmark--house"><span className="wordmark__name">Torte Living</span><span className="wordmark__sub">Mia Torte · Nutri Sampoorna</span></Tag>;
}

// ---------------------------------------------------------------- search box (header)
function SearchBox({ onDone, autoFocus }: { onDone?: () => void; autoFocus?: boolean }) {
  const { items } = useCatalogue();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const hits = useMemo(() => (q.trim().length >= 2 ? search(items, q).slice(0, 5) : []), [items, q]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(paths.search(q.trim()));
    setQ('');
    onDone?.();
  };
  return (
    <form className="searchbox" role="search" onSubmit={submit}>
      <label className="sr-only" htmlFor="site-search">Search the shop</label>
      <Icon name="search" size={20} className="searchbox__icon" />
      <input id="site-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cookies, snacks, atta…"
        autoComplete="off" enterKeyHint="search" autoFocus={autoFocus} aria-controls={hits.length ? 'search-suggest' : undefined} />
      {hits.length > 0 && (
        <ul className="searchbox__suggest" id="search-suggest" aria-label="Suggestions">
          {hits.map((h) => (
            <li key={h.code}>
              <Link to={paths.product(h)} onClick={() => { setQ(''); onDone?.(); }}>
                <span className="searchbox__thumb"><ProductThumb code={h.code} item={h} sizes="48px" /></span>
                <span><strong>{h.product}</strong><small>{h.brand} · {primaryCategoryOf(h)?.title ?? h.category}</small></span>
              </Link>
            </li>
          ))}
          <li><button type="submit" className="searchbox__all">See all results for “{q.trim()}” <Icon name="arrow" size={16} /></button></li>
        </ul>
      )}
    </form>
  );
}

// ---------------------------------------------------------------- header
export function Header() {
  const { count, openDrawer, bump } = useCart();
  const { shipping } = useCatalogue();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const [pulse, setPulse] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Sticky bars below the header offset by its real height, whatever the screen size.
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

  useEffect(() => { setMenu(false); }, [pathname]);
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
          {/* Service promise, not payment: payment options are shown at checkout and in the footer. */}
          <p className="topbar__note"><Icon name="truck" size={15} /> {shipping ? `Free delivery on orders over ${rupees(shipping.free_above)}` : 'Delivering across India'}<span className="topbar__extra"> · One basket for the whole store</span></p>
          <div className="topbar__right">
            <NavLink to="/track" className="topbar__link">Track an order</NavLink>
            <NavLink to="/contact" className="topbar__link">Help</NavLink>
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
            <div className="header__search-inline"><SearchBox /></div>
          </div>
          <Link to="/" className="header__mark" aria-label={`${site.name}, home`}><Wordmark /></Link>
          <div className="header__right">
            {/* Account icon hidden until customer accounts (backend B8) are approved. */}
            <button className={`bag-btn ${pulse ? 'is-pulse' : ''}`} onClick={openDrawer} aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}>
              <Icon name="bag" size={24} />
              <span className="bag-btn__label" aria-hidden="true">Bag</span>
              <span className={`bag-btn__count ${count ? '' : 'is-empty'}`} aria-hidden="true">{count}</span>
            </button>
          </div>
        </div>
        {/* Phones and tablets: search is always on screen, under the logo. */}
        <div className="search-row wrap"><SearchBox /></div>
        <nav className="header__nav" aria-label="Shop">
          <ul className="wrap">
            {NAV.map((l) => <li key={l.to}><NavLink to={l.to} end className="navlink">{l.label}</NavLink></li>)}
          </ul>
        </nav>
        <div id="mobile-menu" className={`mobile-menu ${menu ? 'is-open' : ''}`} hidden={!menu}>
          <nav aria-label="Shop (menu)">
            <ul>{NAV.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul>
            <ul className="mobile-menu__minor">
              <li><Link to="/track">Track an order</Link></li>
              {brandList.map((b) => <li key={b.code}><Link to={paths.brand(b)}>About {b.name}</Link></li>)}
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}

// ---------------------------------------------------------------- footer
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <Wordmark as="p" />
          <p className="footer__line">Something delicious is waiting.</p>
          <ul className="footer__contact">
            <li><Text copy={site.email} /></li>
            <li><Text copy={site.phone} /></li>
            <li><Text copy={site.hours} /></li>
          </ul>
        </div>
        <nav aria-label="Shop" className="footer__col">
          <h2 className="footer__h">Shop</h2>
          <ul>{NAV.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul>
        </nav>
        <nav aria-label="Help" className="footer__col">
          <h2 className="footer__h">Help</h2>
          <ul>
            <li><Link to="/track">Track an order</Link></li>
            <li><Link to="/shipping">Shipping &amp; delivery</Link></li>
            <li><Link to="/refunds">Returns &amp; refunds</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company" className="footer__col">
          <h2 className="footer__h">Company</h2>
          <ul>
            <li><Link to="/about">About Torte Living</Link></li>
            {brandList.map((b) => <li key={b.code}><Link to={paths.brand(b)}>{b.name}</Link></li>)}
            <li><Link to="/privacy">Privacy policy</Link></li>
            <li><Link to="/terms">Terms of sale</Link></li>
            {analyticsConfigured && <li><button type="button" className="footer__linkbtn" onClick={openConsentSettings}>Cookie settings</button></li>}
          </ul>
        </nav>
      </div>
      <div className="wrap footer__legal">
        <p>Mia Torte and Nutri Sampoorna are brands of {site.legalEntity} · <Text copy={site.fssaiLicence} /></p>
        <p>© {year} {site.legalEntity}. All prices include GST. Payment on delivery; payment options are shown at checkout.</p>
        <p><Link to="/credits">Photo credits</Link></p>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------- recommendations
/**
 * "Goes well with": products from the categories that pair with what's being bought (content/store.ts
 * `pairings`: cookies → brownies, snacks; atta → dosa mixes, breakfast), then other categories, then the rest.
 * Bestsellers first within each group. Only products that can be bought now (or, before launch, coming soon).
 */
export function useComplements(codes: string[], n = 3) {
  const { items, byCode, statusOf } = useCatalogue();
  return useMemo(() => {
    const inBag = codes.map((c) => byCode.get(c)).filter(Boolean) as CatalogueItem[];
    const products = new Set(inBag.map((i) => i.product));
    const cats = new Set(inBag.flatMap((i) => storeCategoriesOf(i).map((c) => c.slug)));
    const opsCat = (i: CatalogueItem) => (i.category ?? '').trim().toLowerCase();
    const wanted = inBag.flatMap((i) => pairings[opsCat(i)] ?? []);
    const unique = bestsellers(items, 40).concat(oneCardPerProduct(items)).filter((i, idx, arr) => arr.findIndex((x) => x.product === i.product) === idx)
      .filter((i) => !products.has(i.product));
    const buyable = unique.filter((i) => statusOf(i) === 'available');
    const pool = buyable.length ? buyable : unique.filter((i) => statusOf(i) === 'coming_soon');
    const score = (i: CatalogueItem) => {
      const w = wanted.indexOf(opsCat(i));
      if (w >= 0) return w;
      return storeCategoriesOf(i).some((c) => cats.has(c.slug)) ? 200 : 100;
    };
    return pool.map((i, k) => ({ i, k })).sort((a, b) => score(a.i) - score(b.i) || a.k - b.k).map((x) => x.i).slice(0, n);
  }, [codes.join(','), items, byCode, statusOf]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ---------------------------------------------------------------- cart drawer
export function CartDrawer() {
  const { drawerOpen, closeDrawer, setQty, remove, count, lines } = useCart();
  const { rows, subtotal, hasProblems } = useBag();
  const { status, statusOf, shipping } = useCatalogue();
  // Free-delivery nudge (display only: the server works out the delivery charge at checkout).
  const toFree = shipping ? Math.max(0, shipping.free_above - subtotal) : null;
  const complements = useComplements(lines.map((l) => l.code));
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => { closeDrawer(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
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
            <p>Something to savour, a better snack, or something for the pantry?</p>
            <div className="drawer__empty-cta">
              <Link to={paths.shop()} className="btn btn--dark">Shop all</Link>
              <Link to={paths.bestsellers()} className="btn btn--line">Bestsellers</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="drawer__scroll">
              {shipping && toFree !== null && (
                <div className={`freebar ${toFree === 0 ? 'is-done' : ''}`} role="status">
                  <p>{toFree === 0 ? <><Icon name="check" size={16} /> Your order qualifies for free delivery.</> : <>Add <strong>{rupees(toFree)}</strong> more for free delivery.</>}</p>
                  <span className="freebar__track" aria-hidden="true"><span style={{ width: `${Math.min(100, (subtotal / shipping.free_above) * 100)}%` }} /></span>
                </div>
              )}
              <ul className="drawer__lines">
                {rows.map((r) => {
                  const href = r.item ? paths.product(r.item) : '/';
                  return (
                    <li key={r.code} className={`line ${r.short ? 'line--problem' : ''}`}>
                      <Link to={href} className="line__img"><ProductThumb code={r.code} item={r.item} sizes="96px" /></Link>
                      <div className="line__body">
                        <p className="line__brand">{r.item?.brand ?? ' '}</p>
                        <p className="line__name"><Link to={href}>{r.item ? titleOf(r.item) : r.code}</Link></p>
                        {r.item && <p className="line__meta">{packFull(r.item)}{statusOf(r.item) !== 'discontinued' && ` · ${rupees(r.item.price)}`}</p>}
                        {r.short && (
                          <p className="line__warn" role="status">
                            {!r.item || statusOf(r.item) === 'discontinued' ? 'No longer available. Please remove it to continue.'
                              : r.max === 0 ? (statusOf(r.item) === 'coming_soon' ? 'Not on sale yet. Please remove it to continue.' : 'Out of stock for now. Please remove it to continue.')
                              : `Only ${r.max} available`}
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
                      <p className="line__total">{r.item && statusOf(r.item) !== 'discontinued' ? rupees(r.item.price * r.qty) : ''}</p>
                    </li>
                  );
                })}
              </ul>
              {complements.length > 0 && (
                <section className="suggest" aria-labelledby="suggest-h">
                  <h3 id="suggest-h" className="suggest__h">Goes well with</h3>
                  <ul>{complements.map((i) => <li key={i.code}><MiniCard item={i} /></li>)}</ul>
                </section>
              )}
            </div>
            <div className="drawer__foot">
              <div className="drawer__sum"><span>Subtotal</span><span>{status === 'ready' ? rupees(subtotal) : '—'}</span></div>
              <p className="drawer__note">Prices include GST. Delivery, any promo code and the final total are shown at checkout.</p>
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

/** Compact product row with quick add, for suggestions. */
export function MiniCard({ item }: { item: CatalogueItem }) {
  return (
    <div className="mini">
      <Link to={paths.product(item)} className="mini__img"><ProductThumb code={item.code} item={item} sizes="64px" /></Link>
      <div className="mini__body">
        <Link to={paths.product(item)} className="mini__name">{item.product}</Link>
        <span className="mini__meta">{item.brand} · from {rupees(item.price)}</span>
      </div>
      <QuickAdd item={item} compact />
    </div>
  );
}

// ---------------------------------------------------------------- product thumbnail (bag, checkout, search)
/** The product's first photo, or its illustrated placeholder. */
export function ProductThumb({ code, item, sizes }: { code: string; item: CatalogueItem | null; sizes: string }) {
  const img = item ? itemContent(item).images[0] : undefined;
  if (img) return <Img id={img} sizes={sizes} alt="" />;
  return <PackArt variant="thumb" product={item?.product} category={item?.category} brandCode={item?.brand_code ?? code.slice(0, 2)} />;
}

// ---------------------------------------------------------------- quick add (with size picker)
/** Adds straight to the bag; when a product comes in several sizes, opens a small size picker first. */
const isPhone = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;

const STATUS_LABEL = { out_of_stock: 'Out of stock', coming_soon: 'Coming soon', discontinued: 'No longer available' } as const;

/**
 * Add to bag without leaving the page. With `pack`, adds that exact size (product cards pick the size
 * themselves); without, a product with several sizes opens a size picker (dropdown, or a bottom sheet on phones).
 * Only available packs can be added: anything else shows its status instead.
 */
export function QuickAdd({ item, pack, compact }: { item: CatalogueItem; pack?: CatalogueItem; compact?: boolean }) {
  const { items, statusOf } = useCatalogue();
  const { add, openDrawer, lines } = useCart();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(false);
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const packs = items.filter((i) => i.product === item.product && i.brand_code === item.brand_code).sort((a, b) => a.pack_grams - b.pack_grams);
  const buyable = packs.filter((p) => statusOf(p) === 'available');
  // How many of this product (all sizes together) are already in the bag, and of each size.
  const qtyOf = (code: string) => lines.find((l) => l.code === code)?.qty ?? 0;
  const inBag = packs.reduce((n, p) => n + qtyOf(p.code), 0);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      const t = e.target as Node;
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(t) && !sheetRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);

  const target = pack ?? (packs.length === 1 ? packs[0] : undefined);
  const targetStatus = target ? statusOf(target) : buyable.length ? 'available' : statusOf(packs[0] ?? item);
  if (targetStatus !== 'available') {
    // Not buyable: say why. Out of stock links to the product page, where "Notify me" lives.
    return targetStatus === 'out_of_stock'
      ? <Link to={paths.product(target ?? item)} className="card__notify">Notify me</Link>
      : <span className="card__soon">{STATUS_LABEL[targetStatus]}</span>;
  }
  // On phones the bag opens after adding, so it's obvious the item went in.
  const addPack = (p: CatalogueItem) => { add(p.code); setAdded(true); setOpen(false); if (compact || isPhone()) openDrawer(); };
  const toggle = () => { setPhone(isPhone()); setOpen((o) => !o); };
  const options = (
    <ul className="quickadd__menu" role="listbox" aria-label={`Sizes of ${item.product}`}>
      {packs.map((p) => {
        const can = buyable.includes(p);
        return (
          <li key={p.code} role="option" aria-selected={false} aria-disabled={!can}>
            <button type="button" disabled={!can} onClick={() => addPack(p)}>
              <span>{packFull(p)}{qtyOf(p.code) > 0 && <small className="quickadd__inbag"> · {qtyOf(p.code)} in bag</small>}</span>
              <span>{can ? rupees(p.price) : STATUS_LABEL[statusOf(p) as keyof typeof STATUS_LABEL] ?? 'Unavailable'}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="quickadd" ref={ref}>
      <button type="button" className={`add-btn ${added ? 'is-added' : ''} ${compact ? 'add-btn--sm' : ''}`}
        onClick={() => (target ? addPack(target) : toggle())}
        aria-haspopup={target ? undefined : 'listbox'} aria-expanded={target ? undefined : open}
        aria-label={(target ? `Add ${item.product}, ${packFull(target)} to bag` : `Choose a size of ${item.product} to add`) + (inBag ? ` (${inBag} in bag)` : '')}>
        <span className="add-btn__icon"><Icon name={added ? 'check' : 'plus'} size={18} /></span>
        <span className="add-btn__label">{added ? 'Added' : 'Add'}</span>
        {inBag > 0 && <span key={inBag} className="add-btn__count" aria-hidden="true">{inBag}</span>}
      </button>
      {open && !phone && options}
      {open && phone && createPortal(
        // Phones: a bottom sheet on top of the whole page (rendered at the end of <body>, so no card can paint over it).
        <div className="qa-sheet" ref={sheetRef}>
          <div className="qa-sheet__scrim" onClick={() => setOpen(false)} />
          <div className="qa-sheet__panel" role="dialog" aria-modal="true" aria-label={`Choose a size of ${item.product}`}>
            <p className="qa-sheet__h">Choose a size<span>{item.product}</span></p>
            {options}
            <button type="button" className="btn btn--ghost btn--block" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>,
        document.body,
      )}
      <span className="sr-only" role="status">{added ? `${item.product} added to bag, ${inBag} in bag` : ''}</span>
    </div>
  );
}

// ---------------------------------------------------------------- product card
/** Keep "500 g" on one line. */
const nb = (t: string) => t.replace(/ /g, ' ');

/**
 * One card per product. Photo, name, short description, size, price (and discount), Quick Add: everything
 * needed to buy without opening the product page. The brand is a small secondary line, never the headline.
 * Several sizes: a size menu on the card; price and Quick Add follow the chosen size.
 */
export function ProductCard({ code, priority }: { code: string; priority?: boolean }) {
  const { byCode, items, statusOf } = useCatalogue();
  const { lines } = useCart();
  const item = byCode.get(code);
  const packs = item ? items.filter((i) => i.product === item.product && i.brand_code === item.brand_code).sort((a, b) => a.pack_grams - b.pack_grams) : [];
  const firstBuyable = packs.find((p) => statusOf(p) === 'available');
  const [chosen, setChosen] = useState<string | null>(null);
  if (!item) return null;
  const pack = packs.find((p) => p.code === chosen) ?? (statusOf(item) === 'available' ? item : firstBuyable ?? item);
  const c = itemContent(item);
  const many = packs.length > 1;
  const href = paths.product(pack);
  const status = statusOf(pack);
  const save = savingPct(pack);
  const qtyOf = (k: string) => lines.find((l) => l.code === k)?.qty ?? 0;

  return (
    <article className={`card card--${status}`}>
      <Link to={href} className="card__media" tabIndex={-1} aria-hidden="true">
        {c.images[0]
          ? <Img id={c.images[0]} sizes="(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw" eager={priority} />
          : <PackArt product={item.product} category={item.category} brandCode={item.brand_code} />}
        {c.images[1] && <Img id={c.images[1]} className="card__alt" sizes="(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw" />}
        <span className="card__badges">
          {isNew(item, items) && <span className="card__badge card__badge--new">New</span>}
          {status === 'available' && save > 0 && <span className="card__badge card__badge--save">{save}% off</span>}
          {status === 'available' && pack.only_left && <span className="card__badge card__badge--low">Only {pack.only_left} left</span>}
          {status === 'out_of_stock' && <span className="card__badge card__badge--out">Out of stock</span>}
        </span>
      </Link>
      <div className="card__body">
        <h3 className="card__title"><Link to={href}>{titleOf(item)}</Link></h3>
        {(c.summary || c.tagline) && <p className="card__summary">{c.summary ?? c.tagline}</p>}
        {many && <p className="card__brand">{item.brand}</p>}
        {many ? (
          <label className="card__size">
            <span className="sr-only">Pack size of {item.product}</span>
            <select value={pack.code} onChange={(e) => setChosen(e.target.value)}>
              {packs.map((p) => {
                const st = statusOf(p);
                const n = qtyOf(p.code);
                return <option key={p.code} value={p.code}>{nb(packFull(p))} · {rupees(p.price)}{st !== 'available' ? ` · ${STATUS_LABEL[st as keyof typeof STATUS_LABEL]}` : ''}{n ? ` · ${n} in bag` : ''}</option>;
              })}
            </select>
            <Icon name="chevron" size={16} className="card__size-icon" />
          </label>
        ) : <p className="card__pack">{nb(packFull(item))} <span className="card__brand card__brand--inline">· {item.brand}</span></p>}
        <div className="card__foot">
          <span className="card__price">
            {rupees(pack.price)}
            {save > 0 && <s className="card__mrp"><span className="sr-only">MRP </span>{rupees(pack.mrp!)}</s>}
          </span>
          <QuickAdd item={item} pack={pack} />
        </div>
      </div>
    </article>
  );
}

/** Category label for a product (its main store category). */
export const categoryLabel = (item: CatalogueItem) => primaryCategoryOf(item)?.title ?? item.category ?? '';
