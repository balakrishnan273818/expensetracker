import { X } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

export default function DayTransactionsModal({
                                                 open,
                                                 date,
                                                 transactions = [],
                                                 onClose
                                             }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className="relative w-[520px] max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-6">

                <div className="flex justify-between items-center mb-5">

                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Transactions • {formatDate(date)}
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="space-y-3">

                    {transactions.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No transactions for this day.
                        </p>
                    )}

                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                        >

                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                    {tx.description}
                                </p>

                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {tx.category} • {tx.subcategory}
                                </p>
                            </div>

                            <div
                                className={`text-sm font-semibold ${
                                    tx.type === "expense"
                                        ? "text-red-500"
                                        : "text-green-600"
                                }`}
                            >
                                {tx.type === "expense" ? "-" : "+"}
                                {formatCurrency(Math.abs(tx.amount))}
                            </div>

                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
}
