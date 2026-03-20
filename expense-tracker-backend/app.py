import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from repositories.transaction_repo import update_transaction_remarks
from repositories.budget_repo import get_budgets_by_month, upsert_budgets
import threading
from repositories.transaction_repo import (
    fetch_transactions,
    update_transaction_category,
    bulk_update_transactions
)
from werkzeug.utils import secure_filename
from main import run_ingestion
from main import run_ingestion_file  # we will create this

app = Flask(__name__)
CORS(app)


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return {"error": "No file"}, 400

    file = request.files["file"]

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    file.save(file_path)

    # Run ingestion for this file
    run_ingestion_file(file_path)

    return {"status": "uploaded & processed"}

@app.route("/api/transactions/<int:txn_id>/remarks", methods=["PATCH"])
def update_remarks(txn_id):
    data = request.get_json(silent=True) or {}
    remarks = data.get("remarks", "")

    update_transaction_remarks(txn_id, remarks)

    return jsonify({"success": True})

@app.route("/")
def home():
    return "Expense tracker backend running"


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


@app.route("/api/transactions/bulk", methods=["PATCH"])
def bulk_update():

    updates = request.json

    bulk_update_transactions(updates)

    return jsonify({"updated": len(updates)})

@app.route("/api/budgets", methods=["GET"])
def get_budgets():

    month = request.args.get("month")  # "2026-03"

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

    print("BUDGET API HIT:", data)  # 🔥 DEBUG

    month = data.get("month")
    monthly_income = data.get("monthly_income", 0)
    budgets = data.get("budgets", [])

    if not month:
        return jsonify({"error": "month required"}), 400

    upsert_budgets(month, budgets, monthly_income)

    return jsonify({"status": "success"})

@app.post("/ingest")
def trigger_ingestion():
    thread = threading.Thread(target=run_ingestion)
    thread.start()
    return {"status": "started"}


if __name__ == "__main__":
    app.run(debug=True)