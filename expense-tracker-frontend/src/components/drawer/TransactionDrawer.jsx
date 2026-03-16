import { X } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

export default function TransactionDrawer({
                                              open,
                                              transaction,
                                              categories = [],
                                              subcategories = {},
                                              onCategoryChange,
                                              onSubcategoryChange,
                                              onClose,
                                              onSave
                                          }) {
    if (!open || !transaction) return null;

    return (
        <div className="fixed inset-0 z-50 flex">

            <div
                className="flex-1 bg-black/30"
                onClick={onClose}
            />

            <div className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto shadow-xl">

                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Transaction Details
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="space-y-4">

                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                            {transaction.description}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="text-gray-800 dark:text-gray-100">
                            {formatDate(transaction.date)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>

                        <select
                            value={transaction.category}
                            onChange={(e) => onCategoryChange?.(transaction.id, e.target.value)}
                            className="w-full mt-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                        >
                            {categories.map((cat) => (
                                <option key={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Subcategory</p>

                        <select
                            value={transaction.subcategory}
                            onChange={(e) =>
                                onSubcategoryChange?.(transaction.id, e.target.value)
                            }
                            className="w-full mt-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                        >
                            {(subcategories[transaction.category] || []).map((sub) => (
                                <option key={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                            {formatCurrency(transaction.amount)}
                        </p>
                    </div>

                    <button
                        onClick={() => onSave?.()}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                        Save Changes
                    </button>

                </div>

            </div>

        </div>
    );
}
