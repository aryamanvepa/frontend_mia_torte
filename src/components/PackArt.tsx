// =====================================================================
// PACK ART — an illustrated placeholder shown wherever a product has no
// photograph yet. It is deliberately an illustration, so nobody mistakes it
// for the real product. Once real photos are added to a product's `images`
// (src/content/products.ts), they replace it automatically.
// =====================================================================
import type { CSSProperties, ReactNode } from 'react';

type Motif = 'cookie' | 'bowl' | 'scatter' | 'ear' | 'dosa' | 'jar';

const MOTIF_BY_CATEGORY: Record<string, Motif> = {
  cookies: 'cookie', biscuits: 'cookie',
  muesli: 'bowl', breakfast: 'bowl',
  snacks: 'scatter', 'nuts & seeds': 'scatter',
  'atta & flours': 'ear', atta: 'ear', flours: 'ear', 'grain blends': 'ear',
  'dosa & batter mixes': 'dosa', 'dosa mixes': 'dosa',
  'chutney powders': 'jar', pantry: 'jar',
};

// Tones per brand: a product always gets the same one (picked from its name).
const TONES = {
  MT: ['mt-1', 'mt-2', 'mt-3', 'mt-4'],
  NS: ['ns-1', 'ns-2', 'ns-3', 'ns-4'],
} as const;

const motifs: Record<Motif, ReactNode> = {
  cookie: (
    <>
      <path d="M40 13c8.6 0 15.2 3.2 20.4 9.1 5 5.6 6.9 11.7 6.2 18.6-.7 7.4-3.9 13.4-10 17.9-6.2 4.6-12.6 6.6-19.6 5.8-7.3-.8-13.1-3.9-17.6-9.6-4.4-5.6-6.3-11.9-5.6-19 .7-7.2 4.1-12.6 9.9-16.9C29.1 15.1 34.1 13 40 13Z" />
      <path d="M27 24c3 1 4.6 3 5 6" opacity=".5" />
      <g className="pack__fill"><circle cx="31" cy="34" r="2.6" /><circle cx="48" cy="27" r="2.2" /><circle cx="53" cy="44" r="2.8" /><circle cx="36" cy="51" r="2.4" /><circle cx="44" cy="39" r="1.8" /><circle cx="26" cy="44" r="1.6" /></g>
    </>
  ),
  bowl: (
    <>
      <path d="M12 42h56" /><path d="M15 42c0 14 11 24 25 24s25-10 25-24" /><path d="M32 66.5h16" />
      <g className="pack__fill"><circle cx="27" cy="36" r="2.4" /><circle cx="35" cy="32" r="2" /><circle cx="44" cy="35.5" r="2.6" /><circle cx="52" cy="31.5" r="2" /><circle cx="39" cy="38.5" r="1.5" /></g>
      <path d="M30 27c1.5-2.6 4-3.4 6.4-2.4M47 25.5c2.4-1.4 5-1 6.6 1" opacity=".55" />
    </>
  ),
  scatter: (
    <>
      <ellipse cx="29" cy="31" rx="8.5" ry="5" transform="rotate(-24 29 31)" />
      <ellipse cx="51" cy="28" rx="6.5" ry="4.2" transform="rotate(28 51 28)" />
      <circle cx="41" cy="45" r="5.5" /><circle cx="25" cy="51" r="3.6" />
      <path d="M50 53.5l10.5-4.5 5.5 7.5-9.5 5Z" />
      <g className="pack__fill"><circle cx="58" cy="40" r="1.8" /><circle cx="33" cy="60" r="1.6" /><circle cx="18" cy="38" r="1.4" /></g>
    </>
  ),
  ear: (
    <>
      <path d="M40 71V20" />
      {[26, 34, 42, 50].map((y) => (
        <g key={y}>
          <ellipse cx="34.6" cy={y} rx="3.4" ry="6.6" transform={`rotate(-32 34.6 ${y})`} />
          <ellipse cx="45.4" cy={y} rx="3.4" ry="6.6" transform={`rotate(32 45.4 ${y})`} />
        </g>
      ))}
      <ellipse cx="40" cy="16" rx="3" ry="6.2" />
    </>
  ),
  dosa: (
    <>
      <circle cx="40" cy="46" r="27" opacity=".5" />
      <path d="M15 50c10-11 30-16 50-14l-3.5 10.5C44 47 30 50 15 50Z" />
      <path d="M26 46.5c8-3 18-5 31-5" opacity=".5" />
      <circle cx="27" cy="25" r="5" /><circle cx="42" cy="21" r="5" />
    </>
  ),
  jar: (
    <>
      <rect x="27" y="17" width="26" height="8" rx="2" />
      <path d="M25 25h30c2.2 0 4 1.8 4 4v32c0 3.3-2.7 6-6 6H27c-3.3 0-6-2.7-6-6V29c0-2.2 1.8-4 4-4Z" />
      <path d="M21 38h38M21 50h38" opacity=".55" />
      <g className="pack__fill"><circle cx="30" cy="58" r="1.3" /><circle cx="36" cy="61" r="1.1" /><circle cx="44" cy="58.5" r="1.4" /><circle cx="50" cy="61.5" r="1.1" /><circle cx="40" cy="56" r="1" /></g>
    </>
  ),
};

// ---------------------------------------------------------------- per-product art
// Each product gets colours drawn from its flavour and a small flavour motif, so the grid reads as a range
// of distinct products while photographs are being made. Still clearly an illustration.
type Accent = 'chilli' | 'leaf' | 'bean' | 'coffee' | 'strawberry' | 'mango' | 'orange' | 'carrot' | 'berry' | 'salt' | 'spice' | 'heart' | 'cumin' | 'caramel' | 'hazelnut' | 'chip';

const accents: Record<Accent, ReactNode> = {
  chilli: <><path d="M9 4c2 0 3 1.2 3 3 0 7-4 12-10 13 3-3 5-7 5-12 0-2.4.3-4 2-4Z" className="pack__fill" /><path d="M10.5 4c0-1.6.8-2.6 2.5-3" /></>,
  leaf: <><path d="M3 19C3 9 9 3 19 3c0 10-6 16-16 16Z" className="pack__fill" /><path d="M4 18 15 7" stroke="var(--pack-bg)" /></>,
  bean: <><ellipse cx="11" cy="11" rx="8" ry="5.5" transform="rotate(-30 11 11)" className="pack__fill" /><path d="M7 14c3-1 5-3 7-7" stroke="var(--pack-bg)" /></>,
  coffee: <><ellipse cx="11" cy="11" rx="6.5" ry="8.5" transform="rotate(25 11 11)" className="pack__fill" /><path d="M8 4c3 4 3 10 6 14" stroke="var(--pack-bg)" /></>,
  strawberry: <><path d="M11 6c5 0 8 2.5 8 6 0 4-4 8.5-8 9-4-.5-8-5-8-9 0-3.5 3-6 8-6Z" className="pack__fill" /><path d="M7 5l4 2 4-2M11 7V3" /><g fill="var(--pack-bg)" stroke="none"><circle cx="8" cy="12" r=".8" /><circle cx="13" cy="11" r=".8" /><circle cx="10" cy="16" r=".8" /><circle cx="14" cy="15" r=".8" /></g></>,
  mango: <><path d="M6 5c6-2 13 2 13 9 0 5-4 7-8 7-5 0-8-4-8-9 0-3 1-6 3-7Z" className="pack__fill" /><path d="M9 4c0-2 1-3 3-3" /></>,
  orange: <><circle cx="11" cy="11" r="8.5" className="pack__fill" /><g stroke="var(--pack-bg)"><path d="M11 3v16M3 11h16M5.2 5.2l11.6 11.6M16.8 5.2 5.2 16.8" /></g></>,
  carrot: <><path d="M4 19 15 6c2 1 3 2 3 4L5 20Z" className="pack__fill" /><path d="M15 6c0-2 1-4 3-5M16.5 7c1.5-1.5 3.5-2 5-1.5" /></>,
  berry: <><circle cx="8" cy="13" r="5" className="pack__fill" /><circle cx="15" cy="9" r="4" className="pack__fill" opacity=".7" /><path d="M15 5c0-2 1-3 3-3" /></>,
  salt: <g className="pack__fill"><rect x="4" y="5" width="4" height="4" transform="rotate(15 6 7)" /><rect x="12" y="3" width="3.5" height="3.5" transform="rotate(-10 14 5)" /><rect x="9" y="12" width="4.5" height="4.5" transform="rotate(30 11 14)" /><rect x="15" y="13" width="3" height="3" /></g>,
  spice: <><path d="M11 2l2.2 6.3L20 9l-5.3 4 1.9 7L11 16l-5.6 4 1.9-7L2 9l6.8-.7Z" className="pack__fill" /></>,
  heart: <path d="M11 19C5 14.5 2 11.5 2 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3.5-3 6.5-9 11Z" className="pack__fill" />,
  cumin: <g className="pack__fill"><ellipse cx="7" cy="8" rx="1.6" ry="4" transform="rotate(-30 7 8)" /><ellipse cx="14" cy="6" rx="1.6" ry="4" transform="rotate(20 14 6)" /><ellipse cx="12" cy="15" rx="1.6" ry="4" transform="rotate(-60 12 15)" /></g>,
  caramel: <><path d="M3 15c3-6 13-6 16 0" /><path d="M4 15h14v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" className="pack__fill" /><path d="M8 9c0-3 2-5 3-6" /></>,
  hazelnut: <><path d="M11 6c5 0 8 4 8 8s-4 6-8 6-8-2-8-6 3-8 8-8Z" className="pack__fill" /><path d="M6 7c2-4 8-4 10 0" /></>,
  chip: <><path d="M3 12c2-6 9-9 16-6-1 7-7 12-14 11Z" className="pack__fill" /><path d="M7 13c3-2 6-3 9-3" stroke="var(--pack-bg)" /></>,
};

/** Product → [background, ink, accent]. Products not listed fall back to brand tones. */
const PRODUCT_ART: Record<string, [string, string, Accent?]> = {
  'Classic Chocolate Chip': ['#efe1c8', '#4a2a17', 'chip'],
  'Mocha Me Happy': ['#3b2418', '#e7c9a0', 'coffee'],
  'Red Velvet Melt': ['#f1d9d3', '#8e2a24', 'heart'],
  'Nutella Brownie Bliss': ['#4a2c1d', '#f0d9b5', 'hazelnut'],
  'Carrot Crème Melt': ['#f6e2cc', '#b5561f', 'carrot'],
  'Biscoff Indulgence': ['#ecd2ac', '#7a4318', 'caramel'],
  'Berry Nutty About Pista': ['#e4e8d3', '#7d2f45', 'berry'],
  'Jowar Jeera Delight (8 nos.)': ['#f2e7cf', '#5d4422', 'cumin'],
  'Fruit & Nut Muesli': ['#f0e3cc', '#6b3b1f', 'hazelnut'],
  'Nutty Mango Millets & Nuts Muesli': ['#fbe7b5', '#9a5a0c', 'mango'],
  'Nutty Orange Millets & Nuts Muesli': ['#fde0c4', '#b4520f', 'orange'],
  'Crunchy Strawberry Millets & Nuts Muesli': ['#f8dcdc', '#a3303f', 'strawberry'],
  'Peri Peri Vegie Chips': ['#f6d8c6', '#a32a18', 'chilli'],
  'Pudina Millet Crunch': ['#dcebdc', '#2f5e3a', 'leaf'],
  'Salted Nuts & Bean Crunch': ['#ede6d8', '#4b3a28', 'salt'],
  'Peri Peri Trail Mix': ['#f3d3c2', '#8f2817', 'chilli'],
  'Masala Protein Bean Mix': ['#f1ddbf', '#8a4512', 'spice'],
  'Multigrain Superseed Atta (MGA)': ['#ece4d2', '#5a4524'],
  'Gluten Free Superseed Atta': ['#e5e7d6', '#3f4a2c'],
  'Ragi Flour': ['#e9d6cc', '#6a3424'],
  'Bajra Flour': ['#e4e0d3', '#4c4a3a'],
  'Jowar Flour': ['#f2ead6', '#6b5a33'],
  'Sattu (Roasted Gram Flour)': ['#efdcbc', '#7a5320'],
  'Instant MultiMillet Dosa Mix': ['#f3e3c2', '#7a4a17'],
  'Instant Pesarattu Dosa Mix': ['#dfe8d2', '#3f5a2a', 'leaf'],
  'Instant Multigrain Dosa Mix': ['#f0e1c6', '#6e4319'],
  'Instant Peanut Putana Chutney': ['#efd9bb', '#7b3f17', 'chilli'],
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function PackArt({ product, category, brandCode, variant = 'card' }: {
  product?: string | null;
  category?: string | null;
  brandCode: string;
  /** card: grid tiles · hero: product page · thumb: bag lines (motif only) */
  variant?: 'card' | 'hero' | 'thumb';
}) {
  const isMT = brandCode === 'MT';
  const motif = MOTIF_BY_CATEGORY[(category ?? '').trim().toLowerCase()] ?? (isMT ? 'cookie' : 'ear');
  const tones = isMT ? TONES.MT : TONES.NS;
  const tone = tones[hash(product ?? brandCode) % tones.length];
  const label = product ? `${product}: illustration, product photograph to follow` : 'Product illustration';
  const art = product ? PRODUCT_ART[product] : undefined;
  const style = art ? ({ '--pack-bg': art[0], '--pack-ink': art[1] } as CSSProperties) : undefined;

  return (
    <div className={`pack pack--${variant} pack--${tone}`} role="img" aria-label={label} style={style}>
      <svg className="pack__motif" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.3"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {motifs[motif]}
      </svg>
      {art?.[2] && variant !== 'thumb' && (
        <svg className="pack__accent" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.1"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{accents[art[2]]}</svg>
      )}
      {variant !== 'thumb' && product && <span className="pack__name" aria-hidden="true">{product}</span>}
      {variant !== 'thumb' && <span className="pack__note" aria-hidden="true">{variant === 'hero' ? `${isMT ? 'Mia Torte' : 'Nutri Sampoorn'} · photograph to follow` : 'Photo to follow'}</span>}
    </div>
  );
}
