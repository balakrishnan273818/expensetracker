import os
import importlib
from tqdm import tqdm

# Existing (safe reuse)
from repositories.upload_repo import update_upload_status, update_upload_progress

# RAG pipeline (core)
from rag.pipeline.transaction_pipeline import process_transaction

# Optional: if you want to store results
# (recommend separate table or logging initially)
# from repositories.transaction_repo import insert_transaction

# ==============================
# CONFIG
# ==============================

PARSER_MAP = {
    "axis": "parsers.axis_parser",
    "hdfc": "parsers.hdfc_parser",
    "idfc": "parsers.idfc_parser"
}


# ==============================
# HELPERS
# ==============================

def load_parser(bank: str):
    if bank not in PARSER_MAP:
        raise ValueError(f"Unsupported bank: {bank}")

    return importlib.import_module(PARSER_MAP[bank])


# ==============================
# CORE INGESTION (RAG)
# ==============================

def ingest_file_rag(file_path: str, bank: str, upload_id=None, debug=False):
    """
    RAG ingestion entry point

    - Uses existing parsers
    - Sends each transaction through RAG pipeline
    - Optionally tracks progress
    - Safe for shadow mode
    """

    parser = load_parser(bank)
    records = parser.parse(file_path)

    total_records = len(records)
    processed_count = 0

    results = []  # for evaluation / debugging

    # Initialize progress
    if upload_id:
        update_upload_progress(upload_id, 0, total_records)
        update_upload_status(upload_id, "processing", 0, total_records)

    BATCH_SIZE = 5

    for tx in tqdm(records, desc="RAG Processing", colour="cyan"):

        processed_count += 1

        try:
            # ==============================
            # 🔥 CORE CALL
            # ==============================
            rag_result = process_transaction(tx)

            # ==============================
            # STORE / COLLECT
            # ==============================

            if debug:
                results.append({
                    "input": tx,
                    "output": rag_result
                })

            # 👉 Optional DB insert (recommended later)
            # insert_transaction_rag(tx, rag_result)

        except Exception as e:
            if debug:
                results.append({
                    "input": tx,
                    "error": str(e)
                })
            continue

        # ==============================
        # PROGRESS TRACKING
        # ==============================
        if upload_id and processed_count % BATCH_SIZE == 0:
            update_upload_progress(upload_id, processed_count)

            update_upload_status(
                upload_id,
                "processing",
                processed_count,
                total_records
            )

    # Final update
    if upload_id:
        update_upload_progress(upload_id, processed_count)

        update_upload_status(
            upload_id,
            "success",
            processed_count,
            total_records
        )

    return results if debug else processed_count


# ==============================
# FOLDER INGESTION
# ==============================

def ingest_folder_rag(base_folder="statements", debug=False):

    all_results = []

    for bank in PARSER_MAP.keys():

        folder_path = os.path.join(base_folder, bank)

        if not os.path.exists(folder_path):
            continue

        parser = load_parser(bank)

        for file in os.listdir(folder_path):

            if file.endswith((".xls", ".xlsx", ".csv")):

                full_path = os.path.join(folder_path, file)

                result = ingest_file_rag(
                    full_path,
                    bank,
                    upload_id=None,
                    debug=debug
                )

                if debug:
                    all_results.extend(result)

    return all_results if debug else True