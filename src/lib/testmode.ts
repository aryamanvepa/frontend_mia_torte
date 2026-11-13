// =====================================================================
// TEST MODE — lets the team place test orders before there is any stock.
//
//   Turn on:  open any page with ?test=1   (remembered in this browser)
//   Turn off: ?test=0, or "Exit test mode" in the banner
//
// While on: a banner shows on every page; sold-out and coming-soon packs can
// go in the bag (up to TEST_MAX per line); quote and place requests carry
// "test": true. The SERVER decides whether to honour it: the storefront-order
// function only accepts test orders while the ops app's testing mode
// (app_settings.testing_mode) is on, and marks them as test orders.
// Nothing here changes prices: totals still come only from the server.
// =====================================================================
const KEY = 'torte-test-mode';
export const TEST_MAX = 5;

function read(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get('test');
    if (q === '1') localStorage.setItem(KEY, '1');
    if (q === '0') localStorage.removeItem(KEY);
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** Decided once per page load. */
export const testMode = typeof window !== 'undefined' && read();

export function exitTestMode() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  const u = new URL(window.location.href);
  u.searchParams.delete('test');
  window.location.replace(u.toString());
}

/** Obvious test details for checkout; the phone varies because of the 5-orders-per-phone-per-day limit. */
export function testCustomer() {
  const n = Math.floor(Math.random() * 900) + 100;
  return {
    name: 'Test Customer',
    phone: `9000000${n}`,
    email: `test+${n}@example.com`,
    address1: 'TEST ORDER – do not ship, 1 Test Street',
    address2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    notes: 'Test order placed from the website test mode.',
  };
}
