import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { imageSet } from '../content/images';
import { SHOW_PLACEHOLDER_FLAGS, copyText, isPlaceholder, type Copy } from '../content/site';
import type { CatalogueItem } from '../lib/api';
import { rupees, savingPct } from '../lib/format';

// ---------------------------------------------------------------- image
export function Img({ id, sizes, className, eager, alt, style }: {
  id: string; sizes: string; className?: string; eager?: boolean; alt?: string; style?: CSSProperties;
}) {
  const s = imageSet(id);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => { if (ref.current?.complete) setLoaded(true); }, []);
  // A product photo held in the backend (a full URL) rather than one of the site's own images.
  if (/^https?:\/\//.test(id)) {
    return (
      <div className={`img ${loaded ? 'is-loaded' : ''} ${className ?? ''}`} style={style}>
        <img ref={ref} src={id} alt={alt ?? ''} loading={eager ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(true)} />
      </div>
    );
  }
  if (!s) return <div className={`img ${className ?? ''}`} aria-hidden="true" />;
  return (
    <div className={`img ${loaded ? 'is-loaded' : ''} ${className ?? ''}`} style={{ backgroundImage: `url(${s.lqip})`, ...style }}>
      <img
        ref={ref}
        src={s.src}
        srcSet={s.srcSet}
        sizes={sizes}
        width={s.width}
        height={s.height}
        alt={alt ?? s.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        {...(eager ? { fetchpriority: 'high' } : {})}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

// ---------------------------------------------------------------- scroll reveal
export function Reveal({ children, as: Tag = 'div', className = '', delay = 0 }: {
  children: ReactNode; as?: 'div' | 'section' | 'li' | 'article'; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const T = Tag as 'div';
  return (
    <T ref={ref as React.RefObject<HTMLDivElement>} className={`reveal ${shown ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </T>
  );
}

// ---------------------------------------------------------------- placeholder-aware text
export function PlaceholderTag({ label = 'Placeholder', kind = 'missing' }: { label?: string; kind?: 'missing' | 'draft' }) {
  if (!SHOW_PLACEHOLDER_FLAGS) return null;
  return kind === 'draft'
    ? <span className="ph-tag ph-tag--draft" title="Copy written to the brand brief. Torte Living to confirm the facts before launch">Draft · confirm</span>
    : <span className="ph-tag" title="To be supplied by Torte Living before launch">{label}</span>;
}

export function Text({ copy, as: Tag = 'span', className }: { copy: Copy | undefined; as?: 'span' | 'p' | 'div' | 'dd'; className?: string }) {
  if (copy === undefined) return null;
  const ph = isPlaceholder(copy) && SHOW_PLACEHOLDER_FLAGS;
  return (
    <Tag className={`${className ?? ''} ${ph ? 'is-ph' : ''}`}>
      {copyText(copy)}
      {ph && <> <PlaceholderTag kind={(copy as { kind: 'missing' | 'draft' }).kind} /></>}
    </Tag>
  );
}

// ---------------------------------------------------------------- price & stock
export function Price({ item, size = 'md' }: { item: Pick<CatalogueItem, 'price' | 'mrp'>; size?: 'md' | 'lg' }) {
  const save = savingPct(item);
  return (
    <span className={`price price--${size}`}>
      <span className="price__now">{rupees(item.price)}</span>
      {save > 0 && (
        <>
          <span className="price__mrp"><span className="sr-only">MRP </span><s>{rupees(item.mrp!)}</s></span>
          <span className="price__save">{save}% off</span>
        </>
      )}
    </span>
  );
}

/** Stock line for a pack that can be bought (other statuses have their own message). */
export function StockNote({ item }: { item: Pick<CatalogueItem, 'availability' | 'only_left' | 'test_stock'> }) {
  if (item.test_stock) return <span className="stock stock--test">Test mode: can be ordered</span>;
  if (item.only_left) return <span className="stock stock--low">Only {item.only_left} left</span>;
  if (item.availability === 'low') return <span className="stock stock--low">Few left</span>;
  return <span className="stock stock--in">In stock</span>;
}

// ---------------------------------------------------------------- quantity stepper
export function Stepper({ value, max, onChange, label, size = 'md' }: {
  value: number; max: number; onChange: (n: number) => void; label: string; size?: 'sm' | 'md';
}) {
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity"><Icon name="minus" /></button>
      <output aria-live="polite" aria-label="Quantity">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity"><Icon name="plus" /></button>
    </div>
  );
}

// ---------------------------------------------------------------- icons
const paths: Record<string, ReactNode> = {
  bag: <><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  menu: <><path d="M4 8h16" /><path d="M4 16h16" /></>,
  close: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  plus: <><path d="M12 6v12" /><path d="M6 12h12" /></>,
  minus: <path d="M6 12h12" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  arrow: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
  back: <><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></>,
  truck: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></>,
  leaf: <><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" /><path d="M5 19l7-7" /></>,
  hand: <><path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11" /><path d="M10 10V5a1.5 1.5 0 0 1 3 0v5" /><path d="M13 10V6a1.5 1.5 0 0 1 3 0v6" /><path d="M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 5 14.5V12a1.5 1.5 0 0 1 2-1.4" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M5 15V6a1 1 0 0 1 1-1h9" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="M4 7l8 6 8-6" /></>,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>,
  user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" /></>,
  chevron: <path d="M7 10l5 5 5-5" />,
  filter: <><path d="M4 7h16" /><path d="M7 12h10" /><path d="M10 17h4" /></>,
};
export function Icon({ name, size = 20, className }: { name: keyof typeof paths | string; size?: number; className?: string }) {
  return (
    <svg className={`icon ${className ?? ''}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}
