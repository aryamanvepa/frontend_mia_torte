/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** "1" hides made-up label data and stock product photos (launch switch, src/content/test-labels.ts). */
  readonly VITE_HIDE_TEST_DATA?: string;
  /** Design playground build (playground branch): sample testimonials, design panel. */
  readonly VITE_PLAYGROUND?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv }
