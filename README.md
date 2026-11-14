# Torte Living — online shop

Customer-facing shop for Torte Living Pvt. Ltd., selling two brands in one store:
**Mia Torte** (boutique bakery in the European pâtisserie tradition) and **Nutri Sampoorn**
(contemporary pantry of Indian grains, millets and pulses). React + Vite + TypeScript, hosted on GitHub Pages, running on the
Torte Living Supabase back end (the same database as the
[operations app](https://github.com/aryamanvepa/Inventory-front-end)).

**Live:** https://aryamanvepa.github.io/frontend_mia_torte/

## How it fits together

| Concern | Where it lives |
|---|---|
| Prices, stock, availability | Database: `storefront_catalogue()` (publishable key). Never computed in the browser. |
| Cart re-check, delivery charge, order placement | Edge Function `storefront-order` (Inventory-front-end repo, `supabase/functions/storefront-order/`) |
| Order intake, stock reservation, order codes | Database: `ingest_order` (called by the Edge Function with the service role) |
| Order tracking | Database: `storefront_order_status(code, phone)` |
| Words, photos, tasting notes, allergens | This repo: `src/content/` |

Orders placed here appear in the ops app's **Pack** queue as `confirmed` (pay on delivery).
Each checkout attempt carries a client-generated id, so a retried submit never creates a duplicate.

## Site structure

One food store organised by **buying behaviour**; Mia Torte and Nutri Sampoorn appear only as
labels on products (and on their own brand-story pages). One visual theme for the whole store.

| Address | Page |
|---|---|
| `/` | Store home: hero, shop by craving, bestsellers, Better Snacking band, Everyday Nourishment entry points, new discoveries, gifting, company |
| `/shop` | Shop All |
| `/indulgence-treats`, `/better-snacking`, `/everyday-nourishment`, `/gifting-discovery` | Store categories (filters in the URL: type, brand, price, pack size, diet, sort) |
| `/bestsellers` | Bestsellers (backend `bestseller_rank`; until then a fixed order) |
| `/search?q=` | Search with synonyms (`src/lib/search.ts`); the header box suggests as you type |
| `/product/<SKU>` | Product page (canonical = first pack of the product) |
| `/mia-torte`, `/nutri-sampoorn` | Brand story + that brand's products |
| `/about`, `/contact`, `/account`, `/track` | Company, contact, account (email code sign-in), order tracking + cancellation request |
| `/checkout`, `/shipping`, `/refunds`, `/privacy`, `/terms` | Shared |

Old brand addresses (`/mia-torte/shop`, `/<brand>/product/<SKU>`, …) redirect to the new ones.
Store categories and the mapping from ops-app categories live in `src/content/store.ts`.

**Backend extras with fallbacks** (see the backend task list): `bestseller_rank`, `is_new`,
`images`, `rating`/`review_count` on the catalogue; `delivery` (PIN check + ETA) and `promo` on the
quote; `storefront_my_orders` / `storefront_my_profile`; `storefront_request_cancellation`; the
extra fields of `storefront_order_status`. Until each exists the website hides the feature or
shows a placeholder (e.g. delivery estimate from `deliveryFallback`, "Promo codes aren't
available yet", "contact us to cancel").

**Analytics** (GA4 `VITE_GA4_ID`, Meta `VITE_META_PIXEL_ID`, both optional) load only after the
shopper accepts the cookie bar; test orders never count as purchases.

**Collections follow the product category set in the ops app.** The mapping is in
`src/content/brands.ts` (`categories` on each collection, matched case-insensitively). A collection
with no products shows a "coming soon" note written in the brand's voice.

| Ops-app category | Brand | Collection |
|---|---|---|
| Cookies | Mia Torte | Cookies & Biscuits |
| Muesli | Mia Torte | Muesli |
| Snacks | Mia Torte | Savoury Snacks |
| Atta & flours | Nutri Sampoorn | Atta & Grain Blends |
| Dosa & batter mixes | Nutri Sampoorn | Breakfast & Dosa Mixes |
| Chutney powders | Nutri Sampoorn | Pantry & Snacks |

A product belongs to the brand of its `brand_code` (MT / NS) in the ops app.

**One card per product.** Pack sizes of the same product (the `product` field) share one card
("4 sizes · 140 g to 500 g", "from ₹178") and are chosen on the product page. The pack type
("jar", "pouch") is read from the end of the SKU name.

**Coming soon.** While a brand has nothing in stock at all, its products read "Coming soon"
(no add-to-bag) instead of "Sold out". As soon as any of that brand's SKUs has stock, normal
labels return automatically: in stock, few left, sold out. Ordering rules are unchanged; the
server still decides what can be bought.

**Notify me.** Every sold-out or coming-soon pack size shows a small form (email, optional first
name, an unticked consent box linking to the privacy page). It calls `storefront_notify_me`; the
website can't read the list back. Staff see it in the ops app (More → Back-in-stock alerts).

**Label details from the ops app.** `storefront_catalogue` returns `details` per product
(description, ingredients, allergens, diet, nutrition per 100 g, storage, shelf life,
`confirmed`), filled in under Admin → Products. Wherever a field is filled in it replaces the
copy in `src/content/products.ts`. Until `confirmed` is true those facts carry a
"Draft · confirm" tag. The veg / non-veg mark appears only from `diet` (egg shows as
non-vegetarian, as FSSAI requires), never from the website's own copy.

## Replacing placeholders (for the client)

Two kinds of flag are shown on the site while `SHOW_PLACEHOLDER_FLAGS = true` in `src/content/site.ts`:

* **Placeholder**: information still missing (FSSAI number, address, ingredients list…).
* **Draft · confirm**: copy written to the brand brief that states a fact about a recipe, an
  ingredient or a method. Confirm it or correct it before launch.

| What | File |
|---|---|
| FSSAI licence no., GSTIN, address, email, phone, hours, delivery note | `src/content/site.ts` → `site` |
| Landing page copy | `src/content/site.ts` → `house` |
| Brand copy: home pages, story/philosophy, contact, collections | `src/content/brands.ts` |
| Shipping, Refunds, Privacy, Terms pages | `src/content/site.ts` → `pages` |
| Product introduction, ingredients story, flavour/preparation, serving, **ingredients list, allergens, veg mark, nutrition table, storage, best before** | `src/content/products.ts` (keyed by product name, shared by all its pack sizes) |
| Photos | see below |

Replace `placeholder('…')` or `draft('…')` with a plain string once confirmed. Before launch, set
`SHOW_PLACEHOLDER_FLAGS = false`.

The label information on each product page (ingredients, allergens, nutrition, veg/non-veg mark,
best before) must match the printed pack label (FSSAI Labelling & Display Regulations 2020).

### Adding a product

Create the SKU and its WEB price in the ops app, with a category that maps to a collection; it
appears in the shop automatically, with an illustrated placeholder. Then add an entry to
`src/content/products.ts` under its exact product name, with its own words, label information and
photos. Write each description individually, never the same text with the name changed, and
don't state ingredient, health or nutrition facts that aren't confirmed: wrap anything factual in
`draft('…')` until it is.

### Replacing photos

**Products have no photos yet.** Each shows an illustration (a line drawing for its category,
its name and "photo to follow", `src/components/PackArt.tsx`), so nothing is passed off as the
real product. The mood and ingredient photos on home, story and collection pages are **stock
placeholders** from Unsplash (free under the Unsplash Licence), credited in
`src/content/images.ts` and on the site's `/credits` page.

1. Put the real photos in a folder, named by image id, e.g. `mt-classic-choc-chip-1.jpg`
   (reuse an existing id to replace it, or pick a new one).
2. `npm run images -- path/to/that/folder` → writes `public/images/<id>-640/1280/1920.webp`
   and updates `src/content/images.generated.json`.
3. Update the alt text in `src/content/images.ts` (set `credit: null` for your own photography)
   and list a product's photo ids in its `images` in `src/content/products.ts`; they replace
   the illustration automatically.

## SEO

* **Every page is pre-rendered.** After `vite build`, `scripts/prerender.mjs` opens each page in
  headless Chrome with the live catalogue and saves it as real HTML (`dist/<path>/index.html`), so
  search engines and link previews get the full page with a 200 status. The app then starts as
  normal and shows live prices and stock. It finds pages by following links, so new products and
  collections are included automatically. The deploy runs nightly to keep them fresh.
* **Per-page tags** (`src/lib/seo.ts`, `useSeo`): title, description, canonical address, Open
  Graph/Twitter preview tags. Checkout, order, tracking and 404 pages are `noindex`.
* **Structured data**: organisation (home pages), breadcrumbs (collections, story, products) and
  Product with one Offer per pack size (live website price, availability). Every pack size has its
  own page, but all point at one canonical page per product. No barcodes, no GST, no strategic
  prices. Google shows product rich results only once real photos are added.
* **`sitemap.xml` and `robots.txt`** are written by the pre-render step. On GitHub Pages the
  robots.txt isn't at the domain root, so search engines ignore it until there's a custom domain;
  submit the sitemap in Google Search Console instead.
* **Moving to a domain:** set the repository variable `VITE_SITE_URL` (e.g.
  `https://torteliving.in`) and `BASE_PATH` to `/`, then add the domain to `STOREFRONT_ORIGINS`
  in Supabase.
* Locally, `npm run build` pre-renders when Chrome is installed (`CHROME_PATH` to point at it,
  `PRERENDER=0` to skip).

## Test orders (before there is stock)

Open any page with `?test=1` to turn on **test mode** in that browser (`?test=0` or the banner's
"Exit test mode" turns it off). While it's on:

* a striped banner shows on every page;
* sold-out and coming-soon packs can go in the bag (up to 5 per line);
* checkout has a **Fill test details** button (Test Customer, a 9000000xxx phone, a
  "TEST ORDER – do not ship" address);
* quote and place requests carry `"test": true`.

The server decides: the `storefront-order` function accepts test orders only while the ops app's
testing mode is on (More → Testing tools), and marks them as test orders. Then follow each one
through in the ops app: Orders → Process → pack → dispatch → record the cash on delivery.

## Placeholder business rules

* Delivery: ₹60 per order, free when the subtotal is above ₹999. The constants are in
  `supabase/functions/storefront-order/logic.ts` in the Inventory-front-end repo (the shop displays whatever it returns).
* Payment: pay on delivery only. The Edge Function is structured so Razorpay can be added
  (create the order as `unpaid`, confirm with `ingest_payment` from the gateway webhook).
* Max 10 different items and 20 of each per order; 5 orders per phone number per 24 h.

## Develop

```bash
cp .env.example .env.local   # Supabase URL + publishable key (both browser-safe)
npm install
npm run dev                  # http://localhost:5173
```

The Edge Function only accepts browser requests from origins listed in its `STOREFRONT_ORIGINS`
secret (default: `https://aryamanvepa.github.io`, `http://localhost:5173`, `http://localhost:4173`).

## Deploy

Every push to `main` builds and publishes to GitHub Pages (`.github/workflows/deploy-pages.yml`).
Repository variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
**Never** put the Supabase service_role key in this repository.
