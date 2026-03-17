from db import DB_POOL


# ---------------------------------------------------------
# Load learned merchant rules
# ---------------------------------------------------------
def load_rules():

    conn = DB_POOL.getconn()
    cur = conn.cursor()

    cur.execute("""
        SELECT merchant, type, category, sub_category
        FROM merchant_rules
    """)

    rules = {}

    for merchant, tx_type, category, sub_category in cur.fetchall():

        rules[merchant.upper().strip()] = {
            "type": tx_type,
            "category": category,
            "sub_category": sub_category
        }

    cur.close()
    DB_POOL.putconn(conn)

    return rules


# ---------------------------------------------------------
# Learn rule from user correction
# ---------------------------------------------------------
def learn_rule(merchant, tx_type, category, sub_category, amount=None):

    conn = DB_POOL.getconn()

    try:
        cur = conn.cursor()

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

        print("RULE LEARNED:", merchant_key, tx_type, category, sub_category)

        conn.commit()
        cur.close()

    finally:
        DB_POOL.putconn(conn)


# ---------------------------------------------------------
# Load regex / pattern based merchant rules
# ---------------------------------------------------------
def load_merchant_patterns():

    conn = DB_POOL.getconn()
    cur = conn.cursor()

    cur.execute("""
        SELECT pattern, merchant, category, sub_category, priority
        FROM merchant_patterns
    """)

    rows = cur.fetchall()

    patterns = []

    for pattern, merchant, category, sub_category, priority in rows:

        patterns.append({
            "pattern": pattern.upper().strip(),
            "merchant": merchant.upper().strip(),
            "category": category,
            "sub_category": sub_category,
            "priority": priority
        })

    # sort patterns
    patterns.sort(key=lambda x: (x["priority"], -len(x["pattern"])))

    cur.close()
    DB_POOL.putconn(conn)

    return patterns


# ---------------------------------------------------------
# Load merchant aliases
# ---------------------------------------------------------
def load_aliases():

    conn = DB_POOL.getconn()
    cur = conn.cursor()

    cur.execute("""
        SELECT alias, merchant
        FROM merchant_alias
    """)

    rows = cur.fetchall()

    aliases = {}

    for alias, merchant in rows:
        aliases[alias.upper()] = merchant.upper()

    cur.close()
    DB_POOL.putconn(conn)

    return aliases


# ---------------------------------------------------------
# Load family transaction aliases
# ---------------------------------------------------------
def load_family_alias():

    conn = DB_POOL.getconn()
    cur = conn.cursor()

    cur.execute("""
        SELECT name, category, sub_category
        FROM family_alias
    """)

    rows = cur.fetchall()

    family = {}

    for name, category, sub_category in rows:
        family[name.upper()] = (category, sub_category)

    cur.close()
    DB_POOL.putconn(conn)

    return family