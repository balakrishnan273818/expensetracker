import os
import warnings
# Suppress the specific openpyxl style warning
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")
import importlib
from tqdm import tqdm
from engine_context import EngineContext
from datetime import datetime

from repositories.transaction_repo import insert_transaction
from repositories.merchant_rule_repo import load_rules, load_merchant_patterns
from services.categorization_service import categorize_transaction
from repositories.merchant_rule_repo import load_aliases
from repositories.merchant_rule_repo import load_family_alias
from services.categorization_service import derive_payment_method

BASE_FOLDER = "statements"

PARSER_MAP = {
    "axis": "parsers.axis_parser",
    "hdfc": "parsers.hdfc_parser",
    "idfc": "parsers.idfc_parser"
}

def normalize_date(date_str):

    formats = [
        "%Y-%m-%d",   # already normalized
        "%d-%m-%Y",   # Axis
        "%d/%m/%y",   # HDFC
        "%d-%b-%Y"    # IDFC
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue

    raise ValueError(f"Unknown date format: {date_str}")

def process_records(records, ctx):

    for r in tqdm(records, colour="green"):

        # 🔥 enforce normalization
        try:
            normalized_date = normalize_date(r["date"])
        except Exception as e:
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


def process_bank(bank_folder, module_name, ctx):

    parser = importlib.import_module(module_name)

    folder_path = os.path.join(BASE_FOLDER, bank_folder)

    for file in os.listdir(folder_path):

        if file.endswith((".xls", ".xlsx", ".csv")):

            full_path = os.path.join(folder_path, file)

            records = parser.parse(full_path)

            process_records(records, ctx)


def main():

    # Load once
    rules = load_rules()
    patterns = load_merchant_patterns()
    aliases = load_aliases()
    family_alias = load_family_alias()

    ctx = EngineContext(rules, patterns, aliases, family_alias)

    for bank, module in PARSER_MAP.items():
        process_bank(bank, module, ctx)


if __name__ == "__main__":
    main()
