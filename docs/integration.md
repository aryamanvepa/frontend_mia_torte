# Front end ↔ back end

The storefront works with any back end that provides the calls below. It does not assume that Hostinger, or the website itself, is the master record for inventory, prices, orders or customers.

Everything the shopper sees about **price, stock, availability, delivery, totals and orders comes from the API**. The browser only formats it for display.

The API layer is one file, `src/lib/api.ts`.

## Calls

| Call | Purpose | Status |
|------|---------|--------|
| `storefront_catalogue` | Every pack (SKU) for sale. See the fields below. | Live |
| `storefront-order` `action: quote` | Server-priced basket: lines, problems (out of stock), shipping rule, delivery for a PIN, promo, total | Live |
| `storefront-order` `action: place` | Creates the order. Idempotent: it never takes a unit price from the browser. | Live |
| `storefront_order_status` | Order tracking: status, timeline, shipment, payment and refund | Live |
| `storefront_request_cancellation` | Customer asks to cancel an order | Live |
| `storefront_notify_me` | "Email me when available" | Live |
| Payment (B9) | Create a payment for an order; update payment status by webhook | Waits on the gateway choice |

## Catalogue fields

These come per pack:
- `code`, `product`, `product_code`, `brand`, `brand_code`, `category`
- `pack_size`, `pack_unit`, `pack_grams`
- `price`, `mrp`
- `availability`, `only_left`, `max_qty`
- `status` (requested, B15)
- `bestseller_rank`, `is_new`, `images`, `details` (label information)

### `status`

| Status | Can be bought? | What the shopper sees |
|--------|----------------|-----------------------|
| `available` | Yes | Price and Add to bag |
| `out_of_stock` | No | "Out of stock" and a Notify me button. The product stays listed. |
| `coming_soon` | No | "Coming soon" and a Notify me button. The product stays listed. |
| `discontinued` | No | Hidden from listings and search. Its page says "no longer available" and shows alternatives. A bag containing it can't check out. |

Until the back end sends `status`, the site works it out from `availability`.

## Content that should move to the back end later

These live in the front end today, in `src/content/products.ts`:
- product descriptions (`summary`, `intro`), taste notes and serving ideas
- website photos

If the final site is built in Hostinger, or anything else, these should be served by the back end, next to `details`, so that every front end shows the same words.

Categories, the home-page order and the cross-category pairings are website configuration, in `src/content/store.ts`.
