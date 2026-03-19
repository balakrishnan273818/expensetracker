from db import DB_POOL


# ---------------------------------------------------------
# Get budgets for a given month
# ---------------------------------------------------------
def get_budgets_by_month(month):

    conn = DB_POOL.getconn()
    cur = conn.cursor()

    cur.execute("""
        SELECT category, budget_amount, monthly_income
        FROM category_budgets
        WHERE month = %s
    """, (month,))

    rows = cur.fetchall()

    cur.close()
    DB_POOL.putconn(conn)

    return rows


# ---------------------------------------------------------
# Upsert budgets (bulk)
# ---------------------------------------------------------
def upsert_budgets(month, budgets, monthly_income):

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        for b in budgets:

            cur.execute("""
                INSERT INTO category_budgets
                (month, category, budget_amount, monthly_income)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (month, category)
                DO UPDATE SET
                    budget_amount = EXCLUDED.budget_amount,
                    monthly_income = EXCLUDED.monthly_income,
                    updated_at = NOW()
            """, (
                month,
                b.get("category"),
                b.get("budget_amount", 0),
                monthly_income
            ))

        conn.commit()
        cur.close()

    finally:
        DB_POOL.putconn(conn)