import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { backendConfigured, fetchCatalogue, getQuote, type CatalogueItem, type ProductStatus } from '../lib/api';
import { TEST_MAX, testMode } from '../lib/testmode';
import { trackAddToCart } from '../lib/analytics';

// ---------------------------------------------------------------- catalogue
interface CatalogueState {
  /** Everything the shop lists (discontinued packs left out). */
  items: CatalogueItem[];
  /** Every pack, discontinued ones included (for old links and bags). */
  byCode: Map<string, CatalogueItem>;
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  reload: () => Promise<void>;
  /**
   * Pre-launch: while a brand has nothing in stock at all, its out-of-stock
   * products read "Coming soon" instead of "Sold out". As soon as any of its
   * products has stock, normal "Sold out" labels return.
   */
  comingSoon: (item: Pick<CatalogueItem, 'brand_code' | 'availability'>) => boolean;
  /** One of the four shopper-facing statuses (backend `status` when present). */
  statusOf: (item: CatalogueItem) => ProductStatus;
  /** Delivery charge rule from the server (flat charge, free above), once known. */
  shipping: { flat: number; free_above: number } | null;
}
const CatalogueCtx = createContext<CatalogueState | null>(null);

export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [status, setStatus] = useState<CatalogueState['status']>('loading');
  const [error, setError] = useState<string | null>(null);
  const [shipping, setShipping] = useState<CatalogueState['shipping']>(null);
  const loadedAt = useRef(0);

  const reload = useCallback(async () => {
    if (!backendConfigured) {
      setStatus('error');
      setError('The shop is not connected yet (Supabase settings missing).');
      return;
    }
    try {
      const rows = await fetchCatalogue();
      // Test mode: every pack can go in the bag (the server decides whether the order is accepted).
      setItems(testMode ? rows.map((r) => (r.availability === 'sold_out' && r.status !== 'discontinued'
        ? { ...r, availability: 'in_stock' as const, max_qty: TEST_MAX, only_left: null, test_stock: true }
        : r)) : rows);
      setStatus('ready');
      setError(null);
      loadedAt.current = Date.now();
    } catch (e) {
      setError((e as Error).message || 'Could not load the shop.');
      setStatus((s) => (s === 'ready' ? 'ready' : 'error'));
    }
  }, []);

  useEffect(() => {
    reload();
    // Stock moves: refresh when the shopper comes back to the tab after a minute away.
    const onFocus = () => { if (Date.now() - loadedAt.current > 60_000) reload(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [reload]);

  // The delivery rule (for "free delivery above …") comes from the server's quote, once per visit.
  const firstCode = items[0]?.code;
  useEffect(() => {
    if (!firstCode || shipping) return;
    getQuote([{ sku_code: firstCode, qty: 1 }]).then((q) => { if (q.ok) setShipping(q.shipping_rule); }).catch(() => {});
  }, [firstCode, shipping]);

  const value = useMemo(() => {
    const stocked = new Set(items.filter((i) => i.availability !== 'sold_out').map((i) => i.brand_code));
    const comingSoon = (i: Pick<CatalogueItem, 'brand_code' | 'availability'>) => i.availability === 'sold_out' && !stocked.has(i.brand_code);
    const statusOf = (i: CatalogueItem): ProductStatus => {
      if (i.status === 'discontinued') return 'discontinued';
      if (i.test_stock) return 'available';
      if (i.status) return i.status === 'available' && i.availability === 'sold_out' ? 'out_of_stock' : i.status;
      if (i.availability !== 'sold_out' && i.max_qty > 0) return 'available';
      return comingSoon(i) ? 'coming_soon' : 'out_of_stock';
    };
    const listed = items.filter((i) => i.status !== 'discontinued');
    return { items: listed, byCode: new Map(items.map((i) => [i.code, i])), status, error, reload, comingSoon, statusOf, shipping };
  }, [items, status, error, reload, shipping]);
  return <CatalogueCtx.Provider value={value}>{children}</CatalogueCtx.Provider>;
}
export const useCatalogue = () => useContext(CatalogueCtx)!;

// ---------------------------------------------------------------- cart
export interface CartLine { code: string; qty: number }
interface CartState {
  lines: CartLine[];
  count: number;
  add: (code: string, qty?: number) => void;
  setQty: (code: string, qty: number) => void;
  remove: (code: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Increments on every add, for the bag-icon micro-interaction */
  bump: number;
}
const CartCtx = createContext<CartState | null>(null);
const STORAGE_KEY = 'mia-torte-bag-v1';
const MAX_LINES = 10;
const MAX_QTY = 20;

function readStored(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((l) => typeof l?.code === 'string' && Number.isInteger(l?.qty) && l.qty > 0)
      .slice(0, MAX_LINES)
      .map((l) => ({ code: l.code, qty: Math.min(l.qty, MAX_QTY) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStored);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { byCode } = useCatalogue();
  const [bump, setBump] = useState(0);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* private mode: bag lasts for this visit */ }
  }, [lines]);

  // Test mode only: ?bag=demo fills the bag with a mixed basket from both brands, for reviews.
  const { items: listed } = useCatalogue();
  useEffect(() => {
    if (!testMode || !listed.length) return;
    const u = new URL(window.location.href);
    if (u.searchParams.get('bag') !== 'demo') return;
    const pick = (product: string, grams?: number) => {
      const packs = listed.filter((i) => i.product === product).sort((a, b) => a.pack_grams - b.pack_grams);
      return (grams ? packs.find((p) => p.pack_grams === grams) : undefined) ?? packs[0];
    };
    const demo = [
      [pick('Classic Chocolate Chip'), 2], [pick('Peri Peri Trail Mix'), 1],
      [pick('Multigrain Superseed Atta (MGA)', 1000), 1], [pick('Instant Pesarattu Dosa Mix'), 1],
    ] as const;
    setLines(demo.filter(([i]) => i).map(([i, qty]) => ({ code: i!.code, qty })));
    u.searchParams.delete('bag');
    window.history.replaceState(window.history.state, '', u.toString());
    setDrawerOpen(true);
  }, [listed.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep several tabs in step.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) setLines(readStored()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<CartState>(() => ({
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    add: (code, qty = 1) => {
      setLines((ls) => {
        const found = ls.find((l) => l.code === code);
        if (found) return ls.map((l) => (l.code === code ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY) } : l));
        if (ls.length >= MAX_LINES) return ls;
        return [...ls, { code, qty: Math.min(qty, MAX_QTY) }];
      });
      setBump((b) => b + 1);
      const item = byCode.get(code);
      if (item) trackAddToCart(item, qty);
    },
    setQty: (code, qty) => setLines((ls) => (qty <= 0 ? ls.filter((l) => l.code !== code)
      : ls.map((l) => (l.code === code ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)))),
    remove: (code) => setLines((ls) => ls.filter((l) => l.code !== code)),
    clear: () => setLines([]),
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    bump,
  }), [lines, drawerOpen, bump, byCode]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
export const useCart = () => useContext(CartCtx)!;

/** Bag lines joined with live catalogue data. */
export function useBag() {
  const { lines } = useCart();
  const { byCode, status } = useCatalogue();
  return useMemo(() => {
    const rows = lines.map((l) => {
      const item = byCode.get(l.code) ?? null;
      const gone = !item || item.status === 'discontinued';
      const max = item && !gone ? item.max_qty : 0;
      return { ...l, item, max, short: status === 'ready' && (!item || l.qty > max) };
    });
    const subtotal = rows.reduce((s, r) => s + (r.item ? r.item.price * r.qty : 0), 0);
    return { rows, subtotal, hasProblems: rows.some((r) => r.short) };
  }, [lines, byCode, status]);
}
