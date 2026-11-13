// =====================================================================
// ANALYTICS — Google Analytics 4 and Meta Pixel, only with consent.
//
// Set the IDs as repository variables (or in .env.local):
//   VITE_GA4_ID          G-XXXXXXXXXX
//   VITE_META_PIXEL_ID   1234567890
// With neither set, nothing loads and no banner shows. With either set,
// the consent banner asks first; nothing is loaded or sent until the
// visitor accepts (DPDP Act 2023). The choice is remembered in this browser
// and can be changed from "Cookie settings" in the footer.
//
// Events (GA4 ecommerce names; Meta equivalents in brackets):
//   page_view, view_item_list, view_item [ViewContent], search [Search],
//   add_to_cart [AddToCart], begin_checkout [InitiateCheckout],
//   purchase [Purchase], login, sign_up.
// =====================================================================
import type { CatalogueItem } from './api';
import { packFull } from './format';

const GA4 = (import.meta.env.VITE_GA4_ID as string | undefined)?.trim() || '';
const PIXEL = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim() || '';
const KEY = 'torte-consent';

export const analyticsConfigured = Boolean(GA4 || PIXEL);
export type Consent = 'granted' | 'denied' | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; callMethod?: (...a: unknown[]) => void; push?: unknown };
    _fbq?: unknown;
  }
}

export function getConsent(): Consent {
  try { const v = localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : null; } catch { return null; }
}

let loaded = false;
function load() {
  if (loaded || !analyticsConfigured || typeof window === 'undefined' || navigator.webdriver) return;
  loaded = true;
  if (GA4) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer!.push(arguments); }; // eslint-disable-line prefer-rest-params
    window.gtag('js', new Date());
    window.gtag('config', GA4, { send_page_view: false });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4)}`;
    document.head.appendChild(s);
  }
  if (PIXEL) {
    const f = function fbq(...args: unknown[]) {
      if (f.callMethod) f.callMethod(...args); else f.queue!.push(args);
    } as NonNullable<Window['fbq']>;
    f.queue = []; f.loaded = true; f.version = '2.0'; f.push = f;
    window.fbq = f; window._fbq = f;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    window.fbq('init', PIXEL);
  }
}

export function setConsent(v: 'granted' | 'denied') {
  try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
  if (v === 'granted') { load(); trackPageView(); }
  window.dispatchEvent(new Event('torte-consent'));
}
export const openConsentSettings = () => window.dispatchEvent(new Event('torte-consent-open'));

if (typeof window !== 'undefined' && getConsent() === 'granted') load();

const active = () => analyticsConfigured && getConsent() === 'granted' && loaded;
function debug(name: string, params: object) {
  if (import.meta.env.DEV) console.debug('[analytics]', name, params);
}

// ---------------------------------------------------------------- events
type Item = Pick<CatalogueItem, 'code' | 'product' | 'brand' | 'category' | 'price' | 'name' | 'pack_size' | 'pack_unit'>;
const gaItem = (i: Item, quantity = 1) => ({
  item_id: i.code, item_name: i.product, item_brand: i.brand, item_category: i.category ?? undefined,
  item_variant: packFull(i), price: i.price, quantity,
});

export function trackPageView() {
  // After the page has set its own title (its effects run after this one).
  setTimeout(() => {
    const params = { page_location: location.href, page_title: document.title };
    debug('page_view', params);
    if (!active()) return;
    window.gtag?.('event', 'page_view', params);
    window.fbq?.('track', 'PageView');
  }, 0);
}

export function trackViewItemList(listName: string, items: Item[]) {
  const params = { item_list_name: listName, items: items.slice(0, 30).map((i) => gaItem(i)) };
  debug('view_item_list', params);
  if (active()) window.gtag?.('event', 'view_item_list', params);
}

export function trackViewItem(i: Item) {
  const params = { currency: 'INR', value: i.price, items: [gaItem(i)] };
  debug('view_item', params);
  if (!active()) return;
  window.gtag?.('event', 'view_item', params);
  window.fbq?.('track', 'ViewContent', { content_ids: [i.code], content_name: i.product, content_type: 'product', value: i.price, currency: 'INR' });
}

export function trackSearch(term: string, results: number) {
  debug('search', { search_term: term, results });
  if (!active()) return;
  window.gtag?.('event', 'search', { search_term: term });
  window.fbq?.('track', 'Search', { search_string: term });
}

export function trackAddToCart(i: Item, quantity: number) {
  const params = { currency: 'INR', value: i.price * quantity, items: [gaItem(i, quantity)] };
  debug('add_to_cart', params);
  if (!active()) return;
  window.gtag?.('event', 'add_to_cart', params);
  window.fbq?.('track', 'AddToCart', { content_ids: [i.code], content_type: 'product', value: i.price * quantity, currency: 'INR' });
}

export function trackBeginCheckout(lines: { item: Item; qty: number }[], value: number) {
  const params = { currency: 'INR', value, items: lines.map((l) => gaItem(l.item, l.qty)) };
  debug('begin_checkout', params);
  if (!active()) return;
  window.gtag?.('event', 'begin_checkout', params);
  window.fbq?.('track', 'InitiateCheckout', { content_ids: lines.map((l) => l.item.code), num_items: lines.reduce((s, l) => s + l.qty, 0), value, currency: 'INR' });
}

export function trackPurchase(orderCode: string, value: number, shipping: number, lines: { item: Item; qty: number }[], test: boolean) {
  const params = { transaction_id: orderCode, currency: 'INR', value, shipping, items: lines.map((l) => gaItem(l.item, l.qty)) };
  debug('purchase', params);
  if (!active() || test) return; // test orders never count as revenue
  window.gtag?.('event', 'purchase', params);
  window.fbq?.('track', 'Purchase', { content_ids: lines.map((l) => l.item.code), content_type: 'product', value, currency: 'INR' });
}

export function trackAuth(kind: 'login' | 'sign_up') {
  debug(kind, {});
  if (active()) window.gtag?.('event', kind, { method: 'email' });
}
