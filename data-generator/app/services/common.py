"""Shared config/constants/DB helper for the data-generator scripts."""

import os

import psycopg

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "cat_rental")
DB_USER = os.environ.get("DB_USER", "cat_rental")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "cat_rental_dev")

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8080")
DEVICE_API_KEY = os.environ.get("DEVICE_API_KEY", "dev-only-device-key")

# Status ids from backend/src/main/resources/db/migration/V2__seed_reference_data.sql
EQUIPMENT_STATUS_ACTIVE = 1
EQUIPMENT_STATUS_IDLE = 2
EQUIPMENT_STATUS_IN_MAINTENANCE = 3
EQUIPMENT_STATUS_OVERDUE = 4

RENTAL_STATUS_ACTIVE = 5
RENTAL_STATUS_COMPLETED = 6
RENTAL_STATUS_OVERDUE = 7
RENTAL_STATUS_EXTENDED = 8

SITE_STATUS_ACTIVE = 14

# Equipment categories -- the AI forecast service derives "category" from the
# first word of equipment.name (there's no dedicated type column in the schema).
EQUIPMENT_CATEGORIES = ["Excavator", "Bulldozer", "Crane", "Grader", "Loader"]
EQUIPMENT_PER_CATEGORY = 8  # 5 categories x 8 = 40 equipment, within the 30-50 spec range

# Deterministic customer punctuality profiles (round-robin across seeded customers).
# "punctual" always returns on/before due_on, "mixed" sometimes runs late,
# "chronic" is usually late -- this variation is what makes return-date prediction
# meaningful.
CUSTOMER_PROFILES = ["punctual", "mixed", "chronic", "mixed", "punctual", "chronic",
                      "mixed", "punctual", "chronic", "mixed", "punctual", "mixed"]


def db_connect():
    return psycopg.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )


def customer_profile(index: int) -> str:
    return CUSTOMER_PROFILES[index % len(CUSTOMER_PROFILES)]
