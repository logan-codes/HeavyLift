"""Generates ~6 months of Rentals history plus backdated UsageHistory readings.

This has to be a direct bulk insert, not the live ingestion endpoint: the
endpoint always timestamps recorded_at as "now", so it physically cannot
backfill six months of past readings. (Real telemetry never reports a past
timestamp either.) The live endpoint is instead used by stream_live.py for the
handful of currently-active rentals, continuing forward from where this script
leaves off, so the demo still shows genuine live ingestion end to end.

Deliberately injects a few anomalies (health cliff, location jump, fuel spike)
and a few "hooks" on the current-active rentals (one overdue, one outside the
geofence, one missing an operator, one equipment below the health threshold,
one overdue for maintenance) so the alerting/anomaly-detection demo has
reliable, not-purely-random things to show.
"""

import random
from datetime import date, datetime, time, timedelta

from app.services.common import (
    EQUIPMENT_STATUS_ACTIVE, RENTAL_STATUS_ACTIVE, RENTAL_STATUS_COMPLETED,
    customer_profile, db_connect,
)
from app.services.seed_master import run as seed_master_run

random.seed(42)  # reproducible demo data

HISTORY_WINDOW_DAYS = 180
READING_INTERVAL_HOURS = 12
SITE_JITTER_DEG = 0.02  # ~1-2 km, well inside the 5 km geofence
ANOMALY_LOCATION_JUMP_DEG = 0.2  # ~20 km, outside the 5 km geofence
ANOMALIES_TO_INJECT = 4


def _site_coords(cur, site_id):
    cur.execute("SELECT latitude, longitude FROM site WHERE site_id = %s", (site_id,))
    return cur.fetchone()


def _overlaps(a_start, a_end, b_start, b_end):
    return a_start <= b_end and b_start <= a_end


def _pick_equipment(equipment, busy, start, end, category=None):
    candidates = [e for e in equipment if category is None or e[1] == category]
    random.shuffle(candidates)
    for equipment_id, cat in candidates:
        intervals = busy.get(equipment_id, [])
        if not any(_overlaps(start, end, s, e) for s, e in intervals):
            return equipment_id, cat
    return None, None


def _completion_offset(profile):
    roll = random.random()
    if profile == "punctual":
        return -random.randint(0, 2)
    if profile == "mixed":
        return -random.randint(0, 3) if roll < 0.6 else random.randint(1, 6)
    # chronic
    return -random.randint(0, 2) if roll < 0.3 else random.randint(3, 12)


def _generate_readings(rental, equipment_health, anomaly_slots, operator_ids):
    """Yields usage_history row tuples for one rental's duration."""
    equipment_id = rental["equipment_id"]
    site_lat, site_lon = rental["site_lat"], rental["site_lon"]
    operator_id = random.choice(operator_ids)

    current = rental["start_dt"]
    end = rental["end_dt"]
    fuel = round(random.uniform(85, 100), 2)
    health = equipment_health.get(equipment_id, round(random.uniform(90, 100), 2))
    lat_jitter = SITE_JITTER_DEG
    idx = 0

    while current <= end:
        is_anomaly = (equipment_id, current.date()) in anomaly_slots
        anomaly_kind = anomaly_slots.get((equipment_id, current.date()))

        status_id = EQUIPMENT_STATUS_ACTIVE if random.random() < 0.8 else 2  # mostly Active, some Idle
        lat = site_lat + random.uniform(-lat_jitter, lat_jitter)
        lon = site_lon + random.uniform(-lat_jitter, lat_jitter)

        if status_id == EQUIPMENT_STATUS_ACTIVE:
            fuel = max(8.0, fuel - random.uniform(1.5, 5.0))
            health = max(15.0, health - random.uniform(0.03, 0.12))
        if fuel < 20 and random.random() < 0.5:
            fuel = round(random.uniform(90, 100), 2)  # refuel stop

        if is_anomaly and anomaly_kind == "health_drop":
            health = max(10.0, health - random.uniform(15, 25))
        elif is_anomaly and anomaly_kind == "location_jump":
            lat = site_lat + random.uniform(ANOMALY_LOCATION_JUMP_DEG, ANOMALY_LOCATION_JUMP_DEG * 1.5)
            lon = site_lon + random.uniform(ANOMALY_LOCATION_JUMP_DEG, ANOMALY_LOCATION_JUMP_DEG * 1.5)
        elif is_anomaly and anomaly_kind == "fuel_spike":
            fuel = min(100.0, max(0.0, fuel + random.choice([-1, 1]) * random.uniform(35, 50)))

        yield (equipment_id, current, round(lat, 7), round(lon, 7), operator_id,
               status_id, round(fuel, 2), round(health, 2))

        equipment_health[equipment_id] = health
        current += timedelta(hours=READING_INTERVAL_HOURS)
        idx += 1

    rental["final_fuel"] = fuel
    rental["final_health"] = health
    rental["final_lat"] = site_lat + random.uniform(-lat_jitter, lat_jitter)
    rental["final_lon"] = site_lon + random.uniform(-lat_jitter, lat_jitter)
    rental["operator_id"] = operator_id


def run():
    master = seed_master_run()
    equipment = master["equipment"]  # list of (equipment_id, category)
    site_ids = master["site_ids"]
    operator_ids = master["operator_ids"]
    customer_ids = master["customer_ids"]

    conn = db_connect()
    try:
        with conn.cursor() as cur:
            site_coords = {sid: _site_coords(cur, sid) for sid in site_ids}

        today = date.today()
        window_start = today - timedelta(days=HISTORY_WINDOW_DAYS)

        equipment_busy = {}  # equipment_id -> [(start_date, end_date), ...]
        planned_rentals = []  # historical, completed

        for idx, customer_id in enumerate(customer_ids):
            profile = customer_profile(idx)
            num_rentals = random.randint(2, 4)
            for _ in range(num_rentals):
                latest_start = today - timedelta(days=35)
                span = (latest_start - window_start).days
                if span <= 0:
                    continue
                start = window_start + timedelta(days=random.randint(0, span))
                rental_days = random.randint(20, 90)
                due = start + timedelta(days=rental_days)

                site_id = random.choice(site_ids)
                equipment_id, category = _pick_equipment(equipment, equipment_busy, start, due)
                if equipment_id is None:
                    continue

                offset_days = _completion_offset(profile)
                completion = due + timedelta(days=offset_days)
                if completion < start:
                    completion = start

                equipment_busy.setdefault(equipment_id, []).append((start, completion))
                site_lat, site_lon = site_coords[site_id]

                planned_rentals.append({
                    "customer_id": customer_id, "site_id": site_id, "equipment_id": equipment_id,
                    "start": start, "due": due, "completion": completion,
                    "start_dt": datetime.combine(start, time(8, 0)),
                    "end_dt": datetime.combine(completion, time(18, 0)),
                    "site_lat": float(site_lat), "site_lon": float(site_lon),
                    "rental_days": rental_days, "active": False,
                })

        planned_rentals.sort(key=lambda r: r["start"])

        # A handful of deliberate anomalies scattered across historical rentals.
        anomaly_slots = {}
        anomaly_kinds = ["health_drop", "location_jump", "fuel_spike", "health_drop"]
        eligible = [r for r in planned_rentals if (r["completion"] - r["start"]).days > 10]
        for i, rental in enumerate(random.sample(eligible, min(ANOMALIES_TO_INJECT, len(eligible)))):
            mid = rental["start"] + (rental["completion"] - rental["start"]) / 2
            anomaly_slots[(rental["equipment_id"], mid)] = anomaly_kinds[i % len(anomaly_kinds)]

        # ---- Currently-active rentals (for the live dashboard/map/alert demo) ----
        busy_equipment_ids = set(equipment_busy.keys())
        available_now = [e for e in equipment if e[0] not in busy_equipment_ids
                          or not any(_overlaps(today - timedelta(days=30), today + timedelta(days=60), s, e2)
                                     for s, e2 in equipment_busy.get(e[0], []))]
        random.shuffle(available_now)
        active_rentals = []
        num_active = min(8, len(available_now))
        for i in range(num_active):
            equipment_id, category = available_now[i]
            customer_id = customer_ids[i % len(customer_ids)]
            site_id = random.choice(site_ids)
            start = today - timedelta(days=random.randint(10, 45))
            rental_days = random.randint(20, 60)
            due = start + timedelta(days=rental_days)
            if i < 2:
                due = today - timedelta(days=random.randint(1, 4))  # deliberately overdue
            site_lat, site_lon = site_coords[site_id]
            active_rentals.append({
                "customer_id": customer_id, "site_id": site_id, "equipment_id": equipment_id,
                "start": start, "due": due, "completion": today - timedelta(days=1),
                "start_dt": datetime.combine(start, time(8, 0)),
                "end_dt": datetime.combine(today - timedelta(days=1), time(18, 0)),
                "site_lat": float(site_lat), "site_lon": float(site_lon),
                "rental_days": rental_days, "active": True,
            })

        equipment_health = {}
        history_rows = []
        for rental in planned_rentals + active_rentals:
            for row in _generate_readings(rental, equipment_health, anomaly_slots, operator_ids):
                history_rows.append(row)

        with conn.cursor() as cur:
            for rental in planned_rentals:
                cur.execute(
                    """INSERT INTO rentals (customer_id, site_id, equipment_id, due_on, rent_status,
                                              status_id, rental_days, is_active, created_on, edited_on)
                       VALUES (%s, %s, %s, %s, 'Completed', %s, %s, FALSE, %s, %s)""",
                    (rental["customer_id"], rental["site_id"], rental["equipment_id"], rental["due"],
                     RENTAL_STATUS_COMPLETED, rental["rental_days"], rental["start_dt"], rental["end_dt"]),
                )
                cur.execute(
                    "UPDATE equipment SET health = %s, edited_on = now() WHERE equipment_id = %s",
                    (rental.get("final_health", 90.0), rental["equipment_id"]),
                )

            for rental in active_rentals:
                cur.execute(
                    """INSERT INTO rentals (customer_id, site_id, equipment_id, due_on, rent_status,
                                              status_id, rental_days, is_active, created_on, edited_on)
                       VALUES (%s, %s, %s, %s, 'Active', %s, %s, TRUE, %s, %s)""",
                    (rental["customer_id"], rental["site_id"], rental["equipment_id"], rental["due"],
                     RENTAL_STATUS_ACTIVE, rental["rental_days"], rental["start_dt"], rental["start_dt"]),
                )
                cur.execute(
                    "UPDATE equipment SET status_id = %s, health = %s, latitude = %s, longitude = %s, edited_on = now() "
                    "WHERE equipment_id = %s",
                    (EQUIPMENT_STATUS_ACTIVE, rental.get("final_health", 90.0),
                     rental.get("final_lat"), rental.get("final_lon"), rental["equipment_id"]),
                )
                cur.execute(
                    """INSERT INTO usage_realtime (equipment_id, latitude, longitude, operator_id, status_id, fuel_gauge)
                       VALUES (%s, %s, %s, %s, %s, %s)
                       ON CONFLICT (equipment_id) DO UPDATE SET
                         latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
                         operator_id = EXCLUDED.operator_id, status_id = EXCLUDED.status_id,
                         fuel_gauge = EXCLUDED.fuel_gauge""",
                    (rental["equipment_id"], rental.get("final_lat"), rental.get("final_lon"),
                     rental.get("operator_id"), EQUIPMENT_STATUS_ACTIVE, rental.get("final_fuel", 60.0)),
                )

            cur.executemany(
                """INSERT INTO usage_history (equipment_id, recorded_at, latitude, longitude, operator_id,
                                                status_id, fuel_gauge, health)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                history_rows,
            )

            # Demo hooks: guarantee at least one of each alert condition regardless of randomness.
            if len(active_rentals) >= 4:
                geofence_eq = active_rentals[2]["equipment_id"]
                site_lat, site_lon = active_rentals[2]["site_lat"], active_rentals[2]["site_lon"]
                cur.execute(
                    "UPDATE usage_realtime SET latitude = %s, longitude = %s WHERE equipment_id = %s",
                    (site_lat + ANOMALY_LOCATION_JUMP_DEG, site_lon + ANOMALY_LOCATION_JUMP_DEG, geofence_eq),
                )

                no_operator_eq = active_rentals[3]["equipment_id"]
                cur.execute(
                    "UPDATE usage_realtime SET operator_id = NULL WHERE equipment_id = %s", (no_operator_eq,),
                )

            if len(active_rentals) >= 6:
                low_health_eq = active_rentals[4]["equipment_id"]
                cur.execute("UPDATE equipment SET health = 32.0 WHERE equipment_id = %s", (low_health_eq,))

                overdue_maintenance_eq = active_rentals[5]["equipment_id"]
                cur.execute(
                    "UPDATE equipment SET last_maintenance_on = %s WHERE equipment_id = %s",
                    (today - timedelta(days=150), overdue_maintenance_eq),
                )

        conn.commit()
    finally:
        conn.close()

    print(f"Seeded {len(planned_rentals)} completed historical rentals, "
          f"{len(active_rentals)} currently-active rentals, {len(history_rows)} usage_history rows.")
    return {"active_rentals": active_rentals, "planned_rentals": planned_rentals, "equipment": equipment}


if __name__ == "__main__":
    run()
