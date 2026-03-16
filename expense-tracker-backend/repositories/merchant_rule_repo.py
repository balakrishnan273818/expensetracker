from db import DB_POOL


def load_rules():

    conn = DB_POOL.getconn()
    cur = conn.cursor()

    cur.execute("""
        SELECT merchant, category, sub_category
        FROM merchant_rules
    """)

    rules = {}

    for merchant, category, sub_category in cur.fetchall():
        rules[merchant.upper().strip()] = (category, sub_category)

    cur.close()
    DB_POOL.putconn(conn)

    return rules


def learn_rule(merchant, category, sub_category):

    conn = DB_POOL.getconn()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO merchant_rules (merchant, category, sub_category)
        VALUES (%s,%s,%s)
        ON CONFLICT (merchant) DO NOTHING
    """, (merchant.upper().strip(), category, sub_category))

    conn.commit()

    cur.close()
    DB_POOL.putconn(conn)


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

    # Important: sort by priority first, then pattern length
    patterns.sort(key=lambda x: (x["priority"], -len(x["pattern"])))

    cur.close()
    DB_POOL.putconn(conn)

    return patterns

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
