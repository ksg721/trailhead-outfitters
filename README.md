# Trailhead Outfitters

Trailhead Outfitters is a Vite-powered static storefront prototype for an outdoor gear shop. It includes a searchable product catalog, product detail views, an add-to-cart flow, and checkout confirmation.

## Features

- Responsive catalog grid with search and category filtering
- Product detail page with add-to-cart functionality
- Persistent shopping cart stored in localStorage
- Order checkout form with validation and confirmation messaging
- Recently viewed product history surfaced on the homepage

## Project Structure

- `index.html` — homepage catalog and search/filter UI
- `product-detail.html` — single-product detail page with add-to-cart
- `cart.html` — shopping cart review and checkout page
- `design-doc.html` — design and planning document
- `src/js/` — JavaScript modules for data, rendering, storage, and page logic
- `src/css/style.css` — main stylesheet
- `public/products.json` — product inventory data

## Scripts

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Notes

- The cart uses `localStorage` to persist item quantities across page reloads.
- Checkout submission increments an order count and clears the cart.
- The homepage displays recently viewed product links after visiting detail pages.
