import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Design playground (VITE_PLAYGROUND=1, deployed to playground.lamiatorte.pages.dev only): adds the design
// panel as a second entry, marks every page noindex and blocks all crawling. With the flag off this plugin
// does nothing and __PLAYGROUND__ is `false`, so every playground branch is removed from the production bundle.
const PLAYGROUND = process.env.VITE_PLAYGROUND === '1';
function playground(): Plugin {
  let outDir = 'dist';
  let build = false;
  return {
    name: 'design-playground',
    configResolved(c) { outDir = c.build.outDir; build = c.command === 'build'; },
    transformIndexHtml: {
      order: 'pre',
      handler: () => [
        { tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head-prepend' },
        { tag: 'script', attrs: { type: 'module', src: '/src/playground/main.tsx' }, injectTo: 'body' },
      ],
    },
    closeBundle() {
      if (!build) return;
      writeFileSync(join(outDir, 'robots.txt'), '# Design playground: never index\nUser-agent: *\nDisallow: /\n');
      writeFileSync(join(outDir, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');
    },
  };
}

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
  plugins: [react(), githubPages(), ...(PLAYGROUND ? [playground()] : [])],
  define: { __PLAYGROUND__: JSON.stringify(PLAYGROUND) },
  build: { target: 'es2020', cssCodeSplit: true },
});
