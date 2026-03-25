from db import DB_POOL

def learn_merchant_rule(txn_id):

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT merchant, type, category, sub_category, amount
            FROM transactions
            WHERE id = %s
        """, (txn_id,))

        row = cur.fetchone()

        if row is None:
            return

        merchant, tx_type, category, sub_category, amount = row

        merchant_key = merchant.upper().strip()

        cur.execute("""
            INSERT INTO merchant_rules
            (merchant, type, category, sub_category, sample_amount)
            VALUES (%s,%s,%s,%s,%s)
            ON CONFLICT (merchant)
            DO UPDATE SET
                type = EXCLUDED.type,
                category = EXCLUDED.category,
                sub_category = EXCLUDED.sub_category
        """, (
            merchant_key,
            tx_type,
            category,
            sub_category,
            amount
        ))
        print("RULE UPDATED:", merchant_key, tx_type, category, sub_category)
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
                description,
                remarks
            FROM transactions
            ORDER BY date DESC
            LIMIT 500
        """)

        rows = cur.fetchall()

        cur.close()

        return rows

    finally:
        DB_POOL.putconn(conn)

def update_transaction_category(txn_id, category, sub_category, txn_type):

    conn = DB_POOL.getconn()

    try:

        cur = conn.cursor()

        cur.execute("""
            UPDATE transactions
            SET category = %s,
                sub_category = %s,
                type = %s
            WHERE id = %s
        """, (category, sub_category,txn_type, txn_id))

        conn.commit()

        cur.close()

    finally:
        DB_POOL.putconn(conn)

    # learning step
    learn_merchant_rule(txn_id)

def bulk_update_transactions(ids, updates):

    if not ids:
        return 0

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        set_clauses = []
        values = []

        # Build dynamic SET clause
        if "category" in updates:
            set_clauses.append("category = %s")
            values.append(updates["category"])

        if "sub_category" in updates:
            set_clauses.append("sub_category = %s")
            values.append(updates["sub_category"])

        if "type" in updates:
            set_clauses.append("type = %s")
            values.append(updates["type"])

        if not set_clauses:
            return 0

        set_query = ", ".join(set_clauses)

        # PostgreSQL syntax (you are using psycopg2)
        query = f"""
            UPDATE transactions
            SET {set_query}
            WHERE id = ANY(%s)
        """

        values.append(list(ids))

        cur.execute(query, values)
        conn.commit()

        updated_count = cur.rowcount

        cur.close()

    except Exception:
        conn.rollback()
        raise

    finally:
        DB_POOL.putconn(conn)

    # 🔥 CRITICAL: Learning step (this fixes your original problem)
    for txn_id in ids:
        learn_merchant_rule(txn_id)

    return updated_count


def insert_transaction(record):

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO transactions
            (date, amount, description, bank, mode, merchant, type, category, sub_category)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT DO NOTHING
            RETURNING id
        """, record)

        result = cur.fetchone()

        conn.commit()
        cur.close()

        return result is not None  # ✅ True if inserted

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