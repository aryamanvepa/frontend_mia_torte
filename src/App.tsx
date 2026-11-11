import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer, Footer, Header } from './components/layout';
import { site } from './content/site';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import { Credits, InfoPage, NotFound } from './pages/Info';
import { OrderConfirmed, Track } from './pages/Order';

const Checkout = lazy(() => import('./pages/Checkout'));

function ScrollAndTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (pathname === '/' || pathname === '/shop') document.title = `${site.name} · ${site.tagline}`;
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <ScrollAndTitle />
      <Header />
      <CartDrawer />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="wrap section" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:code" element={<Product />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:code" element={<OrderConfirmed />} />
            <Route path="/track" element={<Track />} />
            <Route path="/about" element={<InfoPage slug="about" />} />
            <Route path="/shipping" element={<InfoPage slug="shipping" />} />
            <Route path="/refunds" element={<InfoPage slug="refunds" />} />
            <Route path="/privacy" element={<InfoPage slug="privacy" />} />
            <Route path="/terms" element={<InfoPage slug="terms" />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
