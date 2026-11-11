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
export function PlaceholderTag({ label = 'Placeholder' }: { label?: string }) {
  if (!SHOW_PLACEHOLDER_FLAGS) return null;
  return <span className="ph-tag" title="To be supplied by Torte Living before launch">{label}</span>;
}

export function Text({ copy, as: Tag = 'span', className }: { copy: Copy | undefined; as?: 'span' | 'p' | 'div'; className?: string }) {
  if (copy === undefined) return null;
  const ph = isPlaceholder(copy) && SHOW_PLACEHOLDER_FLAGS;
  return (
    <Tag className={`${className ?? ''} ${ph ? 'is-ph' : ''}`}>
      {copyText(copy)}
      {ph && <> <PlaceholderTag /></>}
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

export function StockNote({ item }: { item: Pick<CatalogueItem, 'availability' | 'only_left'> }) {
  if (item.availability === 'sold_out') return <span className="stock stock--out">Sold out</span>;
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
