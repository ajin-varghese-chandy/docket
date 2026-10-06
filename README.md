# DOCKET

A small React demo where a **freelancer** runs their business and a **client** tracks the shared work.

```
DOCKET
├── FREELANCER            └── CLIENT
│   Manage business           Track work
│   ├── Clients               ├── Projects
│   ├── Projects              └── Invoices
│   └── Invoices
└────────── SHARED PROJECT ──────────┘
```

The two roles are **two separate sets of pages** in the code (`src/pages/Freelancer*.jsx` and
`src/pages/Client*.jsx`). They share one sidebar (`src/components/Layout.jsx`) and one project
page (`src/pages/ProjectDetail.jsx`). The freelancer updates progress and sends invoices; the
client uploads files and pays invoices through Razorpay. The freelancer sees the payment land.

## Stack

| Piece          | What it does                                        |
| -------------- | --------------------------------------------------- |
| React + Vite   | The user interface                                  |
| react-router   | Pages like `/projects` and `/invoices`              |
| axios          | Talks to the json-server API                        |
| Tailwind CSS   | All the styling, as utility classes                 |
| json-server    | Fake REST backend that stores everything in db.json |
| Razorpay       | Official Node SDK: orders, signature verification    |
| Firebase Auth  | Google sign-in and email/password sign-in           |

Everything is plain JavaScript. No TypeScript, no state library, no separate CSS files.

## Running it

```bash
npm install
npm start
```

`npm start` runs two things at once:

- **json-server** on http://localhost:4000 — the backend, reading and writing `db.json`, plus the
  Razorpay order/verification endpoints
- **Vite** on http://localhost:5173 — the app

Open http://localhost:5173.

If you only want one of them:

```bash
npm run api    # backend only
npm run dev    # app only
```

## Signing in

### Demo mode (works out of the box)

If you have not set up Firebase, the login screen simulates sign-in using the sample accounts
already in `db.json`. Click a role card to continue with Google, or use the email and password
fields (any password of 6 or more characters works). You can also pick a specific account:

| Account              | Role       | Sees                                   |
| -------------------- | ---------- | -------------------------------------- |
| `alex@docket.dev`    | Freelancer | All clients, projects and invoices     |
| `sam@acme.com`       | Client     | Acme projects, files and invoices      |
| `priya@northwind.io` | Client     | The Northwind design system project    |

Sign in as **Alex** in one browser tab and **Sam** in another (or use two browser profiles) and
you can watch the two sides of the same shared project react to each other.

### Real sign-in (Google or email/password)

1. Create a free project at https://console.firebase.google.com
2. Add a **Web app** to it
3. Enable **Authentication → Sign-in method → Google** and **Email/Password**
4. Copy `.env.example` to `.env` and paste your keys in
5. Restart `npm run dev`

The app picks up the keys automatically and switches from demo mode to real Google and
email/password sign-in. Anyone who signs in gets a row created in `db.json` the first time.

## The payment flow

Client side → **Invoices** (or a project's **Invoices** tab) → **Pay** on a `sent` invoice.

1. Add your keys to `.env` and restart `npm start`:

   ```bash
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=your-key-secret
   ```

   Without keys the Pay button says payments are disabled — there is no mock checkout.

2. The button opens **Razorpay Checkout** (UPI, cards, netbanking, wallets). Test keys charge
   nothing for real — see https://razorpay.com/docs/payments/payments/test-card-details/

3. The browser sends the `order_id`, `payment_id` and signature to `POST /payments/verify`, which
   checks the signature with the Razorpay SDK, confirms the charge against the Razorpay API, writes
   the `payments` row and flips the invoice to `paid`. Nothing is marked paid from the browser
   alone.

The freelancer then sees the payment under the project's **Payments** tab and in the dashboard total.

## Project layout

```
docket/
├── db.json                     all the data (the "database")
├── server/index.js             the API: json-server + Razorpay orders/verification
├── vite.config.js              dev server, Tailwind plugin, /api proxy
├── src/
│   ├── main.jsx                entry point
│   ├── App.jsx                 routes every page and picks the one for your role
│   ├── AuthContext.jsx         who is signed in, and their role
│   ├── firebase.js             Google and email/password sign-in (or demo fallback)
│   ├── api.js                  the axios instance for json-server
│   ├── payments.js             the Razorpay checkout flow
│   ├── format.js               money, dates, file sizes
│   ├── index.css               imports Tailwind
│   ├── components/             Layout, Avatar, Modal, PaymentModal, StatCard, StatusBadge
│   └── pages/
│       ├── Login.jsx           sign-in screen
│       ├── Profile.jsx         your account
│       ├── ProjectDetail.jsx   the shared project page (both roles)
│       ├── Freelancer*.jsx     Dashboard, Clients, Projects, Invoices
│       └── Client*.jsx         Dashboard, Freelancers, Projects, Invoices
```

## Resetting the data

Everything lives in `db.json`. Stop the server, restore the file from git (or edit it by hand),
and start again.

```bash
git checkout db.json
```

## Notes and limits

- **Files are not really uploaded.** json-server cannot store binary files, so the app records the
  file name and size only. Swap in Firebase Storage or S3 to make it real.
- **No security rules.** Anyone can read the whole `db.json` through the API. This is a demo.
- **Payments need keys.** With no Razorpay keys in `.env` the Pay button is disabled. With test
  keys the signature is verified on the server, but a production setup should also add a Razorpay
  webhook and never mark an invoice paid from the browser alone.
