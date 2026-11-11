import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { brands, site } from '../content/site';
import { contentFor } from '../content/products';
import { rupees, packLabel, titleOf } from '../lib/format';
import { useBag, useCart, useCatalogue } from '../state/store';
import { Icon, Img, Stepper, Text } from './ui';

// ---------------------------------------------------------------- header
export function Header() {
  const { count, openDrawer, bump } = useCart();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [pulse, setPulse] = useState(false);
  const overHero = pathname === '/';

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
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

  const links = [
    { to: '/shop', label: 'Shop all' },
    { to: '/shop?brand=MT', label: 'Patisserie' },
    { to: '/shop?brand=NS', label: 'The Pantry' },
    { to: '/about', label: 'Our story' },
  ];

  return (
    <header className={`header ${scrolled || !overHero || menu ? 'header--solid' : ''}`}>
      <div className="header__inner wrap">
        <button className="header__menu-btn icon-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-menu"
          aria-label={menu ? 'Close menu' : 'Open menu'}>
          <Icon name={menu ? 'close' : 'menu'} size={24} />
        </button>
        <nav className="header__nav" aria-label="Main">
          {links.slice(0, 3).map((l) => <NavLink key={l.to} to={l.to} className="navlink" end>{l.label}</NavLink>)}
        </nav>
        <Link to="/" className="wordmark" aria-label={`${site.name}, home`}>
          <span className="wordmark__name">Mia Torte</span>
          <span className="wordmark__sub">by Torte Living</span>
        </Link>
        <div className="header__right">
          <NavLink to="/about" className="navlink header__desk">Our story</NavLink>
          <NavLink to="/track" className="navlink header__desk">Track order</NavLink>
          <button className={`bag-btn ${pulse ? 'is-pulse' : ''}`} onClick={openDrawer} aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}>
            <Icon name="bag" size={24} />
            <span className={`bag-btn__count ${count ? '' : 'is-empty'}`} aria-hidden="true">{count}</span>
          </button>
        </div>
      </div>
      <div id="mobile-menu" className={`mobile-menu ${menu ? 'is-open' : ''}`} hidden={!menu}>
        <nav aria-label="Mobile">
          <ul>
            {[...links, { to: '/track', label: 'Track your order' }].map((l, i) => (
              <li key={l.to} style={{ transitionDelay: `${60 + i * 40}ms` }}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
          <p className="mobile-menu__note">{brands.MT.name} &amp; {brands.NS.name} · {site.legalEntity}</p>
        </nav>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- footer
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <p className="footer__mark">Mia Torte</p>
          <p className="footer__line">Patisserie &amp; pantry from {site.legalEntity}.</p>
          <p className="footer__cod"><Icon name="hand" size={18} /> Pay on delivery across our delivery areas.</p>
        </div>
        <nav aria-label="Shop" className="footer__col">
          <h2 className="footer__h">Shop</h2>
          <ul>
            <li><Link to="/shop?brand=MT">{brands.MT.name}</Link></li>
            <li><Link to="/shop?brand=NS">{brands.NS.name}</Link></li>
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/track">Track an order</Link></li>
          </ul>
        </nav>
        <nav aria-label="Information" className="footer__col">
          <h2 className="footer__h">Information</h2>
          <ul>
            <li><Link to="/about">Our story</Link></li>
            <li><Link to="/shipping">Shipping &amp; delivery</Link></li>
            <li><Link to="/refunds">Returns &amp; refunds</Link></li>
            <li><Link to="/privacy">Privacy policy</Link></li>
            <li><Link to="/terms">Terms of sale</Link></li>
          </ul>
        </nav>
        <div className="footer__col">
          <h2 className="footer__h">Contact</h2>
          <ul className="footer__contact">
            <li><Text copy={site.email} /></li>
            <li><Text copy={site.phone} /></li>
            <li><Text copy={site.hours} /></li>
          </ul>
        </div>
      </div>
      <div className="wrap footer__legal">
        <p><Text copy={site.fssaiLicence} /></p>
        <p>© {new Date().getFullYear()} {site.legalEntity}. All prices include GST.</p>
        <p><Link to="/credits">Photo credits</Link></p>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------- cart drawer
export function CartDrawer() {
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
            <p>Something sweet, perhaps?</p>
            <Link to="/shop" className="btn btn--dark">Browse the shop</Link>
          </div>
        ) : (
          <>
            <ul className="drawer__lines">
              {rows.map((r) => {
                const c = contentFor(r.code, r.item?.category ?? null);
                return (
                  <li key={r.code} className={`line ${r.short ? 'line--problem' : ''}`}>
                    <Link to={`/product/${r.code}`} className="line__img"><Img id={c.images[0]} sizes="96px" alt="" /></Link>
                    <div className="line__body">
                      <p className="line__brand">{r.item?.brand ?? ' '}</p>
                      <p className="line__name"><Link to={`/product/${r.code}`}>{r.item ? titleOf(r.item) : r.code}</Link></p>
                      {r.item && <p className="line__meta">{packLabel(r.item)} · {rupees(r.item.price)}</p>}
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
              <p className="drawer__note">Prices include GST. Delivery and final total are confirmed at checkout.</p>
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

// ---------------------------------------------------------------- product card
export function ProductCard({ code, priority }: { code: string; priority?: boolean }) {
  const { byCode } = useCatalogue();
  const { add } = useCart();
  const item = byCode.get(code);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);
  if (!item) return null;
  const c = contentFor(code, item.category);
  const soldOut = item.availability === 'sold_out';
  const brandKey = item.brand_code === 'NS' ? 'ns' : 'mt';

  return (
    <article className={`card card--${brandKey}`}>
      <Link to={`/product/${code}`} className="card__media" tabIndex={-1} aria-hidden="true">
        <Img id={c.images[0]} sizes="(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw" eager={priority} />
        {c.images[1] && <Img id={c.images[1]} className="card__alt" sizes="(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw" />}
        {soldOut && <span className="card__badge">Sold out</span>}
        {!soldOut && item.only_left && <span className="card__badge card__badge--low">Only {item.only_left} left</span>}
      </Link>
      <div className="card__body">
        <p className="card__brand">{item.brand}</p>
        <h3 className="card__title"><Link to={`/product/${code}`}>{titleOf(item)}</Link></h3>
        <p className="card__pack">{packLabel(item)}</p>
        <div className="card__foot">
          <span className="card__price">{rupees(item.price)}{item.mrp && item.mrp > item.price && <s className="card__mrp">{rupees(item.mrp)}</s>}</span>
          <button
            className={`add-btn ${added ? 'is-added' : ''}`}
            disabled={soldOut}
            onClick={() => { add(code); setAdded(true); }}
            aria-label={soldOut ? `${titleOf(item)} is sold out` : `Add ${titleOf(item)}, ${packLabel(item)} to bag`}
          >
            <span className="add-btn__icon"><Icon name={added ? 'check' : 'plus'} size={18} /></span>
            <span className="add-btn__label">{soldOut ? 'Sold out' : added ? 'Added' : 'Add'}</span>
          </button>
        </div>
      </div>
      <span className="sr-only" role="status">{added ? `${titleOf(item)} added to bag` : ''}</span>
    </article>
  );
}
