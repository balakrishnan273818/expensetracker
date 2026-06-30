import os
import re
import uuid
import logging
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import pandas as pd
import pytz

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

from repositories.transaction_repo import (
    fetch_transactions,
    update_transaction_category,
    bulk_update_transactions,
    update_transaction_remarks,
    store_embedding,
    fetch_transactions_without_embeddings
)
from rag_engine import get_embedding
from repositories.budget_repo import get_budgets_by_month, upsert_budgets
from repositories.upload_repo import insert_upload_history, fetch_upload_history, update_upload_status

from main import ingest_file  # ✅ correct import

app = Flask(__name__)
CORS(app)

# ==============================
# CONFIG
# ==============================
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB


def detect_bank(file_path, fallback_bank=None):

    try:
        df = pd.read_excel(file_path, nrows=5)
        columns = [str(c).lower() for c in df.columns]

        if any("particulars" in c for c in columns):
            return "axis"
        elif any("narration" in c for c in columns):
            return "hdfc"
        elif any("transaction date" in c for c in columns):
            return "idfc"

    except Exception:
        pass

    return fallback_bank


def process_upload(file_path, bank, upload_id):

    try:
        result = ingest_file(file_path, bank, upload_id)

        # ✅ ONLY here success should be set
        update_upload_status(
            upload_id,
            "success",
            result
        )

    except Exception as e:
        logger.error("Upload failed for upload_id=%s: %s", upload_id, str(e))

        update_upload_status(
            upload_id,
            "failed",
            0
        )


# ==============================
# FILE UPLOAD + INGESTION
# ==============================

@app.route("/api/upload", methods=["POST"])
def upload_file():

    if "file" not in request.files:
        return {"error": "No file"}, 400

    file = request.files["file"]
    bank = request.form.get("bank")

    if not bank:
        return {"error": "bank is required"}, 400

    filename = secure_filename(file.filename)

    if not filename.endswith((".xls", ".xlsx")):
        return {"error": "Invalid file format"}, 400

    # Read into memory first so we can check size before writing to disk
    file_bytes = file.read()
    file_size = len(file_bytes)

    if file_size > MAX_UPLOAD_SIZE:
        return {"error": f"File too large (max {MAX_UPLOAD_SIZE // (1024 * 1024)} MB)"}, 413

    # Prefix with UUID to avoid overwriting a concurrent upload of the same filename
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    detected_bank = detect_bank(file_path, bank)

    upload_id = insert_upload_history(
        filename,
        detected_bank,
        file_size,
        0,
        "processing"
    )

    t = threading.Thread(
        target=process_upload,
        args=(file_path, detected_bank, upload_id),
        daemon=True
    )
    t.start()

    return jsonify({
        "id": upload_id,
        "file_name": filename,
        "bank": detected_bank,
        "uploaded_at": datetime.now(pytz.utc).isoformat(),
        "file_size": file_size,
        "transactions_added": 0,
        "total_records": 0,
        "status": "processing"
    })


# ==============================
# UPLOAD HISTORY
# ==============================

@app.route("/api/upload/history", methods=["GET"])
def get_upload_history():

    rows = fetch_upload_history()

    history = []

    for r in rows:
        (
            id,
            file_name,
            bank,
            uploaded_at,
            file_size,
            transactions_added,
            total_records,
            processed_records,
            status
        ) = r

        history.append({
            "id": id,
            "file_name": file_name,
            "bank": bank,
            "uploaded_at": uploaded_at.isoformat(),
            "file_size": file_size,
            "transactions_added": transactions_added,
            "total_records": total_records,
            "processed_records": processed_records,
            "status": status
        })

    return jsonify(history)


@app.route("/")
def home():
    return "Expense tracker backend running"


# ==============================
# TRANSACTIONS APIs
# ==============================

@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    try:
        limit = int(request.args.get("limit", 5000))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        return jsonify({"error": "limit and offset must be integers"}), 400

    rows = fetch_transactions(limit=limit, offset=offset)
    transactions = []

    for row in rows:
        (
            txn_id,
            date,
            amount,
            category,
            sub_category,
            mode,
            bank,
            description,
            remarks
        ) = row

        amount = float(amount)

        if category == "Transfer":
            txn_type = "transfer"
        else:
            txn_type = "expense" if amount < 0 else "income"

        transactions.append({
            "id": txn_id,
            "date": date.strftime("%Y-%m-%d") if date else None,
            "amount": amount,
            "type": txn_type,
            "category": category,
            "sub_category": sub_category,
            "mode": mode,
            "bank": bank,
            "description": description,
            "remarks": remarks
        })

    return jsonify(transactions)


@app.route("/api/transactions/add", methods=["POST"])
def add_transaction():
    try:
        data = request.get_json(silent=True) or {}

        required_fields = ["amount", "type", "category", "date"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        amount = float(data.get("amount"))

        if data.get("type") == "expense" and amount > 0:
            amount = -amount
        elif data.get("type") == "income" and amount < 0:
            amount = abs(amount)

        tx = {
            "date": data.get("date"),
            "amount": amount,
            "category": data.get("category"),
            "sub_category": data.get("sub_category") or data.get("subcategory"),
            "mode": "cash",
            "bank": None,
            "description": data.get("description"),
            "remarks": data.get("remarks")
        }

        from repositories.transaction_repo import create_transaction
        created_id = create_transaction(tx)

        # Store embedding so this manual transaction enriches future RAG lookups
        if tx.get("description"):
            embedding = get_embedding(tx["description"])
            if embedding:
                store_embedding(created_id, embedding)

        return jsonify({
            "id": created_id,
            **tx
        }), 201

    except Exception as e:
        logger.error("Add transaction failed: %s", str(e))
        return jsonify({"error": "Failed to create transaction"}), 500


@app.route("/api/transactions/<int:txn_id>", methods=["PATCH"])
def update_transaction(txn_id):
    data = request.json

    category = data.get("category")
    sub_category = data.get("sub_category")
    txn_type = data.get("type")

    update_transaction_category(txn_id, category, sub_category, txn_type)

    return jsonify({"success": True})


@app.route("/api/transactions/bulk-update", methods=["POST"])
def bulk_update_api():

    data = request.get_json(silent=True) or {}

    ids = data.get("ids", [])
    category = data.get("category")
    subcategory = data.get("subcategory")
    txn_type = data.get("type")

    if not ids:
        return jsonify({"error": "No transaction IDs"}), 400

    updates = {}

    if category is not None:
        updates["category"] = category

    if subcategory is not None:
        updates["sub_category"] = subcategory

    if txn_type is not None:
        updates["type"] = txn_type

    updated = bulk_update_transactions(ids, updates)

    return jsonify({
        "success": True,
        "updated": updated
    })


@app.route("/api/transactions/<int:txn_id>/remarks", methods=["PATCH"])
def update_remarks(txn_id):
    data = request.get_json(silent=True) or {}
    remarks = data.get("remarks", "")

    update_transaction_remarks(txn_id, remarks)

    return jsonify({"success": True})


@app.route("/api/transactions/<int:txn_id>", methods=["DELETE"])
def delete_transaction(txn_id):
    try:
        from repositories.transaction_repo import delete_transaction_by_id, get_transaction_by_id

        tx = get_transaction_by_id(txn_id)

        if not tx:
            return jsonify({"error": "Transaction not found"}), 404

        if tx["mode"] != "cash":
            return jsonify({"error": "Only cash transactions can be deleted"}), 400

        delete_transaction_by_id(txn_id)

        return jsonify({"success": True})

    except Exception as e:
        logger.error("Delete transaction %s failed: %s", txn_id, str(e))
        return jsonify({"error": "Failed to delete transaction"}), 500


# ==============================
# BUDGET APIs
# ==============================

@app.route("/api/budgets", methods=["GET"])
def get_budgets():
    month = request.args.get("month")

    if not month:
        return jsonify({"error": "month is required"}), 400

    if not re.match(r"^\d{4}-(0[1-9]|1[0-2])$", month):
        return jsonify({"error": "month must be in YYYY-MM format"}), 400

    month_date = f"{month}-01"
    rows = get_budgets_by_month(month_date)

    budgets = []
    monthly_income = 0

    for r in rows:
        budgets.append({
            "category": r[0],
            "budget_amount": float(r[1] or 0)
        })
        monthly_income = float(r[2] or 0)

    return jsonify({
        "monthly_income": monthly_income,
        "budgets": budgets
    })


@app.route("/api/budgets/bulk", methods=["POST"])
def save_budgets():
    data = request.json

    month = data.get("month")
    monthly_income = data.get("monthly_income", 0)
    budgets = data.get("budgets", [])

    if not month:
        return jsonify({"error": "month required"}), 400

    upsert_budgets(month, budgets, monthly_income)

    return jsonify({"status": "success"})


# ==============================
# EMBEDDINGS
# ==============================

def _run_backfill():
    """
    Background worker: generate and store embeddings for all transactions
    that don't have one yet. Runs in batches to avoid memory spikes.
    """
    total = 0

    while True:
        rows = fetch_transactions_without_embeddings(batch_size=50)

        if not rows:
            break

        for txn_id, description in rows:
            embedding = get_embedding(description)
            if embedding:
                store_embedding(txn_id, embedding)
                total += 1

    logger.info("Embedding backfill complete: %d transactions embedded", total)


@app.route("/api/embeddings/backfill", methods=["POST"])
def backfill_embeddings():
    """
    Trigger background embedding generation for all transactions
    that don't have a vector yet. Safe to call multiple times.
    """
    t = threading.Thread(target=_run_backfill, daemon=True)
    t.start()
    return jsonify({"status": "backfill started"})


# ==============================
# LOCAL RUN
# ==============================

if __name__ == "__main__":
    app.run(debug=True)