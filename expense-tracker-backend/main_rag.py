import os
import importlib
from datetime import datetime
import pytz
from tqdm import tqdm

# Existing imports (reuse safely)
from repositories.transaction_repo import insert_transaction
from repositories.upload_repo import update_upload_status, update_upload_progress
from services.categorization_service import derive_payment_method

# NEW (RAG)
from rag.rag_pipeline import classify
from rag.retrieval.vector_store import store_embedding

IST = pytz.timezone("Asia/Kolkata")

PARSER_MAP = {
    "axis": "parsers.axis_parser",
    "hdfc": "parsers.hdfc_parser",
    "idfc": "parsers.idfc_parser"
}

# ==============================
# HELPERS
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


def to_utc(date_str):
    dt_naive = datetime.strptime(date_str, "%Y-%m-%d")
    dt_ist = IST.localize(dt_naive)
    return dt_ist.astimezone(pytz.utc)


def load_parser(bank):
    if bank not in PARSER_MAP:
        raise ValueError(f"Unsupported bank: {bank}")

    return importlib.import_module(PARSER_MAP[bank])


# ==============================
# CORE RAG INGESTION
# ==============================

def ingest_file_rag(file_path, bank, upload_id=None):

    parser = load_parser(bank)
    records = parser.parse(file_path)

    total_records = len(records)
    inserted_count = 0
    processed_count = 0

    if upload_id:
        update_upload_progress(upload_id, 0, total_records)
        update_upload_status(upload_id, "processing", 0, total_records)

    BATCH_SIZE = 5

    for r in tqdm(records, desc="RAG Ingestion", colour="cyan"):

        processed_count += 1

        try:
            normalized_date = normalize_date(r["date"])
        except Exception:
            continue

        # ==============================
        # 🔥 RAG CLASSIFICATION
        # ==============================
        rag_result = classify({
            "description": r["description"],
            "amount": r["amount"],
            "date": normalized_date,
            "bank": r["bank"]
        })

        merchant = rag_result.get("merchant")
        tx_type = rag_result.get("type")
        category = rag_result.get("category")
        sub_category = rag_result.get("subcategory")

        dt_utc = to_utc(normalized_date)

        tx_payload = (
            dt_utc,
            float(r["amount"]),
            r["description"],
            r["bank"],
            derive_payment_method(r["description"]),
            merchant,
            tx_type,
            category,
            sub_category
        )

        inserted = insert_transaction(tx_payload)

        # ==============================
        # 🔥 STORE EMBEDDING (LEARNING)
        # ==============================
        if inserted:
            inserted_count += 1

            store_embedding({
                "description": r["description"],
                "merchant": merchant,
                "category": category,
                "subcategory": sub_category,
                "amount": r["amount"]
            })

        # ==============================
        # PROGRESS TRACKING
        # ==============================
        if upload_id and processed_count % BATCH_SIZE == 0:
            update_upload_progress(upload_id, processed_count)

            update_upload_status(
                upload_id,
                "processing",
                inserted_count,
                total_records
            )

    # Final update
    if upload_id:
        update_upload_progress(upload_id, processed_count)

        update_upload_status(
            upload_id,
            "success",
            inserted_count,
            total_records
        )

    return inserted_count


# ==============================
# OPTIONAL: FOLDER INGESTION
# ==============================

def ingest_folder_rag(base_folder="statements"):

    for bank in PARSER_MAP.keys():
        folder_path = os.path.join(base_folder, bank)

        if not os.path.exists(folder_path):
            continue

        parser = load_parser(bank)

        for file in os.listdir(folder_path):
            if file.endswith((".xls", ".xlsx", ".csv")):
                full_path = os.path.join(folder_path, file)
                ingest_file_rag(full_path, bank)


# ==============================
# ENTRY
# ==============================

if __name__ == "__main__":
    ingest_folder_rag()