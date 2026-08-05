#!/bin/sh
# Orchestrate the data-generator stages in the correct order.
# The backend must be healthy (and Flyway migrations must have run) before
# seeding begins.  Docker Compose's depends_on/healthcheck handles that wait;
# this script just runs the three steps sequentially.

set -e

echo "==> Seeding master reference data…"
python seed_master.py

echo "==> Seeding historical rental records…"
python seed_history.py

echo "==> Starting live telemetry stream (foreground)…"
exec python stream_live.py
