import { useState } from "react";
import TypeIcon from "./TypeIcon";
import { getSubcategories } from "../../constants/categories";
import { formatDate } from "../../utils/date";
import PaymentModeIcon from "./PaymentModeIcon";
import BankIcon from "./BankIcon";
import { Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

export default function TransactionRow({
                                           tx,
                                           editMode,
                                           setTransactions,
                                           setActiveTx,
                                           isSelected,
                                           toggleSelect,
                                           onDelete
                                       }) {

    const isExpense = tx.amount < 0;

    // ✅ Only allow delete for manual cash (no bank)
    const canDelete = tx.isCash && !tx.bank;

    // ✅ NEW: modal state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    return (
        <>
            <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">

                <td className="px-2 py-4">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(tx.id)}
                    />
                </td>

                <td className="px-4 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {formatDate(tx.date)}
                </td>

                <td className="px-4 py-4 text-right whitespace-nowrap">
                    <span className={`font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}>
                        {isExpense ? "-" : "+"} ₹{Math.abs(tx.amount)}
                    </span>
                </td>

                <td className="px-4 py-4">
                    <TypeIcon type={tx.type}/>
                </td>

                <td
                    className={`px-4 py-4 ${editMode ? "cursor-pointer hover:underline" : ""}`}
                    onClick={() => {

                        if (!editMode) return;

                        const normalizedSub = tx.subcategory ?? tx.sub_category;
                        const validSubs = getSubcategories(tx.category);

                        const safeSub = validSubs.includes(normalizedSub)
                            ? normalizedSub
                            : validSubs[0] || "";

                        setActiveTx({
                            ...tx,
                            subcategory: safeSub
                        });

                    }}
                >
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {tx.category}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {tx.subcategory}
                    </div>
                </td>

                <td className="px-4 py-4 text-sm text-gray-800 dark:text-gray-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <PaymentModeIcon mode={tx.mode} />
                        <span>{tx.mode}</span>
                    </div>
                </td>

                <td className="px-4 py-4 text-sm text-gray-800 dark:text-gray-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <BankIcon bank={tx.bank} />
                        <span>{tx.bank}</span>
                    </div>
                </td>

                <td className="px-4 py-4">

                    {editMode ? (

                        <input
                            type="text"
                            value={tx.remarks || ""}
                            onChange={(e) => {

                                const value = e.target.value;

                                setTransactions(prev =>
                                    prev.map(t =>
                                        t.id === tx.id ? { ...t, remarks: value } : t
                                    )
                                );

                            }}
                            onBlur={async (e) => {

                                const value = e.target.value;

                                await fetch(`http://localhost:5000/api/transactions/${tx.id}/remarks`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ remarks: value })
                                });

                            }}
                            className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800 text-sm"
                        />

                    ) : (

                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            {tx.remarks || "-"}
                        </div>

                    )}

                </td>

                {/* Description + Delete */}
                <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-between gap-2">

                        <span>{tx.description || "-"}</span>

                        {canDelete && onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(true); // ✅ open modal
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="Delete transaction"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}

                    </div>
                </td>

            </tr>

            {/* ✅ DELETE CONFIRM MODAL */}
            {showDeleteConfirm && createPortal(
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl p-6 w-80 space-y-4 shadow-lg">

                        <h2 className="text-lg font-semibold">
                            Delete Transaction?
                        </h2>

                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete this transaction?
                        </p>

                        <div className="flex justify-end gap-3 pt-2">

                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border rounded-md
                               bg-white text-gray-800
                               dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600
                               hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    onDelete(tx.id);
                                    setShowDeleteConfirm(false);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                </div>,
                document.body   // ✅ THIS FIXES EVERYTHING
            )}
        </>
    );
}