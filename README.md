# Torte Living — online shop

Customer-facing shop for two brands of Torte Living Pvt. Ltd., each with its own identity:
**Mia Torte** (boutique bakery in the European pâtisserie tradition) and **Nutri Sampoorna**
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

| Address | Page |
|---|---|
| `/` | Torte Living: one entrance to each brand |
| `/mia-torte`, `/nutri-sampoorna` | Brand home pages (separate layouts and visual themes) |
| `/mia-torte/story`, `/nutri-sampoorna/philosophy` | Our Story / Our Philosophy |
| `/<brand>/shop` | All of a brand's products |
| `/mia-torte/cookies-biscuits`, `brownies-cakes`, `gifting`, `seasonal` | Mia Torte collections |
| `/nutri-sampoorna/atta-grain-blends`, `breakfast-dosa-mixes`, `muesli-nuts-seeds`, `pantry-snacks` | Nutri Sampoorna collections |
| `/<brand>/product/<SKU>` | Product page |
| `/<brand>/contact` | Contact |
| `/checkout`, `/track`, `/shipping`, `/refunds`, `/privacy`, `/terms` | Shared |

One bag covers both brands. The theme switches with the address (`data-brand` on `<html>`):
Mia Torte uses cream, cocoa and gold with a serif display face; Nutri Sampoorna uses rice paper,
ink and clay with a sans-serif display face and square edges (`styles.css`, "NUTRI SAMPOORNA THEME").

**Collections follow the product category set in the ops app.** The mapping is in
`src/content/brands.ts` (`categories` on each collection). A collection with no products shows a
"coming soon" note written in the brand's voice.

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
| Product introduction, ingredients story, flavour/preparation, serving, **ingredients list, allergens, veg mark, nutrition table, storage, best before** | `src/content/products.ts` (keyed by SKU code) |
| Photos | see below |

Replace `placeholder('…')` or `draft('…')` with a plain string once confirmed. Before launch, set
`SHOW_PLACEHOLDER_FLAGS = false`.

The label information on each product page (ingredients, allergens, nutrition, veg/non-veg mark,
best before) must match the printed pack label (FSSAI Labelling & Display Regulations 2020).

### Adding a product

Create the SKU and its WEB price in the ops app, with a category that maps to a collection; it
appears in the shop automatically, using its collection's photo. Then add an entry to
`src/content/products.ts` under its SKU code with its own words, label information and photos.
Write each description individually, never the same text with the name changed.

### Replacing photos

All current photos are **stock placeholders** from Unsplash (free under the Unsplash Licence),
credited in `src/content/images.ts` and on the site's `/credits` page.

1. Put the real photos in a folder, named by image id, e.g. `mt-cookies-choc-chip-1.jpg`
   (reuse an existing id to replace it, or pick a new one).
2. `npm run images -- path/to/that/folder` → writes `public/images/<id>-640/1280/1920.webp`
   and updates `src/content/images.generated.json`.
3. Update the alt text in `src/content/images.ts` (set `credit: null` for your own photography)
   and reference new ids from `src/content/products.ts`.

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
