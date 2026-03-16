const API_BASE = "http://localhost:5000";

export async function updateTransactionsBulk(transactions) {
    const response = await fetch(`${API_BASE}/api/transactions/bulk-update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(transactions),
    });

    if (!response.ok) {
        throw new Error("Failed to update transactions");
    }

    return await response.json();
}

export async function deleteTransaction(id) {
    const response = await fetch(`${API_BASE}/api/transactions/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete transaction");
    }

    return await response.json();
}

export async function getTransactions() {

    const res = await fetch(`${API_BASE}/api/transactions`);

    if (!res.ok) {
        throw new Error("Failed to fetch transactions");
    }

    return await res.json();
}

export async function updateTransactionCategory(id, category, subcategory) {

    const res = await fetch(`${API_BASE}/api/transactions/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            category: category,
            sub_category: subcategory
        })
    });

    if (!res.ok) {
        throw new Error("Failed to update transaction");
    }

    return await res.json();
}