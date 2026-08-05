"""Orchestrates the full synthetic dataset: master data, ~6 months of rental
history with backdated usage_history, then live telemetry streaming for the
currently-active rentals.

Usage:
    python generate.py                  # seed everything, then stream live telemetry
    python generate.py --seed-only      # seed master + history, skip live streaming
    python generate.py --stream-only    # skip seeding, just stream (data already seeded)
"""

import argparse

import seed_history
import stream_live

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
