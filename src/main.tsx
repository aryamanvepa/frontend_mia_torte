import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/dm-sans/index.css';
import './styles.css';
import App from './App';
import { CartProvider, CatalogueProvider } from './state/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <CatalogueProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </CatalogueProvider>
    </BrowserRouter>
  </StrictMode>,
);
