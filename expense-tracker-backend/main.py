import os
import logging
import warnings
import importlib
from datetime import datetime
from tqdm import tqdm

logger = logging.getLogger(__name__)

from engine_context import EngineContext
from repositories.transaction_repo import insert_transaction, store_embedding
from repositories.merchant_rule_repo import (
    load_rules,
    load_merchant_patterns,
    load_aliases,
    load_family_alias
)
from repositories.upload_repo import update_upload_status
from services.categorization_service import (
    categorize_transaction,
    derive_payment_method
)
from rag_engine import get_embedding

import pytz

IST = pytz.timezone("Asia/Kolkata")


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


# ==============================
# CORE ENGINE
# ==============================
def create_context():
    rules = load_rules()
    patterns = load_merchant_patterns()
    aliases = load_aliases()
    family_alias = load_family_alias()

    return EngineContext(rules, patterns, aliases, family_alias)


def ingest_file(file_path, bank, upload_id=None):

    from repositories.upload_repo import update_upload_progress  # ✅ NEW IMPORT

    ctx = create_context()

    if bank not in PARSER_MAP:
        raise ValueError(f"Unsupported bank: {bank}")

    parser_module = importlib.import_module(PARSER_MAP[bank])
    records = parser_module.parse(file_path)

    inserted_count = 0
    processed_count = 0  # ✅ NEW
    total_records = len(records)

    # ✅ initialize progress (set total early)
    if upload_id:
        update_upload_progress(upload_id, 0, total_records)
        update_upload_status(upload_id, "processing", 0, total_records)

    BATCH_SIZE = 25

    for r in records:
        processed_count += 1  # ✅ track ALL processed rows

        try:
            normalized_date = normalize_date(r["date"])
        except Exception:
            logger.warning("Skipping record with invalid date: %s", r.get("date"))
            continue

        merchant, tx_type, category, sub_category = categorize_transaction(
            r["description"],
            normalized_date,
            ctx
        )

        dt_naive = datetime.strptime(normalized_date, "%Y-%m-%d")
        dt_ist = IST.localize(dt_naive)
        dt_utc = dt_ist.astimezone(pytz.utc)


        txn_id = insert_transaction((
            dt_utc,
            float(r["amount"]),
            r["description"],
            r["bank"],
            derive_payment_method(r["description"]),
            merchant,
            tx_type,
            category,
            sub_category
        ))

        if txn_id:
            inserted_count += 1

            # Store embedding so this transaction can be retrieved by future RAG lookups
            embedding = get_embedding(r["description"])
            if embedding:
                store_embedding(txn_id, embedding)

        # ✅ REAL progress update (based on processed_count, NOT inserted_count)
        if upload_id and processed_count % BATCH_SIZE == 0:
            update_upload_progress(upload_id, processed_count)

            update_upload_status(
                upload_id,
                "processing",
                inserted_count,
                total_records
            )

    # final progress sync — final status is set by the caller (process_upload)
    if upload_id:
        update_upload_progress(upload_id, processed_count)

    return inserted_count


# ==============================
# OPTIONAL
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
# LOCAL RUN
# ==============================
if __name__ == "__main__":
    ingest_folder()