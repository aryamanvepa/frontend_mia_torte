import type { Brand, LogoSet } from '../content/brands';

/**
 * A brand's logo (transparent WebP), or nothing when the brand has none.
 * variant "mark": the symbol alone, for small spaces. tone "dark": the version for dark backgrounds.
 * Size it by width, or by height for wide logos (`height`).
 */
export function BrandLogo({ brand, width, height, eager, className = '', variant = 'full', tone = 'light', decorative }: {
  brand: Brand | null | undefined; width?: number; height?: number; eager?: boolean; className?: string;
  variant?: 'full' | 'mark'; tone?: 'light' | 'dark'; decorative?: boolean;
}) {
  const logo = brand?.logo;
  if (!brand || !logo) return null;
  const set: LogoSet = variant === 'mark' && logo.mark ? logo.mark : logo;
  const file = variant === 'full' && tone === 'dark' && logo.dark ? logo.dark : set.file;
  const w = width ?? Math.round((height ?? 48) * set.ratio);
  const h = Math.round(w / set.ratio);
  const src = (x: number) => `${import.meta.env.BASE_URL}brand/${file}-${x}.webp`;
  const largest = set.widths[set.widths.length - 1];
  return (
    <img className={`brand-logo brand-logo--${brand.theme} ${className}`} src={src(set.widths.find((x) => x >= w * 2) ?? largest)}
      srcSet={set.widths.map((x) => `${src(x)} ${x}w`).join(', ')} sizes={`${w}px`}
      width={w} height={h} alt={decorative ? '' : `${brand.name} logo`} loading={eager ? 'eager' : 'lazy'} decoding="async" />
  );
}
