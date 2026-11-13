import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { backendConfigured, fetchCatalogue, type CatalogueItem } from '../lib/api';
import { TEST_MAX, testMode } from '../lib/testmode';

// ---------------------------------------------------------------- catalogue
interface CatalogueState {
  items: CatalogueItem[];
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
}
const CatalogueCtx = createContext<CatalogueState | null>(null);

export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [status, setStatus] = useState<CatalogueState['status']>('loading');
  const [error, setError] = useState<string | null>(null);
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
      setItems(testMode ? rows.map((r) => (r.availability === 'sold_out'
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

  const value = useMemo(() => {
    const stocked = new Set(items.filter((i) => i.availability !== 'sold_out').map((i) => i.brand_code));
    const comingSoon = (i: Pick<CatalogueItem, 'brand_code' | 'availability'>) => i.availability === 'sold_out' && !stocked.has(i.brand_code);
    return { items, byCode: new Map(items.map((i) => [i.code, i])), status, error, reload, comingSoon };
  }, [items, status, error, reload]);
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
  const [bump, setBump] = useState(0);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* private mode: bag lasts for this visit */ }
  }, [lines]);

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
    },
    setQty: (code, qty) => setLines((ls) => (qty <= 0 ? ls.filter((l) => l.code !== code)
      : ls.map((l) => (l.code === code ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)))),
    remove: (code) => setLines((ls) => ls.filter((l) => l.code !== code)),
    clear: () => setLines([]),
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    bump,
  }), [lines, drawerOpen, bump]);

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
      const max = item ? item.max_qty : 0;
      return { ...l, item, max, short: status === 'ready' && (!item || l.qty > max) };
    });
    const subtotal = rows.reduce((s, r) => s + (r.item ? r.item.price * r.qty : 0), 0);
    return { rows, subtotal, hasProblems: rows.some((r) => r.short) };
  }, [lines, byCode, status]);
}
