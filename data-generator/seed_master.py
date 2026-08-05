"""Idempotently seeds master/reference data: sites, equipment, operators, customers.

This is master data (not a live feed), so it's written directly via SQL rather
than through the telemetry ingestion endpoint -- there's no REST endpoint for
creating equipment/sites/customers in bulk, and there shouldn't be one just for
a seed script.
"""

from datetime import date, timedelta

from common import EQUIPMENT_CATEGORIES, EQUIPMENT_PER_CATEGORY, SITE_STATUS_ACTIVE, db_connect

SITES = [
    ("Riverside Quarry", "1200 Quarry Rd, Denver, CO", 39.7392, -104.9903),
    ("Northgate Industrial Park", "88 Northgate Ave, Denver, CO", 39.8250, -104.9720),
    ("Highline Commercial Development", "450 Highline Dr, Aurora, CO", 39.7294, -104.8319),
    ("Cherry Creek Reservoir Project", "1 Reservoir Rd, Aurora, CO", 39.6403, -104.8500),
    ("Westside Rail Yard Expansion", "700 Railway Ln, Golden, CO", 39.7555, -105.2211),
    ("Southlands Retail Build", "6155 S Main St, Aurora, CO", 39.6135, -104.7250),
    ("Boulder Creek Bridge Works", "300 Creekside Dr, Boulder, CO", 40.0150, -105.2705),
    ("Centennial Airfield Extension", "9200 E Dry Creek Rd, Centennial, CO", 39.5807, -104.8472),
    ("Thornton Water Treatment Site", "9500 Civic Center Dr, Thornton, CO", 39.8680, -104.9719),
    ("Lakewood Overpass Project", "1000 Wadsworth Blvd, Lakewood, CO", 39.7047, -105.0814),
    ("Littleton Quarry Extension", "2255 W Berry Ave, Littleton, CO", 39.6133, -105.0166),
    ("Commerce City Logistics Park", "6060 Dahlia St, Commerce City, CO", 39.8083, -104.9339),
]

OPERATOR_NAMES = [
    "Jordan Lee", "Casey Nguyen", "Morgan Alvarez", "Taylor Brooks", "Riley Chen",
    "Avery Patel", "Sam Whitfield", "Jamie O'Connor", "Drew Kowalski", "Reese Thompson",
]

CUSTOMER_NAMES = [
    "Summit Construction Co.", "Bedrock Civil Contractors", "Ironline Infrastructure",
    "Peakstone Builders", "Continental Earthworks", "Vantage Site Development",
    "Granite Ridge Contracting", "Northfork Excavation", "Union Grade Construction",
    "Cornerstone Paving & Grading", "Trailhead General Contractors", "Redline Demolition & Build",
]

FUEL_TYPES = ["Diesel", "Diesel", "Diesel", "Electric", "Hybrid"]


def _get_or_create(cur, select_sql, select_params, insert_sql, insert_params):
    cur.execute(select_sql, select_params)
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(insert_sql, insert_params)
    return cur.fetchone()[0]


def seed_sites(cur):
    site_ids = []
    for name, address, lat, lon in SITES:
        site_id = _get_or_create(
            cur,
            "SELECT site_id FROM site WHERE name = %s", (name,),
            """INSERT INTO site (name, address, latitude, longitude, status_id, is_active)
               VALUES (%s, %s, %s, %s, %s, TRUE) RETURNING site_id""",
            (name, address, lat, lon, SITE_STATUS_ACTIVE),
        )
        site_ids.append(site_id)
    return site_ids


def seed_equipment(cur):
    prefixes = {"Excavator": "EXC", "Bulldozer": "BLD", "Crane": "CRN", "Grader": "GRD", "Loader": "LDR"}
    equipment = []  # list of (equipment_id, category)
    for category in EQUIPMENT_CATEGORIES:
        prefix = prefixes[category]
        for i in range(1, EQUIPMENT_PER_CATEGORY + 1):
            name = f"{category} {prefix}-{i:02d}"
            fuel_type = FUEL_TYPES[i % len(FUEL_TYPES)]
            equipment_id = _get_or_create(
                cur,
                "SELECT equipment_id FROM equipment WHERE name = %s", (name,),
                """INSERT INTO equipment (name, health, fuel_type, status_id, last_maintenance_on,
                                           latitude, longitude, is_active)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE) RETURNING equipment_id""",
                (name, 95.0, fuel_type, 2, date.today() - timedelta(days=20), None, None),
            )
            equipment.append((equipment_id, category))
    return equipment


def seed_operators(cur):
    operator_ids = []
    for i, name in enumerate(OPERATOR_NAMES):
        operator_id = _get_or_create(
            cur,
            "SELECT operator_id FROM operator WHERE operator_name = %s", (name,),
            """INSERT INTO operator (operator_name, phone, license_number, license_validity, is_active)
               VALUES (%s, %s, %s, %s, TRUE) RETURNING operator_id""",
            (name, f"555-02{i:02d}", f"CO-OP-{88000 + i}", date.today() + timedelta(days=365 * 2)),
        )
        operator_ids.append(operator_id)
    return operator_ids


def seed_customers(cur):
    customer_ids = []
    for i, name in enumerate(CUSTOMER_NAMES):
        customer_id = _get_or_create(
            cur,
            "SELECT customer_id FROM customer WHERE name = %s", (name,),
            """INSERT INTO customer (name, contact_person, phone, email, address, is_active)
               VALUES (%s, %s, %s, %s, %s, TRUE) RETURNING customer_id""",
            (name, f"Contact {i + 1}", f"555-03{i:02d}", f"contact{i + 1}@{name.split()[0].lower()}.test",
             f"{100 + i} Builder Ave, Denver, CO"),
        )
        customer_ids.append(customer_id)
    return customer_ids


def run():
    conn = db_connect()
    try:
        with conn.cursor() as cur:
            site_ids = seed_sites(cur)
            equipment = seed_equipment(cur)
            operator_ids = seed_operators(cur)
            customer_ids = seed_customers(cur)
        conn.commit()
    finally:
        conn.close()

    print(f"Seeded {len(site_ids)} sites, {len(equipment)} equipment, "
          f"{len(operator_ids)} operators, {len(customer_ids)} customers.")
    return {"site_ids": site_ids, "equipment": equipment, "operator_ids": operator_ids, "customer_ids": customer_ids}


if __name__ == "__main__":
    run()
