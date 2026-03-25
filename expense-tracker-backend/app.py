import os
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import pandas as pd

from repositories.transaction_repo import (
    fetch_transactions,
    update_transaction_category,
    bulk_update_transactions,
    update_transaction_remarks
)
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
        result = ingest_file(file_path, bank)

        update_upload_status(
            upload_id,
            "success",
            result
        )

    except Exception as e:
        print("Upload failed:", str(e))

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

    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    file_size = os.path.getsize(file_path)

    detected_bank = detect_bank(file_path, bank)

    # ✅ Insert as processing FIRST
    upload_id = insert_upload_history(
        filename,
        detected_bank,
        file_size,
        0,
        "processing"
    )

    # ✅ Run background processing
    threading.Thread(
        target=process_upload,
        args=(file_path, detected_bank, upload_id)
    ).start()

    # ✅ Immediate response
    return jsonify({
        "file_name": filename,
        "bank": detected_bank,
        "uploaded_at": datetime.utcnow().isoformat(),
        "file_size": file_size,
        "transactions_added": 0,
        "status": "processing"
    })


# @app.route("/api/upload", methods=["POST"])
# def upload_file():
#     if "file" not in request.files:
#         return {"error": "No file"}, 400
#
#     file = request.files["file"]
#     bank = request.form.get("bank")  # ✅ REQUIRED
#
#     if not bank:
#         return {"error": "bank is required (axis/hdfc/idfc)"}, 400
#
#     filename = secure_filename(file.filename)
#     file_path = os.path.join(UPLOAD_FOLDER, filename)
#
#     file.save(file_path)
#
#     # 🔥 Run ingestion in background (non-blocking)
#     threading.Thread(target=ingest_file, args=(file_path, bank)).start()
#
#     return {"status": "processing started"}


# ==============================
# HEALTH CHECK
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
            status
        ) = r

        history.append({
            "id": id,
            "file_name": file_name,
            "bank": bank,
            "uploaded_at": uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
            "file_size": file_size,
            "transactions_added": transactions_added,
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
    rows = fetch_transactions()
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


# ==============================
# BUDGET APIs
# ==============================
@app.route("/api/budgets", methods=["GET"])
def get_budgets():
    month = request.args.get("month")

    if not month:
        return jsonify({"error": "month is required"}), 400

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
# LOCAL RUN
# ==============================
if __name__ == "__main__":
    app.run(debug=True)