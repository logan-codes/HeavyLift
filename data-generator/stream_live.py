"""Streams telemetry for the currently-active rentals through the real
POST /api/telemetry ingestion endpoint, continuing forward from wherever
seed_history.py left off. This is what makes the live dashboard/map actually
move during a demo, and it's the one part of the dataset that legitimately
has to go through the REST endpoint rather than direct SQL (see seed_history.py
for why the historical backfill can't).

Usage:
    python stream_live.py [--iterations N] [--interval-seconds S]
"""

import argparse
import random
import time

import requests

from common import API_BASE_URL, DEVICE_API_KEY, EQUIPMENT_STATUS_ACTIVE, EQUIPMENT_STATUS_IDLE, db_connect

# Small jitter over a realistic interval keeps the implied speed between
# readings well under the AI service's location-jump threshold (80 km/h).
JITTER_DEG = 0.0006  # ~60 m


def fetch_active_equipment():
    conn = db_connect()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.equipment_id, ur.latitude, ur.longitude, ur.operator_id, ur.fuel_gauge, e.health
                FROM rentals r
                JOIN equipment e ON e.equipment_id = r.equipment_id
                LEFT JOIN usage_realtime ur ON ur.equipment_id = r.equipment_id
                WHERE r.is_active = TRUE
                """
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    equipment = []
    for equipment_id, lat, lon, operator_id, fuel_gauge, health in rows:
        equipment.append({
            "equipment_id": equipment_id,
            "lat": float(lat) if lat is not None else 39.7392,
            "lon": float(lon) if lon is not None else -104.9903,
            "operator_id": operator_id,
            "fuel": float(fuel_gauge) if fuel_gauge is not None else 80.0,
            "health": float(health) if health is not None else 90.0,
        })
    return equipment


def stream(iterations: int, interval_seconds: float):
    equipment = fetch_active_equipment()
    if not equipment:
        print("No currently-active rentals found. Run seed_history.py first.")
        return

    print(f"Streaming live telemetry for {len(equipment)} active-rental equipment "
          f"({iterations} iterations, {interval_seconds}s apart)...")

    session = requests.Session()
    headers = {"X-Device-Key": DEVICE_API_KEY, "Content-Type": "application/json"}

    for i in range(iterations):
        for e in equipment:
            e["lat"] += random.uniform(-JITTER_DEG, JITTER_DEG)
            e["lon"] += random.uniform(-JITTER_DEG, JITTER_DEG)
            status_id = EQUIPMENT_STATUS_IDLE if random.random() < 0.15 else EQUIPMENT_STATUS_ACTIVE
            if status_id == EQUIPMENT_STATUS_ACTIVE:
                e["fuel"] = max(5.0, e["fuel"] - random.uniform(0.3, 1.2))
                e["health"] = max(10.0, e["health"] - random.uniform(0.01, 0.05))
            if e["fuel"] < 15 and random.random() < 0.3:
                e["fuel"] = round(random.uniform(90, 100), 2)

            payload = {
                "equipmentId": e["equipment_id"],
                "latitude": round(e["lat"], 7),
                "longitude": round(e["lon"], 7),
                "operatorId": e["operator_id"],
                "statusId": status_id,
                "fuelGauge": round(e["fuel"], 2),
                "health": round(e["health"], 2),
            }
            try:
                resp = session.post(f"{API_BASE_URL}/api/telemetry", json=payload, headers=headers, timeout=5)
                if resp.status_code >= 300:
                    print(f"  equipment {e['equipment_id']}: HTTP {resp.status_code} {resp.text[:120]}")
            except requests.exceptions.ConnectionError:
                print("Could not reach the backend at", API_BASE_URL, "- is it running?")
                return

        print(f"[{i + 1}/{iterations}] posted telemetry for {len(equipment)} equipment")
        time.sleep(interval_seconds)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--iterations", type=int, default=100)
    parser.add_argument("--interval-seconds", type=float, default=15.0)
    args = parser.parse_args()
    stream(args.iterations, args.interval_seconds)
