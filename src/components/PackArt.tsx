// =====================================================================
// PACK ART — an illustrated placeholder shown wherever a product has no
// photograph yet. It is deliberately an illustration, so nobody mistakes it
// for the real product. Once real photos are added to a product's `images`
// (src/content/products.ts), they replace it automatically.
// =====================================================================
import type { ReactNode } from 'react';

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

  return (
    <div className={`pack pack--${variant} pack--${tone}`} role="img" aria-label={label}>
      <svg className="pack__motif" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.3"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {motifs[motif]}
      </svg>
      {variant !== 'thumb' && product && <span className="pack__name" aria-hidden="true">{product}</span>}
      {variant !== 'thumb' && <span className="pack__note" aria-hidden="true">{variant === 'hero' ? `${isMT ? 'Mia Torte' : 'Nutri Sampoorna'} · photograph to follow` : 'Photo to follow'}</span>}
    </div>
  );
}
