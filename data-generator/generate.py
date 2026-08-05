"""CLI orchestrator: seed master data + 6-month history, then optionally stream
live telemetry.  The FastAPI server (app/main.py) exposes the same operations
over HTTP; this script is kept for local/manual use.

Usage:
    uv run python generate.py                  # seed everything, then stream live telemetry
    uv run python generate.py --seed-only      # seed master + history, skip live streaming
    uv run python generate.py --stream-only    # skip seeding, just stream (data already seeded)
"""

import argparse

from app.services import seed_history, stream_live

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed-only", action="store_true")
    parser.add_argument("--stream-only", action="store_true")
    parser.add_argument("--iterations", type=int, default=100)
    parser.add_argument("--interval-seconds", type=float, default=15.0)
    args = parser.parse_args()

    if not args.stream_only:
        seed_history.run()

    if not args.seed_only:
        stream_live.stream(args.iterations, args.interval_seconds)
