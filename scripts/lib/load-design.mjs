// Loads src/playground/design.ts (the playground's settings → tokens mapping) in plain Node,
// so the apply and check scripts use exactly the code the panel uses. esbuild comes with Vite.
import { build } from 'esbuild';

export async function loadDesign() {
  const out = await build({ entryPoints: ['src/playground/design.ts'], bundle: true, format: 'esm', write: false, platform: 'neutral', logLevel: 'silent' });
  return import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
}

/** The `:root { … }` defaults block that levers.css must start with. */
export const rootBlock = (vars) => `:root {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`;
