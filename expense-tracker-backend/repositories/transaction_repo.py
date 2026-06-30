import logging

from db import DB_POOL
from datetime import datetime
import pytz

logger = logging.getLogger(__name__)



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

        conn.commit()
        cur.close()

    finally:
        DB_POOL.putconn(conn)


def fetch_transactions(limit=5000, offset=0):

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
            LIMIT %s OFFSET %s
        """, (limit, offset))

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
        """, (category, sub_category, txn_type, txn_id))

        conn.commit()
        cur.close()

    finally:
        DB_POOL.putconn(conn)

    learn_merchant_rule(txn_id)


def batch_learn_merchant_rules(ids):
    """Batch version of learn_merchant_rule: one SELECT + one executemany instead of N round trips."""

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT merchant, type, category, sub_category, amount
            FROM transactions
            WHERE id = ANY(%s)
              AND merchant IS NOT NULL
        """, (list(ids),))

        rows = cur.fetchall()

        if not rows:
            cur.close()
            return

        cur.executemany("""
            INSERT INTO merchant_rules
            (merchant, type, category, sub_category, sample_amount)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (merchant)
            DO UPDATE SET
                type = EXCLUDED.type,
                category = EXCLUDED.category,
                sub_category = EXCLUDED.sub_category
        """, [
            (r[0].upper().strip(), r[1], r[2], r[3], r[4])
            for r in rows
        ])

        conn.commit()
        cur.close()

    finally:
        DB_POOL.putconn(conn)


def bulk_update_transactions(ids, updates):

    if not ids:
        return 0

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        set_clauses = []
        values = []

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

    batch_learn_merchant_rules(ids)

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

        return result is not None

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


# ==============================
# Manual (Cash) Transactions
# ==============================

def create_transaction(tx):

    conn = DB_POOL.getconn()
    IST = pytz.timezone("Asia/Kolkata")

    dt_naive = datetime.strptime(tx["date"], "%Y-%m-%d")
    dt_ist = IST.localize(dt_naive)
    dt_utc = dt_ist.astimezone(pytz.utc)

    try:
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO transactions
            (date, amount, category, sub_category, mode, bank, description, remarks, type)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            dt_utc,
            tx["amount"],
            tx["category"],
            tx["sub_category"],
            tx["mode"],
            tx["bank"],
            tx.get("description"),
            tx.get("remarks"),
            tx.get("type")
        ))

        result = cur.fetchone()

        conn.commit()
        cur.close()

        return result[0]

    except Exception:
        conn.rollback()
        raise

    finally:
        DB_POOL.putconn(conn)


def get_transaction_by_id(txn_id):

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT id, mode
            FROM transactions
            WHERE id = %s
        """, (txn_id,))

        row = cur.fetchone()
        cur.close()

        if not row:
            return None

        return {
            "id": row[0],
            "mode": row[1]
        }

    finally:
        DB_POOL.putconn(conn)


def delete_transaction_by_id(txn_id):

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        cur.execute("""
            DELETE FROM transactions
            WHERE id = %s
        """, (txn_id,))

        conn.commit()
        cur.close()

    except Exception:
        conn.rollback()
        raise

    finally:
        DB_POOL.putconn(conn)