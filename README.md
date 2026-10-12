# DOCKET

A small app where a **freelancer** runs their business and a **client** tracks the shared work.

## Features

- Landing page with sign-in panel (dark marketing side + light sign-in side)
- Two roles — freelancer and client — with their own dashboard and pages
- Freelancer: manage clients, projects and invoices
- Client: follow the shared project, see freelancers, track invoices
- One shared project page both sides open (overview, invoices, files, payments)
- Project progress tracking from the freelancer side
- File sharing on the project — the client uploads, both sides see the list (records name and size)
- Invoices with draft → sent → paid flow and overdue highlighting
- Online payments with Razorpay — order creation and signature verification on the server
- Payment shows up instantly on the freelancer side (project Payments tab + dashboard totals)
- Dashboards for both sides: active projects, money owed, money received, latest activity
- Sign-in with Google or email/password through Firebase Auth

## Tech stack

- React  + Vite — UI and dev server
- Tailwind CSS — all styling
- react-router — pages and role-based routing
- axios — talks to the API
- json-server —  REST backend, all data in `db.json`
- Razorpay Node SDK — order creation and payment signature verification
- Firebase Auth — Google and email/password sign-in
