import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// GitHub Pages: serve the app for any deep link (404.html = index.html) and skip Jekyll.
function githubPages(): Plugin {
  let outDir = 'dist';
  return {
    name: 'github-pages-spa',
    apply: 'build',
    configResolved(c) { outDir = c.build.outDir; },
    closeBundle() {
      copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'));
      writeFileSync(join(outDir, '.nojekyll'), '');
    },
  };
}

export default defineConfig({
  // BASE_PATH is "/<repo-name>/" on GitHub Pages (set by the deploy workflow); "/" locally.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), githubPages()],
  build: { target: 'es2020', cssCodeSplit: true },
});
