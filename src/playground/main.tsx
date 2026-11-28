// Design playground entry (added to index.html by vite.config.ts only when VITE_PLAYGROUND=1).
// Loads the lever styles, applies the remembered or shared design, then mounts the panel in its own root.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './levers.css';
import './panel.css';
import { Panel } from './Panel';
import { applyDesign, initialDesign } from './runtime';

const design = initialDesign();
applyDesign(design);

document.querySelectorAll('.pg-root').forEach((n) => n.remove());
const host = document.createElement('div');
host.className = 'pg-root';
host.dataset.pg = ''; // left out of pre-rendered pages (scripts/prerender.mjs)
document.body.appendChild(host);
createRoot(host).render(<StrictMode><Panel initial={design} /></StrictMode>);
