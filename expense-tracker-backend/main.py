import os
import importlib
import psycopg2
from tqdm import tqdm

from merchant_extractor import extract_merchant
from db import lookup_rule, learn_rule
from ai_categorizer import ai_categorize

BASE_FOLDER = "statements"

PARSER_MAP = {
    "axis": "parsers.axis_parser",
    "hdfc": "parsers.hdfc_parser",
    "idfc": "parsers.idfc_parser"
}

def insert_records_old(records):

    conn = psycopg2.connect(
        dbname="expense_tracker",
        user="postgres",
        password="Bull@1895",
        host="localhost"
    )

    cur = conn.cursor()

    for r in tqdm(records, total=len(records)):

        # extract merchant
        merchant = extract_merchant(r["description"])

        # check learned rules
        category, sub_category = lookup_rule(merchant)

        # AI fallback
        if not category:
            category = ai_categorize(merchant)

        cur.execute("""
        INSERT INTO transactions
        (date, amount, description, account, source, merchant, main_category)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT DO NOTHING
        """,
        (
            r["date"],
            r["amount"],
            r["description"],
            r["account"],
            "bank_import",
            merchant,
            category
        ))

    conn.commit()
    cur.close()
    conn.close()

def insert_records_nolearn(records):

    conn = psycopg2.connect(
        dbname="expense_tracker",
        user="postgres",
        password="Bull@1895",
        host="localhost"
    )

    cur = conn.cursor()

    for r in tqdm(records, total=len(records)):

        description = r["description"]

        # merchant only for storing
        merchant = extract_merchant(description)

        # rule lookup using FULL description
        category, sub_category = lookup_rule(description)

        # LLM fallback (send full description)
        if not category:
            category, sub_category = ai_categorize(description)

        cur.execute("""
        INSERT INTO transactions
        (date, amount, description, account, source, merchant, main_category, sub_category)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT DO NOTHING
        """,
        (
            r["date"],
            r["amount"],
            description,
            r["account"],
            "bank_import",
            merchant,
            category,
            sub_category
        ))

    conn.commit()
    cur.close()
    conn.close()

def insert_records(records):

    conn = psycopg2.connect(
        dbname="expense_tracker",
        user="postgres",
        password="Bull@1895",
        host="localhost"
    )

    cur = conn.cursor()

    for r in tqdm(records, total=len(records)):

        description = r["description"]
        txn_time = r["date"]   # send this to LLM

        merchant = extract_merchant(description)

        category, sub_category = lookup_rule(description)

        if not category:

            category, sub_category = ai_categorize(description, txn_time)

            if merchant and len(merchant) > 3:
                learn_rule(merchant, category, sub_category)

        cur.execute("""
        INSERT INTO transactions
        (date, amount, description, account, source, merchant, main_category, sub_category)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT DO NOTHING
        """,
        (
            r["date"],
            r["amount"],
            description,
            r["account"],
            "bank_import",
            merchant,
            category,
            sub_category
        ))

    conn.commit()
    cur.close()
    conn.close()


def process_bank(bank_folder, module_name):

    parser = importlib.import_module(module_name)

    folder_path = os.path.join(BASE_FOLDER, bank_folder)

    for file in os.listdir(folder_path):

        if file.endswith((".xls", ".xlsx", ".csv")):

            full_path = os.path.join(folder_path, file)

            records = parser.parse(full_path)

            insert_records(records)


def main():

    for bank, module in PARSER_MAP.items():

        process_bank(bank, module)


if __name__ == "__main__":
    main()