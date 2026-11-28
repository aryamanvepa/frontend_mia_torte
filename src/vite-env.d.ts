/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** "1" hides made-up label data and stock product photos (launch switch, src/content/test-labels.ts). */
  readonly VITE_HIDE_TEST_DATA?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv }
/** true only in the design-playground build (VITE_PLAYGROUND=1); a compile-time constant, so playground code is dropped from production. */
declare const __PLAYGROUND__: boolean;
