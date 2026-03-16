from db import DB_POOL

def learn_merchant_rule(txn_id):

    conn = DB_POOL.getconn()

    try:

        cur = conn.cursor()

        cur.execute("""
            SELECT merchant, category, sub_category
            FROM transactions
            WHERE id = %s
        """, (txn_id,))

        row = cur.fetchone()

        if row is None:
            return

        merchant, category, sub_category = row

        cur.execute("""
            INSERT INTO merchant_rules (merchant, category, sub_category)
            VALUES (%s,%s,%s)
            ON CONFLICT DO NOTHING
        """, (merchant, category, sub_category))

        conn.commit()

        cur.close()

    finally:
        DB_POOL.putconn(conn)

def fetch_transactions():

    conn = DB_POOL.getconn()

    try:

        cur = conn.cursor()

        cur.execute("""
            SELECT
                id,
                date,
                amount,
                category,
                sub_category,
                mode,
                bank,
                description
            FROM transactions
            ORDER BY date DESC
            LIMIT 500
        """)

        rows = cur.fetchall()

        cur.close()

        return rows

    finally:
        DB_POOL.putconn(conn)

def update_transaction_category(txn_id, category, sub_category):

    conn = DB_POOL.getconn()

    try:

        cur = conn.cursor()

        cur.execute("""
            UPDATE transactions
            SET category = %s,
                sub_category = %s
            WHERE id = %s
        """, (category, sub_category, txn_id))

        conn.commit()

        cur.close()

    finally:
        DB_POOL.putconn(conn)

    # learning step
    learn_merchant_rule(txn_id)

def bulk_update_transactions(updates):

    conn = DB_POOL.getconn()

    try:

        cur = conn.cursor()

        for item in updates:

            cur.execute("""
                UPDATE transactions
                SET category = %s,
                    sub_category = %s
                WHERE id = %s
            """, (
                item["category"],
                item["sub_category"],
                item["id"]
            ))

        conn.commit()

        cur.close()

    except Exception:
        conn.rollback()
        raise

    finally:
        DB_POOL.putconn(conn)


def insert_transaction(record):

    conn = DB_POOL.getconn()

    try:

        cur = conn.cursor()

        cur.execute("""
            INSERT INTO transactions
            (date, amount, description, bank, mode, merchant, category, sub_category)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT DO NOTHING
        """, record)

        conn.commit()

        cur.close()

    except Exception:
        conn.rollback()
        raise

    finally:
        DB_POOL.putconn(conn)

def update_transaction_remarks(txn_id, remarks):

    conn = DB_POOL.getconn()

    try:

        cur = conn.cursor()

        cur.execute("""
            UPDATE transactions
            SET remarks = %s
            WHERE id = %s
        """, (remarks, txn_id))

        conn.commit()

        cur.close()

    except Exception:
        conn.rollback()
        raise

    finally:
        DB_POOL.putconn(conn)