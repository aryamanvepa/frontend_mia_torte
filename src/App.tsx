import { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { CartDrawer, Footer, Header } from './components/layout';
import { ConsentBanner } from './components/Consent';
import { brandList } from './content/brands';
import { HAS_CONTACT, POLICY_LIVE } from './content/site';
import { storeCategories } from './content/store';
import { paths } from './lib/brand';
import { trackPageView } from './lib/analytics';
import { exitTestMode, testMode } from './lib/testmode';
import { StoreHome } from './pages/Home';
import Listing, { SubcategoryPage } from './pages/Shop';
import Product from './pages/Product';
import SearchPage from './pages/Search';
import { About, AccountHome, BrandPage, Contact, Credits, Founder, InfoPage, NotFound } from './pages/Info';
import { OrderConfirmed, Track } from './pages/Order';

const Checkout = lazy(() => import('./pages/Checkout'));
// Customer accounts (src/pages/Account.tsx, src/lib/auth.ts) wait on backend task B8, which is not approved yet.
// They stay in the repo but unwired, so supabase-js stays out of the bundle. /account is a simple page
// (AccountHome in pages/Info.tsx) with order tracking and help; no sign-in.

/** Scroll to top on navigation; one visual theme for the whole store; analytics page views. */
function RouteEffects() {
  const { pathname, search } = useLocation();
  useLayoutEffect(() => { document.documentElement.dataset.brand = 'house'; }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { trackPageView(); }, [pathname, search]);
  return null;
}

// ---------------------------------------------------------------- addresses from the earlier, brand-split site
const OLD_COLLECTION: Record<string, string> = {
  'cookies-biscuits': 'indulgence-treats', 'brownies-cakes': 'indulgence-treats',
  'savoury-snacks': 'better-snacking', 'muesli-nuts-seeds': 'better-snacking',
  muesli: 'everyday-nourishment', 'atta-grain-blends': 'everyday-nourishment',
  'breakfast-dosa-mixes': 'everyday-nourishment', 'pantry-snacks': 'everyday-nourishment',
  gifting: 'gifting-discovery', seasonal: 'gifting-discovery',
};
/** Brand slugs that were renamed: old → new ("Nutri Sampoorn" 2026-11-14, "La Mia Torte" 2026-11-18). */
const OLD_BRAND_SLUG: Record<string, string> = { 'nutri-sampoorna': 'nutri-sampoorn', 'mia-torte': 'la-mia-torte' };
function OldBrandPath() {
  const { slug = '', '*': rest = '' } = useParams();
  if (OLD_BRAND_SLUG[slug]) return <Navigate to={`/${OLD_BRAND_SLUG[slug]}${rest ? `/${rest}` : ''}`} replace />;
  const brand = brandList.find((b) => b.slug === slug);
  const [first, second] = rest.split('/');
  if (first === 'product' && second) return <Navigate to={`/product/${second}`} replace />;
  if (first === 'shop') return <Navigate to="/shop" replace />;
  if (first === 'contact') return <Navigate to={HAS_CONTACT ? '/contact' : '/'} replace />;
  if (first && OLD_COLLECTION[first]) return <Navigate to={`/${OLD_COLLECTION[first]}`} replace />;
  if (brand && (!first || first === brand.story.slug)) return <BrandPage brand={brand} />;
  return <NotFound />;
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      {testMode && (
        <div className="testbar" role="status">
          <strong>Test mode</strong> Sold-out items can be ordered; orders are sent as test orders.
          <button type="button" onClick={exitTestMode}>Exit test mode</button>
        </div>
      )}
      <RouteEffects />
      <Header />
      <CartDrawer />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="wrap section" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<StoreHome />} />
            <Route path="/shop" element={<Listing mode="all" />} />
            <Route path="/bestsellers" element={<Listing mode="bestsellers" />} />
            {storeCategories.map((c) => <Route key={c.slug} path={`/${c.slug}`} element={<Listing key={c.slug} mode="category" category={c} />} />)}
            {storeCategories.flatMap((c) => (c.sections ?? []).map((s) => (
              <Route key={`${c.slug}/${s.id}`} path={paths.subcategory(c, s)} element={<SubcategoryPage key={`${c.slug}/${s.id}`} category={c} sub={s} />} />
            )))}
            <Route path="/product/:code" element={<Product />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<About />} />
            {HAS_CONTACT && <Route path="/contact" element={<Contact />} />}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:code" element={<OrderConfirmed />} />
            <Route path="/track" element={<Track />} />
            {POLICY_LIVE.shipping && <Route path="/shipping" element={<InfoPage slug="shipping" />} />}
            {POLICY_LIVE.shipping && <Route path="/refunds" element={<Navigate to="/shipping" replace />} />}
            {POLICY_LIVE.privacy && <Route path="/privacy" element={<InfoPage slug="privacy" />} />}
            {POLICY_LIVE.terms && <Route path="/terms" element={<InfoPage slug="terms" />} />}
            <Route path="/about/founder" element={<Founder />} />
            <Route path="/account" element={<AccountHome />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/:slug/*" element={<OldBrandPath />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ConsentBanner />
    </>
  );
}
