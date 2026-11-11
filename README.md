# Mia Torte — online shop

Customer-facing shop for **Mia Torte** (patisserie) and **Nutri Sampoorna** (pantry), brands of
Torte Living Pvt Limited. React + Vite + TypeScript, hosted on GitHub Pages, running on the
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

## Replacing placeholders (for the client)

Everything still needing real input is tagged **Placeholder** on the site while
`SHOW_PLACEHOLDER_FLAGS = true` in `src/content/site.ts`.

| What | File |
|---|---|
| FSSAI licence no., GSTIN, address, email, phone, hours | `src/content/site.ts` → `site` |
| Home page copy, brand blurbs | `src/content/site.ts` → `home`, `brands` |
| About, Shipping, Refunds, Privacy, Terms pages | `src/content/site.ts` → `pages` |
| Product descriptions, tasting notes, ingredients, **allergens**, storage | `src/content/products.ts` (keyed by SKU code) |
| Photos | see below |

Replace `placeholder('…')` with a plain string once the real text is supplied. Before launch, set
`SHOW_PLACEHOLDER_FLAGS = false`.

### Adding a product

Create the SKU and its WEB price in the ops app; it appears in the shop automatically (using its
category's photo). Then add an entry to `src/content/products.ts` under its SKU code for its own copy and photos.

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
