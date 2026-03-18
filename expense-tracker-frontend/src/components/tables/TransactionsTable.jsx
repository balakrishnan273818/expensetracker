import { formatCurrency } from "../../utils/currency";
import { categoryMap } from "../../utils/categories";
import { formatDate } from "../../utils/date";

export default function TransactionsTable({ transactions = [], onSelect }) {
    //console.log("TransactionsTable rendered");
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">

            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Recent Transactions
            </h2>

            <table className="w-full text-sm">

                <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                    <th className="text-left py-2">Category</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-right py-2">Amount</th>
                </tr>
                </thead>

                <tbody>

                {transactions.map((tx) => {

                    const category =
                        categoryMap[tx.category?.toLowerCase()] || categoryMap.other;

                    const Icon = category.icon;

                    return (

                        <tr
                            key={tx.id}
                            className="border-b border-gray-200 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => onSelect?.(tx)}
                        >

                            {/* Category */}

                            <td className="py-3">

                                <div className="flex items-center gap-2">

                                    <div className={`p-2 rounded-md ${category.color}`}>
                                        <Icon size={14} />
                                    </div>

                                    <span className="text-gray-800 dark:text-gray-100">
                      {category.label}
                    </span>

                                </div>

                            </td>

                            {/* Description */}

                            <td className="text-gray-700 dark:text-gray-200">
                                {tx.description}
                            </td>

                            {/* Date */}

                            <td className="text-gray-500 dark:text-gray-400">
                                {formatDate(tx.date)}
                            </td>

                            {/* Amount */}

                            <td
                                className={`text-right font-medium ${
                                    tx.type === "expense"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-green-600 dark:text-green-400"
                                }`}
                            >

                                {tx.type === "expense" ? "-" : "+"}

                                {formatCurrency(Math.abs(tx.amount))}

                            </td>

                        </tr>

                    );

                })}

                </tbody>

            </table>

        </div>
    );
}
