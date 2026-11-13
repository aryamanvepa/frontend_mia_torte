// NOT WIRED IN: waits on backend task B8 (customer accounts), not approved yet (2026-11-13).
// Re-enable by adding the /account route in App.tsx and the account links in layout.tsx.
// =====================================================================
// CUSTOMER ACCOUNTS — sign in with a one-time code sent by email
// (Supabase Auth, publishable key only). Guest checkout stays the default.
//
// A signed-in shopper can see their own orders and details through
// storefront_my_orders / storefront_my_profile (backend task B8). Shoppers
// get no access to the ops app: staff access requires a staff profile.
// Until the backend functions exist, the account page says so politely.
// =====================================================================
import { createClient, type Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const URL_ = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

export const supabase = URL_ && KEY
  ? createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'torte-shop-auth', detectSessionInUrl: false } })
  : null;

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, ready };
}

export type AuthResult = { ok: true } | { ok: false; message: string };

function friendly(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('rate') || m.includes('seconds')) return 'Please wait a minute before asking for another code.';
  if (m.includes('expired') || m.includes('invalid') || m.includes('token')) return 'That code didn’t work. Check it, or ask for a new one.';
  if (m.includes('signups not allowed') || m.includes('otp') && m.includes('disabled')) return 'Signing in isn’t switched on yet. You can still check out as a guest.';
  return 'We couldn’t sign you in just now. Please try again.';
}

/** Email a 6-digit sign-in code (creates the account on first use). */
export async function sendCode(email: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'The shop is not connected yet.' };
  const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
  return error ? { ok: false, message: friendly(error.message) } : { ok: true };
}

export async function verifyCode(email: string, code: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'The shop is not connected yet.' };
  const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
  return error ? { ok: false, message: friendly(error.message) } : { ok: true };
}

export const signOut = () => supabase?.auth.signOut();

// ---------------------------------------------------------------- account data (backend task B8)
export interface MyOrder { code: string; status: string; placed_on: string; total: number; items: { name: string; qty: number }[]; tracking_url?: string | null }
export interface MyProfile { full_name?: string | null; phone?: string | null; email?: string | null; city?: string | null; state?: string | null; pincode?: string | null }

type Rpc<T> = { ok: true; data: T } | { ok: false; missing: boolean };

async function call<T>(fn: string): Promise<Rpc<T>> {
  if (!supabase) return { ok: false, missing: true };
  const { data, error } = await supabase.rpc(fn);
  if (error) return { ok: false, missing: error.code === 'PGRST202' || /not find|does not exist/i.test(error.message) };
  return { ok: true, data: data as T };
}
export const myOrders = () => call<MyOrder[]>('storefront_my_orders');
export const myProfile = () => call<MyProfile>('storefront_my_profile');
