import type { Brand } from '../content/brands';

/** A brand's logo (transparent WebP in three widths), or nothing when the brand has none. */
export function BrandLogo({ brand, width, eager, className = '' }: { brand: Brand | null | undefined; width: number; eager?: boolean; className?: string }) {
  if (!brand?.logo) return null;
  const { file, ratio } = brand.logo;
  const src = (w: number) => `${import.meta.env.BASE_URL}brand/${file}-${w}.webp`;
  return (
    <img className={`brand-logo ${className}`} src={src(480)} srcSet={`${src(240)} 240w, ${src(480)} 480w, ${src(960)} 960w`} sizes={`${width}px`}
      width={width} height={Math.round(width / ratio)} alt={`${brand.name} logo`} loading={eager ? 'eager' : 'lazy'} decoding="async" />
  );
}
