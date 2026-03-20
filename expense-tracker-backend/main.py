import os
import warnings
import importlib
from datetime import datetime
from tqdm import tqdm

from engine_context import EngineContext
from repositories.transaction_repo import insert_transaction
from repositories.merchant_rule_repo import (
    load_rules,
    load_merchant_patterns,
    load_aliases,
    load_family_alias
)
from services.categorization_service import (
    categorize_transaction,
    derive_payment_method
)


# Suppress openpyxl warnings
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

# ==============================
# CONFIG
# ==============================
PARSER_MAP = {
    "axis": "parsers.axis_parser",
    "hdfc": "parsers.hdfc_parser",
    "idfc": "parsers.idfc_parser"
}

# ==============================
# HELPERS (UNCHANGED LOGIC)
# ==============================
def normalize_date(date_str):
    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%y",
        "%d-%b-%Y"
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue

    raise ValueError(f"Unknown date format: {date_str}")


def process_records(records, ctx):
    for r in tqdm(records, colour="green"):

        try:
            normalized_date = normalize_date(r["date"])
        except Exception:
            print(f"Skipping invalid date: {r['date']}")
            continue

        merchant, tx_type, category, sub_category = categorize_transaction(
            r["description"],
            normalized_date,
            ctx
        )

        insert_transaction((
            normalized_date,
            float(r["amount"]),
            r["description"],
            r["bank"],
            derive_payment_method(r["description"]),
            merchant,
            tx_type,
            category,
            sub_category
        ))


# ==============================
# CORE ENGINE (NEW)
# ==============================
def create_context():
    rules = load_rules()
    patterns = load_merchant_patterns()
    aliases = load_aliases()
    family_alias = load_family_alias()

    return EngineContext(rules, patterns, aliases, family_alias)


# def ingest_file(file_path, bank):
#     """
#     Main function to ingest a single uploaded file
#     """
#     print(f"Processing file: {file_path}, bank: {bank}")
#     ctx = create_context()
#
#     if bank not in PARSER_MAP:
#         raise ValueError(f"Unsupported bank: {bank}")
#
#     parser_module = importlib.import_module(PARSER_MAP[bank])
#
#     records = parser_module.parse(file_path)
#
#     process_records(records, ctx)

def ingest_file(file_path, bank):

    ctx = create_context()

    if bank not in PARSER_MAP:
        raise ValueError(f"Unsupported bank: {bank}")

    parser_module = importlib.import_module(PARSER_MAP[bank])
    records = parser_module.parse(file_path)

    inserted_count = 0

    for r in records:
        try:
            normalized_date = normalize_date(r["date"])
        except Exception:
            continue

        merchant, tx_type, category, sub_category = categorize_transaction(
            r["description"],
            normalized_date,
            ctx
        )

        inserted = insert_transaction((
            normalized_date,
            float(r["amount"]),
            r["description"],
            r["bank"],  # comes from parser
            derive_payment_method(r["description"]),
            merchant,
            tx_type,
            category,
            sub_category
        ))

        if inserted:
            inserted_count += 1

    return inserted_count

# ==============================
# OPTIONAL (OLD BEHAVIOR)
# ==============================
def ingest_folder(base_folder="statements"):
    ctx = create_context()

    for bank, module in PARSER_MAP.items():
        folder_path = os.path.join(base_folder, bank)

        if not os.path.exists(folder_path):
            continue

        parser = importlib.import_module(module)

        for file in os.listdir(folder_path):
            if file.endswith((".xls", ".xlsx", ".csv")):
                full_path = os.path.join(folder_path, file)
                records = parser.parse(full_path)
                process_records(records, ctx)

# ==============================
# LOCAL RUN (OPTIONAL)
# ==============================
if __name__ == "__main__":
    ingest_folder()