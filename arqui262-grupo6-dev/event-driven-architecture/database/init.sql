-- One physical Postgres for the demo; logical ownership is by table prefix.
-- In production each service would own a separate datastore.
-- Runs only on a fresh volume (docker-entrypoint-initdb.d). Use `docker compose down -v` to re-run.

-- ===== booking-service (owner of bookings + outbox_events) =====
CREATE TABLE bookings (
  id           TEXT PRIMARY KEY,
  customer_id  TEXT NOT NULL,
  amount       DOUBLE PRECISION NOT NULL,
  currency     TEXT NOT NULL,
  status       TEXT NOT NULL,            -- PENDING | CONFIRMED
  created_at   TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ NULL
);

CREATE TABLE outbox_events (
  id             UUID PRIMARY KEY,       -- = event id (CloudEvents `id`)
  event_type     TEXT NOT NULL,
  aggregate_id   TEXT NOT NULL,
  payload        JSONB NOT NULL,         -- the full envelope, published as-is by the relay
  correlation_id TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL,
  published_at   TIMESTAMPTZ NULL,
  attempts       INT NOT NULL DEFAULT 0
);
CREATE INDEX outbox_unpublished_idx ON outbox_events (created_at) WHERE published_at IS NULL;

-- ===== crm-service =====
CREATE TABLE crm_processed_events (
  event_id     UUID PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE crm_bookings (
  booking_id    TEXT PRIMARY KEY,        -- UNIQUE: one CRM record per booking
  customer_id   TEXT NOT NULL,
  last_event_id UUID NOT NULL,
  confirmed_at  TIMESTAMPTZ NOT NULL,
  times_applied INT NOT NULL DEFAULT 1   -- stays 1 when idempotency works
);

-- ===== notification-service =====
CREATE TABLE notification_processed_events (
  event_id     UUID PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE notifications (
  id         BIGSERIAL PRIMARY KEY,
  event_id   UUID NOT NULL,
  booking_id TEXT NOT NULL,
  message    TEXT NOT NULL,              -- simulated: nothing is really sent
  created_at TIMESTAMPTZ NOT NULL
);

-- ===== analytics-service =====
CREATE TABLE analytics_processed_events (
  event_id     UUID PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE analytics_facts (
  id         BIGSERIAL PRIMARY KEY,
  event_id   UUID NOT NULL,
  booking_id TEXT NOT NULL,
  amount     DOUBLE PRECISION NOT NULL,
  currency   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

-- ===== per-service timelines (feed demo_05_trace.py; stand-in for a log backend) =====
DO $$
DECLARE svc TEXT;
BEGIN
  FOREACH svc IN ARRAY ARRAY['booking', 'relay', 'crm', 'notification', 'analytics'] LOOP
    EXECUTE format($f$
      CREATE TABLE %I (
        id             BIGSERIAL PRIMARY KEY,
        at             TIMESTAMPTZ NOT NULL,
        service        TEXT NOT NULL,
        action         TEXT NOT NULL,
        event_id       TEXT,
        correlation_id TEXT,
        booking_id     TEXT,
        attempt        INT,
        detail         TEXT
      )$f$, svc || '_timeline');
  END LOOP;
END $$;
