import { testMode } from './testmode';
// Talks to the Torte Living back end with the publishable key only.
//   reads:  storefront_catalogue, storefront_order_status (database functions)
//   writes: the storefront-order Edge Function (quote + place)
// Prices, stock and totals always come from the server; nothing is computed here
// except display formatting.
const URL_ = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
export const backendConfigured = Boolean(URL_ && KEY);

export type Availability = 'in_stock' | 'low' | 'sold_out';
/**
 * What the shopper can do with a pack (requested from the backend as `status`; until then the website
 * works it out from `availability`). Only 'available' can go in the bag.
 *   available     can be bought now
 *   out_of_stock  temporarily out: next batch on its way ("Notify me")
 *   coming_soon   not launched yet
 *   discontinued  no longer made: hidden from listings; its page points to alternatives
 */
export type ProductStatus = 'available' | 'out_of_stock' | 'coming_soon' | 'discontinued';
export interface CatalogueItem {
  code: string;
  name: string;
  product: string;
  brand: string;
  brand_code: string;
  category: string | null;
  pack_size: number;
  pack_unit: 'g' | 'kg' | 'ml' | 'l' | 'pcs';
  pack_grams: number;
  mrp: number | null;
  price: number;
  availability: Availability;
  /** Backend (B15): the pack's status. Absent until provided; see ProductStatus. */
  status?: ProductStatus | null;
  only_left: number | null;
  max_qty: number;
  /** Label details entered in the ops app (Admin → Products); the same for every pack of a product. */
  details?: ProductDetails | null;
  /** Backend extras (B3/B4); absent until the backend provides them. */
  bestseller_rank?: number | null;
  is_new?: boolean;
  /** Product photo URLs held in the backend (Storage). */
  images?: string[];
  /** Reviews (later); the website hides the section until these exist. */
  rating?: number | null;
  review_count?: number | null;
  /** Test mode only: sold out in reality, made orderable for test orders. */
  test_stock?: boolean;
}

export type Diet = 'veg' | 'vegan' | 'egg' | 'non_veg';
export interface ProductDetails {
  description: string | null;
  ingredients: string | null;
  allergens: string | null;
  diet: Diet | null;
  /** Numbers per 100 g, keys like energy_kcal, protein_g, sodium_mg. */
  nutrition_per_100g: Record<string, number | null> | null;
  storage: string | null;
  shelf_life_days: number | null;
  /** True once Torte Living has confirmed these details against the pack label. */
  confirmed: boolean;
}

export interface QuoteLine { sku_code: string; name: string; qty: number; unit_price: number; line_total: number }
export interface Problem { sku_code: string; name?: string; reason: 'sold_out' | 'insufficient' | 'unavailable'; available: number }
export interface Quote {
  ok: true; lines: QuoteLine[]; problems: Problem[];
  subtotal: number; shipping: number; discount: number; total: number;
  shipping_rule: { flat: number; free_above: number };
  /** Backend task B5: present once the PIN check is live. */
  delivery?: Delivery;
  /** Backend task B6: present once promo codes are live. */
  promo?: { code: string; valid: boolean; discount: number; message: string };
}
export interface Delivery { serviceable: boolean; zone?: 'local' | 'national'; carrier?: string; eta_min_days?: number; eta_max_days?: number; message?: string }
export interface QuoteExtras { pincode?: string; promo_code?: string }

export interface PlaceBody {
  idempotency_key: string;
  lines: { sku_code: string; qty: number }[];
  customer: { name: string; phone: string; email: string; marketing_consent: boolean };
  address: { address1: string; address2: string; city: string; state: string; pincode: string };
  notes: string;
  expected_total: number;
  website: string; // honeypot
}
export type PlaceResult =
  | { ok: true; order_code: string; status: string | null; stock_reserved?: boolean; total?: number; duplicate: boolean; test?: boolean }
  | { ok: false; error: 'sold_out'; problems: Problem[] }
  | { ok: false; error: 'price_changed'; lines: QuoteLine[]; subtotal: number; shipping: number; total: number }
  | { ok: false; error: 'invalid'; fields: Record<string, string> }
  | { ok: false; error: 'too_many_orders' | 'not_accepted' | 'server' | 'network' | string; message?: string };

export interface OrderStatus {
  found: boolean; code?: string; status?: string; placed_on?: string;
  items?: { sku_code: string; name: string; qty: number }[];
  // Backend task B2 (absent until it is live):
  total?: number; payment_status?: string; payment_method?: 'cod' | 'online';
  timeline?: { placed_at?: string | null; packed_at?: string | null; dispatched_at?: string | null; delivered_at?: string | null; cancelled_at?: string | null };
  shipment?: { carrier?: string | null; booking_ref?: string | null; tracking_url?: string | null } | null;
  cancellable?: boolean; cancel_requested?: boolean;
  refund?: { status: string; amount: number } | null;
}

export type CancelResult = { ok: true; result: 'cancelled' | 'requested' } | { ok: false; error: 'not_found' | 'already_cancelled' | 'delivered' | 'try_later' | 'unavailable' | string };

/** Ask to cancel an order (backend task B7). "unavailable" until the backend function exists. */
export async function requestCancellation(code: string, phone: string, reason: string): Promise<CancelResult> {
  try {
    const res = await fetch(`${URL_}/rest/v1/rpc/storefront_request_cancellation`, {
      method: 'POST',
      headers: { apikey: KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ p_order_code: code.trim(), p_phone: phone, p_reason: reason.trim() || null }),
    });
    if (res.status === 404) return { ok: false, error: 'unavailable' };
    if (!res.ok) return { ok: false, error: 'try_later' };
    return (await res.json()) as CancelResult;
  } catch {
    return { ok: false, error: 'try_later' };
  }
}

async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${URL_}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: KEY, 'content-type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`The shop is unavailable right now (${res.status}).`);
  return res.json() as Promise<T>;
}

export async function fetchCatalogue(): Promise<CatalogueItem[]> {
  const rows = await rpc<CatalogueItem[]>('storefront_catalogue');
  return rows.map((r) => ({
    ...r,
    pack_size: Number(r.pack_size), pack_grams: Number(r.pack_grams),
    // Discontinued rows may have no price (B15): 0 here, and the site never shows a price for them.
    mrp: r.mrp == null ? null : Number(r.mrp), price: r.price == null ? 0 : Number(r.price),
  }));
}

export type NotifyResult = { ok: true } | { ok: false; error: 'consent_required' | 'invalid_email' | 'unknown_product' | 'try_later' | 'network' | string };

/** "Email me when this pack is available". The list can't be read back from the website. */
export async function notifyMe(args: { sku: string; email: string; name: string; consent: boolean }): Promise<NotifyResult> {
  try {
    return await rpc<NotifyResult>('storefront_notify_me', {
      p_sku_code: args.sku, p_email: args.email.trim(), p_consent: args.consent, p_name: args.name.trim() || null,
    });
  } catch {
    return { ok: false, error: 'network' };
  }
}

export const trackOrder = (code: string, phone: string) =>
  rpc<OrderStatus>('storefront_order_status', { p_order_code: code.trim(), p_phone: phone });

async function callOrderFunction<T>(body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${URL_}/functions/v1/storefront-order`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: 'network' } as T;
  }
  try {
    return (await res.json()) as T;
  } catch {
    return { ok: false, error: 'server' } as T;
  }
}

// In test mode both requests carry "test": true; the server decides whether to honour it.
const testFlag = testMode ? { test: true } : {};

const clean = (x: QuoteExtras = {}) => Object.fromEntries(Object.entries(x).filter(([, v]) => v));

export const getQuote = (lines: { sku_code: string; qty: number }[], extras?: QuoteExtras) =>
  callOrderFunction<Quote | { ok: false; error: string }>({ action: 'quote', lines, ...clean(extras), ...testFlag });

/**
 * Place the order. A dropped connection is retried automatically (twice, with a short wait) using the
 * same idempotency key, so a retry can never create a second order.
 */
export async function placeOrder(body: PlaceBody & QuoteExtras): Promise<PlaceResult> {
  const send = () => callOrderFunction<PlaceResult>({ action: 'place', ...body, ...clean({ pincode: body.pincode, promo_code: body.promo_code }), ...testFlag });
  let res = await send();
  for (const wait of [1200, 3000]) {
    if (res.ok || (res.error !== 'network' && res.error !== 'server')) break;
    await new Promise((r) => setTimeout(r, wait));
    res = await send();
  }
  return res;
}
