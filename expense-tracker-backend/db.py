import psycopg2
from psycopg2.pool import SimpleConnectionPool


DB_POOL = SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    dbname="expense_tracker",
    user="postgres",
    password="Bull@1895",
    host="localhost",
    port=5432
)
