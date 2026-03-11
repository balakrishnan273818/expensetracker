import psycopg2


def lookup_rule(description):

    conn = psycopg2.connect(
        dbname="expense_tracker",
        user="postgres",
        password="Bull@1895",
        host="localhost"
    )

    cur = conn.cursor()

    cur.execute(
        """
        SELECT category, sub_category
        FROM merchant_rules
        WHERE UPPER(%s) LIKE '%%' || UPPER(merchant) || '%%'
        ORDER BY LENGTH(merchant) DESC
        LIMIT 1
        """,
        (description,)
    )

    result = cur.fetchone()

    cur.close()
    conn.close()

    return result if result else (None, None)


def learn_rule(merchant, category, sub_category):

    conn = psycopg2.connect(
        dbname="expense_tracker",
        user="postgres",
        password="Bull@1895",
        host="localhost"
    )

    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO merchant_rules (merchant, category, sub_category)
        VALUES (%s,%s,%s)
        ON CONFLICT (merchant) DO NOTHING
        """,
        (merchant, category, sub_category)
    )

    conn.commit()

    cur.close()
    conn.close()