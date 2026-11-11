import { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { CartDrawer, Footer, Header } from './components/layout';
import { brandList, brands, type Brand } from './content/brands';
import { brandFromPath, brandOf, paths } from './lib/brand';
import { Landing, MtHome, NsHome } from './pages/Home';
import BrandShop from './pages/Shop';
import Product from './pages/Product';
import { BrandContact, BrandStory, Credits, InfoPage, NotFound } from './pages/Info';
import { OrderConfirmed, Track } from './pages/Order';

const Checkout = lazy(() => import('./pages/Checkout'));

/** Scroll to top on navigation and switch the visual theme (Mia Torte / Nutri Sampoorna / house). */
function RouteEffects() {
  const { pathname } = useLocation();
  const brand = brandFromPath(pathname);
  useLayoutEffect(() => {
    document.documentElement.dataset.brand = brand?.theme ?? 'house';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', brand?.theme === 'ns' ? '#f3f1ea' : '#f6efe5');
  }, [brand]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** "/mia-torte/:slug" is a collection, or not found. */
function CollectionRoute({ brand }: { brand: Brand }) {
  const { slug } = useParams();
  const c = brand.collections.find((x) => x.slug === slug);
  return c ? <BrandShop key={c.slug} brand={brand} collection={c} /> : <NotFound />;
}

// Old addresses from the first version of the site keep working.
function LegacyShop() {
  const [p] = useSearchParams();
  return <Navigate to={paths.shop(brandOf(p.get('brand')) ?? brands.MT)} replace />;
}
function LegacyProduct() {
  const { code = '' } = useParams();
  const b = brandOf(code.toUpperCase().slice(0, 2));
  return b ? <Navigate to={`/${b.slug}/product/${code}`} replace /> : <NotFound what="product" />;
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <RouteEffects />
      <Header />
      <CartDrawer />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="wrap section" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            {brandList.map((b) => (
              <Route key={b.code} path={`/${b.slug}`}>
                <Route index element={b.code === 'MT' ? <MtHome /> : <NsHome />} />
                <Route path="shop" element={<BrandShop brand={b} />} />
                <Route path={b.story.slug} element={<BrandStory brand={b} />} />
                <Route path="contact" element={<BrandContact brand={b} />} />
                <Route path="product/:code" element={<Product brand={b} />} />
                <Route path=":slug" element={<CollectionRoute brand={b} />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            ))}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:code" element={<OrderConfirmed />} />
            <Route path="/track" element={<Track />} />
            <Route path="/shipping" element={<InfoPage slug="shipping" />} />
            <Route path="/refunds" element={<InfoPage slug="refunds" />} />
            <Route path="/privacy" element={<InfoPage slug="privacy" />} />
            <Route path="/terms" element={<InfoPage slug="terms" />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/shop" element={<LegacyShop />} />
            <Route path="/product/:code" element={<LegacyProduct />} />
            <Route path="/about" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
