from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row

from app.config import settings


def _conninfo() -> str:
    return (
        f"host={settings.db_host} port={settings.db_port} "
        f"dbname={settings.db_name} user={settings.db_user} password={settings.db_password}"
    )


@contextmanager
def get_connection():
    conn = psycopg.connect(_conninfo(), row_factory=dict_row)
    try:
        yield conn
    finally:
        conn.close()
