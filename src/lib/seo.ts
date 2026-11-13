// =====================================================================
// SEO — per-page title, description, canonical address, link-preview tags
// (WhatsApp, Instagram, Facebook, X) and structured data for Google.
//
// SITE_URL is the public address of the shop. Set VITE_SITE_URL when the
// shop moves to its own domain (e.g. https://torteliving.in); until then it
// is the GitHub Pages address. The build's pre-render step (scripts/
// prerender.mjs) captures these tags into each page's HTML, and writes
// sitemap.xml and robots.txt from them.
// =====================================================================
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { imageSet } from '../content/images';

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://aryamanvepa.github.io/frontend_mia_torte').replace(/\/$/, '');
export const SITE_NAME = 'Torte Living';

/**
 * Absolute address for a path inside the app: "/mia-torte/shop" → "<site>/mia-torte/shop/".
 * Pre-rendered pages are folders with an index.html, which hosts serve at the address ending
 * in "/", so canonical addresses and the sitemap use that form.
 */
export const absUrl = (path: string) => `${SITE_URL}${path.endsWith('/') ? path : `${path}/`}`;

/** Absolute address of a registered photo, for link previews. */
export function imageUrl(id: string) {
  const s = imageSet(id);
  if (!s) return undefined;
  const file = s.srcSet.split(', ').map((x) => x.split(' ')[0]).find((u) => u.includes('-1280.')) ?? s.src;
  return `${SITE_URL}/${file.replace(import.meta.env.BASE_URL, '')}`;
}

/** Trim to a search-snippet-sized description at a word boundary. */
export function snippet(text: string, max = 158) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

export interface Seo {
  title: string;
  description?: string;
  /** Path for the canonical address; defaults to the current path. */
  canonical?: string;
  /** Photo id from src/content/images.ts for link previews. */
  image?: string;
  type?: 'website' | 'product' | 'article';
  /** Keep this page out of search results (checkout, order pages, 404). */
  noindex?: boolean;
  /** Structured data (schema.org JSON-LD) for this page. */
  jsonLd?: object | object[];
}

function setMeta(attr: 'name' | 'property', key: string, value: string | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!value) { el?.remove(); return; }
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
}
function setLink(rel: string, href: string | undefined) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!href) { el?.remove(); return; }
  if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
  el.href = href;
}
function setJsonLd(data: object | object[] | undefined) {
  let el = document.head.querySelector<HTMLScriptElement>('script#ld-json');
  if (!data) { el?.remove(); return; }
  if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'ld-json'; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
}

export function useSeo(seo: Seo | null) {
  const { pathname } = useLocation();
  const key = JSON.stringify(seo);
  useEffect(() => {
    if (!seo) return;
    const url = absUrl(seo.canonical ?? pathname);
    const img = seo.image ? imageUrl(seo.image) : undefined;
    document.title = seo.title;
    setMeta('name', 'description', seo.description);
    setMeta('name', 'robots', seo.noindex ? 'noindex, follow' : undefined);
    setLink('canonical', seo.noindex ? undefined : url);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:type', seo.type ?? 'website');
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:locale', 'en_IN');
    setMeta('name', 'twitter:card', img ? 'summary_large_image' : 'summary');
    setJsonLd(seo.noindex ? undefined : seo.jsonLd);
  }, [key, pathname]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ---------------------------------------------------------------- structured data helpers
export const organisationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Torte Living Pvt. Ltd.',
  url: `${SITE_URL}/`,
  brand: [
    { '@type': 'Brand', name: 'Mia Torte' },
    { '@type': 'Brand', name: 'Nutri Sampoorna' },
  ],
};

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: absUrl(t.path) })),
  };
}
