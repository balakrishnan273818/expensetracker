from flask import Flask, jsonify, request
from flask_cors import CORS
from repositories.transaction_repo import update_transaction_remarks

from repositories.transaction_repo import (
    fetch_transactions,
    update_transaction_category,
    bulk_update_transactions
)

app = Flask(__name__)
CORS(app)

@app.route("/api/transactions/<int:txn_id>/remarks", methods=["PATCH"])
def update_remarks(txn_id):

    data = request.json

    remarks = data.get("remarks")

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
            description
        ) = row

        amount = float(amount)

        if category == "Transfer":
            txn_type = "transfer"
        else:
            txn_type = "expense" if amount < 0 else "income"

        transactions.append({
            "id": txn_id,
            "date": date.isoformat(),
            "amount": amount,
            "type": txn_type,
            "category": category,
            "sub_category": sub_category,
            "mode": mode,
            "bank": bank,
            "description": description
        })

    return jsonify(transactions)


@app.route("/api/transactions/<int:txn_id>", methods=["PATCH"])
def update_transaction(txn_id):

    data = request.json

    category = data.get("category")
    sub_category = data.get("sub_category")

    update_transaction_category(txn_id, category, sub_category)

    return jsonify({"success": True})


@app.route("/api/transactions/bulk", methods=["PATCH"])
def bulk_update():

    updates = request.json

    bulk_update_transactions(updates)

    return jsonify({"updated": len(updates)})


if __name__ == "__main__":
    app.run(debug=True)