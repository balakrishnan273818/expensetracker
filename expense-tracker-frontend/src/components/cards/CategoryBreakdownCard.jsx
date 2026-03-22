import { formatCurrency } from "../../utils/currency";
import { categoryMap } from "../../utils/categories";

export default function CategoryBreakdownCard({ data = [], isBudgetView = false }) {

    const total = !isBudgetView
        ? data.reduce((sum, item) => sum + item.amount, 0)
        : 0;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">

            <div className="space-y-4">

                {data.map((item, index) => {

                    const category =
                        categoryMap[item.category?.toLowerCase()] || categoryMap.other;

                    const Icon = category.icon;

                    // 🔥 BUDGET MODE
                    if (isBudgetView) {

                        const budget = item.budget || 0;
                        const actual = item.actual || 0;

                        const percentage =
                            budget > 0 ? (actual / budget) * 100 : 0;

                        const clampedPercentage = Math.min(percentage, 100);

                        const isOver = actual > budget;

                        let colorClass = "text-green-600";
                        if (percentage > 100) colorClass = "text-red-500";
                        else if (percentage > 80) colorClass = "text-yellow-500";

                        return (
                            <div key={index}>

                                {/* Row */}
                                <div className="flex items-center justify-between mb-1">

                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-md ${category.color}`}>
                                            <Icon size={14} />
                                        </div>

                                        {/* ✅ FIX: % added here */}
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                            {category.label}
                                            <span className={`ml-1 text-xs ${colorClass}`}>
                                                ({percentage.toFixed(0)}%)
                                            </span>
                                        </span>
                                    </div>

                                    <div className={`text-sm font-medium ${colorClass}`}>
                                        {formatCurrency(actual)} / {formatCurrency(budget)}
                                    </div>

                                </div>

                                {/* Progress */}
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">

                                    <div
                                        className={`h-2 rounded-full ${
                                            isOver
                                                ? "bg-red-500"
                                                : percentage > 80
                                                    ? "bg-yellow-500"
                                                    : "bg-green-500"
                                        }`}
                                        style={{ width: `${clampedPercentage}%` }}
                                    />

                                </div>

                            </div>
                        );
                    }

                    // 🔹 DEFAULT MODE
                    const percentage = total > 0 ? (item.amount / total) * 100 : 0;

                    return (
                        <div key={index}>

                            <div className="flex items-center justify-between mb-1">

                                <div className="flex items-center gap-2">

                                    <div className={`p-2 rounded-md ${category.color}`}>
                                        <Icon size={14} />
                                    </div>

                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        {category.label}
                                        <span className="ml-1 text-xs text-gray-500">
                                            ({percentage.toFixed(0)}%)
                                        </span>
                                    </span>

                                </div>

                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {formatCurrency(item.amount)}
                                </span>

                            </div>

                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">

                                <div
                                    className="h-2 rounded-full bg-blue-500 dark:bg-blue-400"
                                    style={{ width: `${percentage}%` }}
                                />

                            </div>

                        </div>
                    );

                })}

            </div>

        </div>
    );
}