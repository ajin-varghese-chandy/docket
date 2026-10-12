# DOCKET API

Standalone REST backend for DOCKET. It is its own npm package — install and run
it on its own, independent of the React app in the parent folder.

## Run it

```bash
cd server
npm install
npm run dev        # http://localhost:4000
```

From the project root you can still run everything together:

```bash
npm install        # web only
npm start          # api (port 4000) + web (port 5173)
```

## What it serves

- json-server over `db.json` — the whole store (`/users`, `/projects`,
  `/invoices`, `/payments`, `/files`)
- `GET /razorpay-config` — public Razorpay key id, or `{ enabled: false }`
- `POST /orders` — creates a Razorpay order for an invoice
- `POST /payments/verify` — checks the signature, then marks the invoice paid
  and records the payment

The Vite dev server proxies `/api` to this port, so the frontend never talks to
4000 directly.

## Environment

Put the keys in `server/.env` (preferred) or in the project root `.env`. Values
already in the environment always win, and `server/.env` wins over the root one.

```bash
PORT=4000
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
```

Without Razorpay keys the API still runs; the two payment routes answer with a
"not configured" error.

## Data

`db.json` is the entire database — json-server writes straight back to it, so
treat it as seed data, not as something to hand-edit while the server runs.
