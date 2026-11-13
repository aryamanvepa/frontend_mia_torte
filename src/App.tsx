import { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { CartDrawer, Footer, Header } from './components/layout';
import { ConsentBanner } from './components/Consent';
import { brandList } from './content/brands';
import { storeCategories } from './content/store';
import { trackPageView } from './lib/analytics';
import { exitTestMode, testMode } from './lib/testmode';
import { StoreHome } from './pages/Home';
import Listing from './pages/Shop';
import Product from './pages/Product';
import SearchPage from './pages/Search';
import { About, BrandPage, Contact, Credits, InfoPage, NotFound } from './pages/Info';
import { OrderConfirmed, Track } from './pages/Order';

const Checkout = lazy(() => import('./pages/Checkout'));
// Customer accounts (src/pages/Account.tsx, src/lib/auth.ts) wait on backend task B8, which is not approved yet.
// They stay in the repo but unwired, so supabase-js stays out of the bundle. /account falls through to Not found.

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
function OldBrandPath() {
  const { slug = '', '*': rest = '' } = useParams();
  const brand = brandList.find((b) => b.slug === slug);
  const [first, second] = rest.split('/');
  if (first === 'product' && second) return <Navigate to={`/product/${second}`} replace />;
  if (first === 'shop') return <Navigate to="/shop" replace />;
  if (first === 'contact') return <Navigate to="/contact" replace />;
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
            <Route path="/product/:code" element={<Product />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:code" element={<OrderConfirmed />} />
            <Route path="/track" element={<Track />} />
            <Route path="/shipping" element={<InfoPage slug="shipping" />} />
            <Route path="/refunds" element={<InfoPage slug="refunds" />} />
            <Route path="/privacy" element={<InfoPage slug="privacy" />} />
            <Route path="/terms" element={<InfoPage slug="terms" />} />
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
