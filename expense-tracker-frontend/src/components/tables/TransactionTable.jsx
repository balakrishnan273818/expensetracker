import { formatCurrency } from "../../utils/currency"
import { categoryMap } from "../../utils/categories"

export default function TransactionTable({ transactions }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5">

            <h2 className="text-lg font-semibold mb-4">
                Recent Transactions
            </h2>

            {/* Scroll Container */}
            <div className="max-h-80 overflow-y-auto">

                <table className="w-full text-sm">

                    <thead className="text-gray-500 border-b sticky top-0 bg-white">
                    <tr>
                        <th className="text-left py-2">Category</th>
                        <th className="text-left py-2">Description</th>
                        <th className="text-left py-2">Date</th>
                        <th className="text-right py-2">Amount</th>
                    </tr>
                    </thead>

                    <tbody>

                    {transactions.map((tx, index) => {
                        const category = categoryMap[tx.category] || categoryMap.other
                        const Icon = category.icon

                        return (
                            <tr key={index} className="border-b last:border-none hover:bg-gray-50">

                                {/* Category */}
                                <td className="py-3">
                                    <div className="flex items-center gap-2">

                                        <div className={`p-2 rounded-md ${category.color}`}>
                                            <Icon size={14} />
                                        </div>

                                        <span>{category.label}</span>

                                    </div>
                                </td>

                                {/* Description */}
                                <td>{tx.description}</td>

                                {/* Date */}
                                <td className="text-gray-500">{tx.date}</td>

                                {/* Amount */}
                                <td
                                    className={`text-right font-medium ${
                                        tx.type === "expense"
                                            ? "text-red-500"
                                            : "text-green-600"
                                    }`}
                                >
                                    {tx.type === "expense" ? "-" : "+"}
                                    {formatCurrency(tx.amount)}
                                </td>

                            </tr>
                        )
                    })}

                    </tbody>

                </table>

            </div>

        </div>
    )
}