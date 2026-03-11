import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="expense_tracker",
    user="postgres",
    password="Bull@1895",
    port="5432"
)

cur = conn.cursor()
cur.execute("SELECT version();")

print(cur.fetchone())

cur.close()
conn.close()