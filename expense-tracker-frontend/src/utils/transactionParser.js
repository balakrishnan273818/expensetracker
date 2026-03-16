export function parseTransaction(raw) {
    return {
        id: raw.id ?? null,
        date: raw.date ?? "",
        description: raw.description ?? "",
        bank_account: raw.bank_account ?? "",
        category: raw.category ?? "Other",
        subcategory: raw.subcategory ?? "Other",
        type: raw.type ?? "expense",
        amount: Number(raw.amount ?? 0)
    };
}

export function parseTransactions(data) {
    if (!Array.isArray(data)) return [];
    return data.map(parseTransaction);
}
