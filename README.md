# Landed Cost Dashboard

A React front end for the [Landed Cost API](https://github.com/MattNeill1/Landed-Cost-API) — an inventory and **landed-cost allocation** tool that spreads a shipment's overhead (freight, duty, insurance) across its line items to reveal the true, fully-loaded unit cost of each product.

### 🔗 [Live demo →](https://landed-cost-dashboard-tan.vercel.app/)

> **First load may take up to a minute.** The API runs on Render's free tier, which spins the service down after inactivity. The initial request wakes it back up; everything is fast after that.

## What it does

Buying a product for $10 doesn't mean it costs $10 to have on the shelf. Freight, customs duty, and insurance all add to what an item actually costs to land in the warehouse — and those costs arrive as a lump sum per shipment, not per item. Splitting that pool fairly across the lines is the *landed cost* problem.

This dashboard lets you:

- **Manage inventory items** — create items with SKU, description, unit cost, and quantity on hand
- **Build shipments** — enter freight/duty/insurance costs and add line items with quantities and weights
- **Run the allocation engine** — see how overhead distributes across lines by **VALUE**, **WEIGHT**, or **QUANTITY**
- **Compare methods on the fly** — switch the allocation basis on an existing shipment and recompute without saving, to see how the choice changes each line's landed cost
- **Visualize the split** — a bar chart of allocated cost per SKU
- **Drill into shipments** — expand any row to see its underlying lines

Because allocation method is a real accounting decision with real consequences, the ability to A/B two methods against the same shipment is the most useful thing here: a heavy, cheap item and a light, expensive one land at very different costs depending on which basis you pick.

## Tech stack

- **React 19** with hooks (`useState`, `useEffect`)
- **Vite 8** for dev server and build
- **Tailwind CSS v4** for styling
- **Recharts** for the allocation chart
- **Spring Boot 4 / Java 21** API ([separate repo](https://github.com/MattNeill1/Landed-Cost-API))

## Architecture

```
Vercel (static React bundle)
        │  fetch  →  https://<api>.onrender.com/api/...
        ▼
Render (Spring Boot, Docker)
        │
        ▼
   H2 in-memory database
```

Two independently deployed services. The front end is a static bundle on Vercel's CDN; the API is a containerized Spring Boot app on Render. They're joined only by HTTP + JSON, with CORS on the API allowlisting the Vercel origin.

**On the database:** the deployed API uses in-memory H2 rather than persistent Postgres, so data resets whenever the service restarts. That's deliberate — a persisting database wasn't necessary to demonstrate the allocation engine, and this keeps the whole stack free to host. A seed loader populates realistic demo items and shipments on every startup, so the demo is never empty. Local development still runs against Postgres via Docker.

### Component structure

| File | Responsibility |
| --- | --- |
| `src/App.jsx` | Layout, banner, and the lifted `items` state shared by both children |
| `src/ItemForm.jsx` | Item creation form + items table |
| `src/ShipmentForm.jsx` | Shipment creation, shipments table, allocation view, chart |
| `src/api.js` | Single source of truth for the API base URL |

`items` lives in `App.jsx` rather than inside `ItemForm` because `ShipmentForm` also needs it — line items are chosen from a dropdown of existing items. Classic lifting-state-up: shared state belongs at the nearest common ancestor.

## Running locally

### Prerequisites

- Node 18+
- The [Landed Cost API](https://github.com/MattNeill1/Landed-Cost-API) running on `http://localhost:8080`

### Setup

```bash
git clone https://github.com/MattNeill1/landed-cost-dashboard.git
cd landed-cost-dashboard
npm install
npm run dev
```

The dev server starts on `http://localhost:5173`.

### Configuration

The API base URL comes from an environment variable, falling back to localhost:

```js
// src/api.js
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
```

So no `.env` file is needed for local development. To point at a different API, create `.env.local`:

```
VITE_API_URL=https://your-api-host.com
```

Two Vite specifics worth knowing: only variables prefixed `VITE_` are exposed to client code (anything reaching the browser is public, so never put secrets here), and values are substituted at **build time** — changing the variable on a hosting platform requires a redeploy, not just a save.

## Deployment

**Front end (Vercel):** connect the repo, framework preset auto-detects Vite, set `VITE_API_URL` to the API's URL (no trailing slash — the code appends `/api/...`). Pushes to `main` auto-deploy.

**API (Render):** deployed from its Dockerfile as a web service with `SPRING_PROFILES_ACTIVE=prod` and `CORS_ORIGINS` set to this app's production domain. Both values are read from the environment, so no source changes are needed between local and deployed runs.

Note that Vercel preview deployments get unique hostnames that won't match the API's allowlisted origin, so previews will hit CORS errors unless their URL is added to `CORS_ORIGINS`.

## Project status

Built milestone by milestone:

- [x] **M1** — Static items table
- [x] **M2** — Fetch and render live data from the API
- [x] **M3** — Item creation form with inline validation errors
- [x] **M4** — Shipments table with on-demand allocation view
- [x] **M5** — Allocation-method toggle with what-if recomputation
- [x] **M6** — Recharts bar chart, two-column layout, expandable shipment lines
- [x] **Deployed** — Vercel + Render

### Backlog

- Collapsible create forms, collapsed by default
- Search/filter for items and shipments
