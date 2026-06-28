import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from urllib.parse import urlparse

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Cloud deployment: parse the URL (Neon/Render/Railway etc.)
    # psycopg2 needs sslmode=require for Neon
    result = urlparse(DATABASE_URL)
    DB_POOL = SimpleConnectionPool(
        minconn=1,
        maxconn=10,
        dbname=result.path[1:],
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port or 5432,
        sslmode="require"
    )
else:
    # Local development fallback
    DB_POOL = SimpleConnectionPool(
        minconn=1,
        maxconn=10,
        dbname=os.environ.get("DB_NAME", "expense_tracker"),
        user=os.environ.get("DB_USER", "postgres"),
        password=os.environ.get("DB_PASSWORD", ""),
        host=os.environ.get("DB_HOST", "localhost"),
        port=int(os.environ.get("DB_PORT", 5432))
    )
