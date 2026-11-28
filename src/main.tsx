import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Headings: Libre Caslon (Google Fonts, self-hosted so visitors' browsers never call Google; font-display: swap).
// Display for large headings, Text for smaller ones. Only the weights in use.
import '@fontsource/libre-caslon-display/400.css';
import '@fontsource/libre-caslon-text/400.css';
import '@fontsource/libre-caslon-text/400-italic.css';
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
