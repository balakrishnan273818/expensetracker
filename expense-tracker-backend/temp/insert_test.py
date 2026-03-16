import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="expense_tracker",
    user="postgres",
    password="Bull@1895",
    port="5432"
)

cur = conn.cursor()

cur.execute("""
INSERT INTO transactions
(date, amount, main_category, sub_category, payment_method, account, description, source)
VALUES
('2026-03-07', 120, 'Living', 'Food', 'PhonePe', 'IDFCExpense', 'Test entry', 'manual');
""")

conn.commit()

cur.close()
conn.close()

print("Transaction inserted")