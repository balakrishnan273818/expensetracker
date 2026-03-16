import { formatCurrency } from "../../utils/currency";

export default function BudgetCard({ category, spent = 0, limit = 0 }) {
    const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">

            <div className="flex justify-between items-center mb-3">

                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {category}
                </h3>

                <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </span>

            </div>

            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded">

                <div
                    className={`h-2 rounded ${
                        percent > 90
                            ? "bg-red-500"
                            : percent > 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                    }`}
                    style={{ width: `${percent}%` }}
                />

            </div>

        </div>
    );
}
