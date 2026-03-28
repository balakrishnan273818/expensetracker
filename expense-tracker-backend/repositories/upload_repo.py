from db import DB_POOL
from datetime import datetime
import pytz


def insert_upload_history(file_name, bank, file_size, transactions_added, status):

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO upload_history
            (file_name, bank, uploaded_at, file_size, transactions_added, total_records, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            file_name,
            bank,
            datetime.now(pytz.utc),
            file_size,
            transactions_added,
            0,
            status
        ))

        upload_id = cur.fetchone()[0]

        conn.commit()
        cur.close()

        return upload_id

    except Exception:
        conn.rollback()
        raise

    finally:
        DB_POOL.putconn(conn)


def fetch_upload_history():

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT
                id,
                file_name,
                bank,
                uploaded_at,
                file_size,
                transactions_added,
                total_records,
                processed_records,
                status
            FROM upload_history
            ORDER BY id DESC
            LIMIT 50
        """)

        rows = cur.fetchall()
        cur.close()

        return rows

    finally:
        DB_POOL.putconn(conn)

def update_upload_progress(upload_id, processed_records, total_records=None):

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        cur.execute("""
            UPDATE upload_history
            SET processed_records = %s,
                total_records = COALESCE(%s, total_records)
            WHERE id = %s
        """, (
            processed_records,
            total_records,
            upload_id
        ))

        conn.commit()
        cur.close()

    except Exception:
        conn.rollback()
        raise

    finally:
        DB_POOL.putconn(conn)

def update_upload_status(upload_id, status, transactions_added, total_records=None):

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

        cur.execute("""
            UPDATE upload_history
            SET status = %s,
                transactions_added = %s,
                total_records = COALESCE(%s, total_records)
            WHERE id = %s
        """, (
            status,
            transactions_added,
            total_records,
            upload_id
        ))

        conn.commit()
        cur.close()

    except Exception:
        conn.rollback()
        raise

    finally:
        DB_POOL.putconn(conn)