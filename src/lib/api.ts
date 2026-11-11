// Talks to the Torte Living back end with the publishable key only.
//   reads:  storefront_catalogue, storefront_order_status (database functions)
//   writes: the storefront-order Edge Function (quote + place)
// Prices, stock and totals always come from the server; nothing is computed here
// except display formatting.
const URL_ = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
export const backendConfigured = Boolean(URL_ && KEY);

export type Availability = 'in_stock' | 'low' | 'sold_out';
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
  only_left: number | null;
  max_qty: number;
}

export interface QuoteLine { sku_code: string; name: string; qty: number; unit_price: number; line_total: number }
export interface Problem { sku_code: string; name?: string; reason: 'sold_out' | 'insufficient' | 'unavailable'; available: number }
export interface Quote {
  ok: true; lines: QuoteLine[]; problems: Problem[];
  subtotal: number; shipping: number; discount: number; total: number;
  shipping_rule: { flat: number; free_above: number };
}

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
  | { ok: true; order_code: string; status: string | null; stock_reserved?: boolean; total?: number; duplicate: boolean }
  | { ok: false; error: 'sold_out'; problems: Problem[] }
  | { ok: false; error: 'price_changed'; lines: QuoteLine[]; subtotal: number; shipping: number; total: number }
  | { ok: false; error: 'invalid'; fields: Record<string, string> }
  | { ok: false; error: 'too_many_orders' | 'not_accepted' | 'server' | 'network' | string; message?: string };

export interface OrderStatus {
  found: boolean; code?: string; status?: string; placed_on?: string;
  items?: { sku_code: string; name: string; qty: number }[];
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
    mrp: r.mrp == null ? null : Number(r.mrp), price: Number(r.price),
  }));
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

export const getQuote = (lines: { sku_code: string; qty: number }[]) =>
  callOrderFunction<Quote | { ok: false; error: string }>({ action: 'quote', lines });

export const placeOrder = (body: PlaceBody) => callOrderFunction<PlaceResult>({ action: 'place', ...body });
