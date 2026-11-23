# Launch readiness: shop (lamiatorte.com)

Written 2026-11-23. This covers the shop only; the backend and the ops app have their own checklists.

## 1. Placeholders: what's on the site that isn't real yet

On the site, every item below carries a small tag while `SHOW_PLACEHOLDER_FLAGS = true` (`src/content/site.ts`). The tags are "Placeholder", "Content needed", "Draft · confirm" and "Test data". Before launch, set the flag to `false` **after** the real values are in. Otherwise the tags just disappear and the text behind them stays.

> **Go-live state (2026-11-23).** Every business detail in A is now `null` in `src/content/site.ts` and hidden everywhere. The footer, product pages, contact page and search data show nothing in its place. To turn one back on, put the real value in. The Contact page and its links come back once there's an email or phone (`HAS_CONTACT`). The policy pages in B are off with `SHOW_POLICY_PAGES = false`: no routes, links or sitemap entries. Brand-page sections that were only "to be supplied" (founder's story, kitchen, bespoke, sourcing, trade) are left out. `VITE_HIDE_TEST_DATA=1` is set. Product pages drop every label row they don't have real values for and show one line instead: "Have an allergy or dietary question? Please contact us before ordering." That line links to /contact once a contact route exists. `npm run check` fails the build if any of these come back as stand-ins.

### A. Business details. The owner must supply these; they all appear in the footer, on product pages or in policy pages

| What | Where in code | Shows on | Needed from the owner |
|---|---|---|---|
| FSSAI licence no. (`00000000000000`) | `site.fssaiLicence`, `src/content/site.ts` | Footer, every product page ("FSSAI licence") | The real 14-digit licence number. Legally required on food e-commerce. |
| GSTIN ("to be added") | `site.gstin` | Not displayed yet (kept for invoices/policies) | GSTIN, if it should appear on the site |
| Registered office address | `site.registeredAddress` | Every product page ("Manufactured & marketed by") | Full registered address (FSSAI requires manufacturer name and address) |
| Customer-care email (`hello@example.com`) | `site.email` | Footer, product pages, Contact | A real inbox, e.g. hello@lamiatorte.com |
| Phone (`+91 00000 00000`) | `site.phone` | Footer, product pages, Contact | A real number |
| Hours ("Mon–Sat, 10 am – 6 pm IST") | `site.hours` | Footer, Contact | Confirm or correct |
| Instagram link (`https://instagram.com/`) | `site.instagram` | Not shown yet | Handle, if any |
| Dispatch note ("1–2 working days") | `site.dispatchNote` | Product pages | Confirm |
| Delivery note ("₹60, free above ₹999") | `site.deliveryNote` | Product pages | Confirm (the server's quote is what actually charges) |

### B. Policy pages: Shipping, Returns & refunds, Privacy, Terms (`pages` in `src/content/site.ts`)

All four pages are mostly headings with "to be supplied" bodies. They need real text from the owner, ideally checked by someone who knows Indian e-commerce rules: the Consumer Protection (E-Commerce) Rules 2020 and the DPDP Act 2023 (privacy and grievance officer). Specifically:
- **Shipping:** areas served, dispatch times, how payment on delivery works.
- **Returns & refunds:** the damaged-item process, the cancellation window, refund method and timelines.
- **Privacy:** what's collected and why, the marketing-consent rule, who data is shared with, and the grievance officer's name and contact. The back-in-stock section is drafted and needs confirming.
- **Terms:** orders and pricing, food safety and allergens, governing law.

### C. Product label data (made up, for testing) → `src/content/test-labels.ts`, listed in `docs/test-label-data.md`

- **What it is:** all 29 products (27 in the catalogue, plus Oreo Cookies n Cream and the Assorted Cookie Gift Box) show made-up ingredients, allergens, veg/vegan mark, best-before and a full nutrition table, each tagged "Test data".
- **Not publishable:** FSSAI requires the website to match the printed pack.
- **Owner needs to:** enter the real values per product in the ops app (Admin → Products). Real values override the test ones automatically.
- **Launch switch:** set the repository variable `VITE_HIDE_TEST_DATA=1` to hide every made-up value at once. Pages then say "Details coming soon", the allergen line says to contact us before ordering, and there's no nutrition table. Real ops-app values still show. It's off now.
- **Not in structured data:** none of the label data is in the search-engine data (JSON-LD), whichever way the switch is set.

### D. Photos → `src/content/images.ts`, listed in `docs/test-images.md`

| Kind | Products / places | Needed |
|---|---|---|
| **Stock stand-ins (`test-…`)** | Mocha Me Happy, Red Velvet Melt, Nutella Brownie Bliss, Jowar Jeera Delight, Nutty Orange Muesli, Peri Peri Vegie Chips, and every Nutri Sampoorn product (6 flours, 3 dosa mixes, Peanut Putana Chutney) | Real photos. `VITE_HIDE_TEST_DATA=1` also hides these (the product's illustration shows instead). |
| **Real photos still showing the old "Mia Torte" label** | Pudina Millet Crunch (jar shot), Masala Protein Bean Mix, Peri Peri Trail Mix, Salted Nuts & Bean Crunch (both shots), Assorted Cookie Gift Box / home "Made for sharing" / Gifting category, and the three muesli photos (pouch labels) | Re-shoot with "La Mia Torte" packs, or edit the labels |
| **Third-party brands in photos** | The Biscoff Indulgence photo shows a Lotus biscuit with its logo; product names use "Biscoff", "Nutella" and "Oreo" | Get these checked for trademark use before launch |
| **Possibly AI-generated** | The three muesli photos and the Pudina bowl photo (home Better Snacking feature) | Fine to use; just be aware |
| **Licensed stock (Unsplash), credited on /credits** | Home banner (flour hands), craving tiles, category banners, brand story pages | Fine to launch with. Not product photos. |

### E. Draft copy ("Draft · confirm")

- **Products:** every product has a description and a "how it tastes / how to use" paragraph written to the brand brief, 1–2 per product. The owner should confirm the facts in them, e.g. "made without an overnight soak" or "eight to a pack". Then change `draft('…')` to a plain string in `src/content/products.ts`.
- **Missing preparation notes:** the three dosa mixes show "Preparation notes to be added" on their product pages.
- **Brand pages, La Mia Torte:** the founder's story ("Where it began"), "Bespoke creations" and "The kitchen" (address) are placeholders. The principles are drafts.
- **Brand pages, Nutri Sampoorn:** sourcing and trade/wholesale are placeholders.

### F. Analytics, test mode, other

- **Analytics:** none is set up. Set the repository variables `VITE_GA4_ID` (G-…) and/or `VITE_META_PIXEL_ID` to turn on GA4 or the Meta Pixel. The cookie banner and "Cookie settings" link appear only once one is set.
- **Test mode (`?test=1`):** still works on the live site. It shows a banner and lets coming-soon packs go in the bag. The **server** accepts test orders only while the ops app's testing mode is on, so the backend must **turn testing mode off at launch**. The shop needs no change.
- **TODO / FIXME / lorem / dummy reviews:** none in the code. There are no reviews or testimonials on the site, and star ratings show only if the backend provides them.
- **Barcodes:** never shown (the launch check fails the build if one appears).

## 2. SEO: what's in place

- **Real HTML for every page:** every shop page is pre-rendered at build time (`scripts/prerender.mjs`). Search engines and link previews get real HTML with title, description, canonical URL, Open Graph/Twitter tags and JSON-LD.
- **Routing:** normal paths (`/product/MT-000039`, `/better-snacking`), no hash routing. Unknown paths fall back to `404.html`, which boots the app.
- **sitemap.xml and robots.txt:** written at build time on the site address (`VITE_SITE_URL`). Checkout, order and tracking pages are `noindex` and left out of the sitemap.
- **JSON-LD:**
  - Organization (with logo), WebSite with site search, and BreadcrumbList.
  - Product with one Offer per pack. Prices come from the catalogue; availability is honest ("Coming soon" and test-mode stock count as **out of stock**).
  - No nutrition, allergens or ingredients.
  - Star ratings only if the backend sends real ones.
- **Share card:** the home page and pages without a photo share `brand/share-card.jpg` (1200×630). Product pages share the product photo.
- **Launch check:** `npm run build && npm run check` verifies all of the above on every page.

## 3. Hosting (changed 2026-11-23)

The shop is hosted on **Cloudflare Pages**, at https://lamiatorte.com, because GitHub Pages' terms don't allow e-commerce. The github.io copy stays up too. Both are built by `.github/workflows/deploy-pages.yml`, which runs on every push to main, every night at 02:00 IST and on demand:
- **`cloudflare` job:** builds with `BASE_PATH=/`, runs `npm run check`, then `wrangler pages deploy dist --project-name=lamiatorte --branch=main`. It needs the repository secret `CLOUDFLARE_API_TOKEN` and the variable `CLOUDFLARE_ACCOUNT_ID`.
- **`github-pages` + `deploy` jobs:** build with `BASE_PATH=/frontend_mia_torte/`, run `npm run check`, then deploy to GitHub Pages. They don't depend on the Cloudflare job.
- **Site address:** both builds use `VITE_SITE_URL=https://lamiatorte.com` (the default), so canonicals, structured data and the sitemap always point at the main domain.
- **Custom domain:** none is set on GitHub Pages, and there's no `public/CNAME`. The lamiatorte.com domain is attached to the Cloudflare Pages project.
- **404 page:** `404.html` is kept. Cloudflare Pages serves it with a 404 status for unknown paths, and it boots the app.
