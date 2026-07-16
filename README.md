# Flixtape

A full-stack Netflix-style streaming app — profiles, watch history, per-episode ratings, personalized recommendations, Stripe billing, and an admin content-management dashboard.

Built as a learning/portfolio project. Not affiliated with Netflix.

## Tech Stack

**Backend:** FastAPI · PostgreSQL · SQLAlchemy · Alembic · JWT auth (python-jose) · Stripe · Resend (email) · pytest

**Frontend:** React 19 · Vite · Tailwind CSS v4 · React Router · Axios · Recharts (admin analytics) · react-player

## Features

- Email/password auth with JWT, per-user profiles (up to 5, with kids-mode content filtering)
- Browse: trending/featured rows, genre rows, personalized recommendations, debounced search, continue-watching with resume
- Movies and full TV series (seasons/episodes) with per-episode ratings and aggregated season/series averages
- My List, watch history, notifications when a followed series gets a new episode
- Stripe subscription checkout, customer billing portal, and webhook-driven plan updates
- Admin dashboard: manage movies, genres, cast members, and view analytics (most-watched, top-rated, signups, active subscriptions)
- Account settings: change password, manage billing, delete account (cascades across profiles/history/ratings)

## Project Structure

```
flixtape/
├── client/          # React + Vite frontend
└── server/          # FastAPI backend
    ├── app/
    │   ├── routers/     # API endpoints
    │   ├── models.py    # SQLAlchemy models
    │   └── main.py      # App entrypoint
    └── alembic/         # Database migrations
```

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL running locally

### Backend

```bash
cd server
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Create `server/.env`:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/flixtape
JWT_SECRET=your-random-secret-string
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_STANDARD=price_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
FRONTEND_URL=http://localhost:5173
```

Run migrations and start the API:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`.

### Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Deploying for Free

This stack splits cleanly across three free-tier services: **Vercel** (frontend), **Render** (backend API), and **Neon** (Postgres). This combo avoids the two biggest free-tier pitfalls — Vercel's static hosting never expires or sleeps, and Neon's free Postgres tier doesn't expire (unlike Render's own free Postgres, which is deleted after ~30 days).

> **Heads up:** Render's free web service tier spins down after 15 minutes of inactivity and takes about a minute to wake back up on the next request. Fine for a demo/portfolio project; not something to rely on for real traffic.

### 1. Database — Neon (free, permanent)

1. Sign up at [neon.tech](https://neon.tech) and create a project.
2. Copy the connection string it gives you (starts with `postgresql://...`).

### 2. Backend — Render (free)

1. Sign up at [render.com](https://render.com) and connect your GitHub repo.
2. Create a new **Web Service**, pointing at the `server/` directory.
3. Set:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (same names as your local `.env`, but:
   - `DATABASE_URL` = your Neon connection string
   - `FRONTEND_URL` = your Vercel URL (add this after step 3, then redeploy)
   - Use your **live** Stripe keys if you want real payments, or keep test keys for a demo
5. After the first deploy, run migrations against the Neon database — either via a Render **Shell** (`alembic upgrade head`) or by running it locally with `DATABASE_URL` pointed at Neon.

### 3. Frontend — Vercel (free, no expiry)

1. Sign up at [vercel.com](https://vercel.com) and import your repo.
2. Set the **Root Directory** to `client`.
3. Framework preset: Vite. Build command `npm run build`, output directory `dist` (Vercel usually detects this automatically).
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://flixtape-api.onrender.com`)
5. Deploy. Then go back to Render and set `FRONTEND_URL` to this Vercel URL, and redeploy the backend so CORS allows it.

### 4. Stripe webhook (if using billing)

Point your Stripe webhook endpoint at `https://your-render-url.onrender.com/billing/webhook` and copy the signing secret into `STRIPE_WEBHOOK_SECRET` on Render.

## Notes

- Seed scripts (`seed_movies.py`, `seed_specific_series.py`) pull sample content from TMDB and are intentionally excluded from version control.
- Pytest suite runs against a separate test database (`TEST_DATABASE_URL`) with transaction-rollback isolation.