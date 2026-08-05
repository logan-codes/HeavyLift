# Smart Rental Tracking System

Caterpillar-dealer rental fleet tracking: live telematics ingestion, role-based
dashboards, alerting, and ML-driven forecasting.

**Status**: Milestones 1 and 2 complete — schema, auth, telemetry ingestion,
check-in/out, all four alert types, the FastAPI AI layer (utilization,
anomaly detection, forecasting, return prediction), the map view + drill-down,
full synthetic data (sites/equipment/customers/operators, 6 months of rental
history, live streaming), and role-differentiated dashboards for all five
personas.

## Stack

- `backend/` — Spring Boot 3 (Java 21), REST API, Flyway migrations, JWT auth,
  scheduled alerting
- `frontend/` — Vite + React + TypeScript, Leaflet map, hand-rolled charts
- `ai-service/` — FastAPI (Python), reads Postgres directly for ML endpoints
- `data-generator/` — Python scripts: master data, 6-month history backfill,
  live telemetry streaming
- PostgreSQL 16 (via Docker Compose)

## Prerequisites

Install these yourself (not managed by this repo):

- **Temurin JDK 21** (LTS) — https://adoptium.net
- **Maven 3.9+** — https://maven.apache.org/download.cgi
- **Node.js 20 LTS** — https://nodejs.org
- **Docker Desktop** — used only to run the Postgres container
- **Python 3.11+** (this environment has 3.14, which works fine)

Verify:

```bash
java -version
mvn -version
node -v
npm -v
docker --version
python --version
```

## 1. Start Postgres

```bash
docker compose up -d
```

Starts `postgres:16` on `localhost:5432`, database `cat_rental`, user
`cat_rental`, password `cat_rental_dev` (dev-only credentials — see
`docker-compose.yml`).

## 2. Run the backend

```bash
cd backend
mvn spring-boot:run
```

Flyway applies migrations automatically (schema, reference data, the added
`usage_history.health` column). API listens on `http://localhost:8080`. A
background job re-evaluates all four alert types every 60s
(`app.alerts.check-interval-ms`).

Seeded accounts (password `Password123!` for all): `admin` (System Admin),
`sitemgr` (Site Manager), `operator` (Rental Operator), `management` (Company
Management), `maintenance` (Maintenance Team).

## 3. Run the AI service

```bash
cd ai-service
python -m venv .venv && .venv\Scripts\activate   # or: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Reads `UsageHistory`/`Rentals` directly from Postgres (simplest option for a
hackathon-scale service per the brief). Protected by a shared-secret header
(`X-AI-Service-Secret`, matching `app.ai-service.shared-secret` in the Java
config) — not user JWTs, since it's an internal service-to-service call. If
this service is down, the Java backend returns `{"available": false, ...}`
instead of failing the request — check `GET /api/ai/*` responses in the
frontend, which render "unavailable" instead of crashing.

## 4. Seed data (master + 6mo history) and stream live telemetry

```bash
cd data-generator
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
python generate.py
```

This runs in two phases:

1. **`seed_history.py`** (direct SQL, not the REST endpoint): seeds 12 sites,
   40 equipment across 5 categories, 10 operators, 12 customers, then ~6
   months of completed rentals per customer with a punctuality profile
   (punctual / mixed / chronic — this is what makes the return-date
   prediction model meaningful) plus backdated `usage_history` readings,
   including a handful of deliberate anomalies (health cliff, GPS jump, fuel
   spike) and alert-demo hooks (one overdue rental, one equipment outside its
   geofence, one with no operator, one below the health threshold, one overdue
   for maintenance). This *has* to be a direct bulk insert — the live
   ingestion endpoint always timestamps `recorded_at` as "now", so it can't
   backfill six months of history.
2. **`stream_live.py`**: streams telemetry for the currently-active rentals
   through the real `POST /api/telemetry` endpoint every 15s, so the
   dashboard/map genuinely update from live ingestion during a demo. Runs
   ~25 minutes by default (`--iterations`, `--interval-seconds` to adjust).

Run `python generate.py --seed-only` to skip live streaming, or
`python generate.py --stream-only` to just stream against already-seeded data.

## 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, log in with any seeded account. Each role lands
on a different dashboard:

| Username | Role | Landing page |
|---|---|---|
| `admin` | System Admin | Fleet-wide overview + manage Sites/Customers/Operators/Users |
| `sitemgr` | Site Manager | Pick a site, see its equipment + overdue alerts (schema has no user→site FK, hence the picker — see below) |
| `operator` | Rental Operator | Check equipment in/out |
| `management` | Company Management | Read-only utilization/alerts/demand rollups |
| `maintenance` | Maintenance Team | Health-sorted equipment, maintenance-due list, health/anomaly alerts |

Every authenticated user can also reach the fleet table (`/equipment`), the
map (`/map`), and per-equipment drill-down (health/fuel trend charts, AI
utilization + anomaly panels, open alerts).

## Flagged deviations from the literal spec

- **`usage_history.health` column** (V3 migration): anomaly detection needs a
  health *time series*, but the originally-specified `usage_history` table
  has no health column (`Equipment.health` is a single current value).
  Telemetry ingestion now accepts an optional `health` reading alongside
  fuel/location, modeling an onboard condition sensor.
- **Status rows are not shared across entity types**: "Active" for Equipment,
  Rentals, Users, and Sites are separate `status_id` rows, grouped via
  `status_groups`. Keeps each entity's `status_id` FK unambiguous without
  joining through `status_groups` to filter valid values.
- **Site Manager scoping**: the schema has no `User.site_id` or
  `Site.manager_id`, so "their site" is a picker in the UI (persisted to
  `localStorage`) rather than identity-scoped. Filtering still goes through
  `Rentals.site_id` as the spec describes.
- **Equipment "category" for forecasting**: the schema has no equipment-type
  column, so the AI forecast service derives it from the first word of
  `Equipment.name` (seeded as `"<Category> <id>"`, e.g. `"Excavator EXC-01"`).
- **Geofence radius**: `app.geofence.radius-km` in `application.yml` (default
  5 km), not a `Site` column — flagged as a future `geofence_radius_km`
  column if there's time.
- **Kafka/Redis**: skipped for v1 per the brief's "optional, if time permits"
  — the ingestion endpoint calls things synchronously. Would be the first
  thing to add for a v2 (e.g. decoupling alert evaluation from the ingestion
  request path).

## Known limitations

- Admin management pages (Sites/Customers/Operators/Users) support list +
  create only, no edit/delete — kept in scope for a working demo rather than
  full CRUD.
- "Cost-loss" reporting for Company Management is approximated from alert/
  rental counts, since the schema has no cost or rate field.
- The AI service connects to Postgres directly rather than through the Java
  backend's data layer — simpler for a hackathon scope per the brief's own
  note that either approach is fine.
