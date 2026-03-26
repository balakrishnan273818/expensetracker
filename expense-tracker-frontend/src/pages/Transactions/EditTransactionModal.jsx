import { useEffect, useMemo, useState } from "react";
import { categoryOptions, subcategoryMap } from "../../constants/categories";

export default function EditTransactionModal({
                                                 activeTx,
                                                 setActiveTx,
                                                 onSave
                                             }) {

    const isBulk = activeTx?.bulk;

    // ✅ NEW: detect cash create mode
    const isCashCreate = activeTx?.isNew && activeTx?.mode === "cash";

    // ✅ Local controlled state (existing)
    const [type, setType] = useState("");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");

    // ✅ NEW: local state for cash mode
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [remarks, setRemarks] = useState("");

    const inputClass =
        "w-full mt-1 border rounded px-3 py-2 " +
        "bg-white text-gray-900 " +
        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500";

    const labelClass =
        "text-sm text-gray-700 dark:text-gray-300";

    // ✅ Initialize state safely
    useEffect(() => {
        if (!activeTx) return;

        if (isBulk) {
            setType("");
            setCategory("");
            setSubcategory("");
        } else if (isCashCreate) {
            const today = new Date().toISOString().slice(0, 10);
            setAmount(activeTx.amount || "");
            setDate(activeTx.date || today);
            setRemarks(activeTx.remarks || "");
        } else {
            setType(activeTx.type || "");
            setCategory(activeTx.category || "");
            setSubcategory(activeTx.subcategory || "");
        }
    }, [activeTx, isBulk, isCashCreate]);

    // ✅ Derived subcategories (existing)
    const subcategories = useMemo(() => {
        return subcategoryMap[category] || [];
    }, [category]);

    // ✅ Reset subcategory when category changes (existing)
    useEffect(() => {
        if (!category) return;

        if (!subcategories.includes(subcategory)) {
            setSubcategory(subcategories[0] || "");
        }
    }, [category, subcategories]);

    function handleSave() {

        // ✅ CASH MODE SAVE
        if (isCashCreate) {

            // minimal validation
            if (!amount || !date) {
                return;
            }

            const payload = {
                ...activeTx,
                amount: Number(amount),
                date: date || new Date().toISOString().slice(0, 10),
                remarks: remarks || "",
                mode: "cash",
                bank: null,
                description: null,
                category: "Others",   // fallback
                subcategory: "Cash",
                type: "expense"
            };

            onSave(payload);
            return;
        }

        // ✅ EXISTING LOGIC (UNCHANGED)
        const payload = {
            ...activeTx
        };

        if (type) payload.type = type;
        if (category) payload.category = category;
        if (subcategory) payload.subcategory = subcategory;

        onSave(payload);
    }

    return (

        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">

            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl p-6 w-96 space-y-4 shadow-lg">

                <h2 className="text-lg font-semibold">
                    {isCashCreate
                        ? "Add Cash Transaction"
                        : isBulk
                            ? "Edit Selected Transactions"
                            : "Edit Transaction"}
                </h2>

                {/* ✅ CASH MODE UI */}
                {isCashCreate ? (
                    <>
                        {/* Date */}
                        <div>
                            <label className={labelClass}>Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className={labelClass}>Amount</label>
                            <input
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className={labelClass}>Remarks (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Tea, Snacks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* EXISTING UI (UNCHANGED) */}

                        {/* Transaction Type */}
                        <div>
                            <label className={labelClass}>Transaction Type</label>

                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">-- Select --</option>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                                <option value="transfer">Transfer</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className={labelClass}>Category</label>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">-- Select --</option>
                                {categoryOptions.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Subcategory */}
                        <div>
                            <label className={labelClass}>Subcategory</label>

                            <select
                                value={subcategory}
                                onChange={(e) => setSubcategory(e.target.value)}
                                className={inputClass}
                                disabled={!category}
                            >
                                <option value="">-- Select --</option>
                                {subcategories.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">

                    <button
                        onClick={() => setActiveTx(null)}
                        className="px-4 py-2 border rounded-md
                                   bg-white text-gray-800
                                   dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600
                                   hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>
    );
}