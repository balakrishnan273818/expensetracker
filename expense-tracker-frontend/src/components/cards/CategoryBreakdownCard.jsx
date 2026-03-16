import { formatCurrency } from "../../utils/currency";
import { categoryMap } from "../../utils/categories";

export default function CategoryBreakdownCard({ data = [] }) {

    const total = data.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">

            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Top Spending Categories
            </h2>

            <div className="space-y-4">

                {data.map((item, index) => {

                    const category =
                        categoryMap[item.category?.toLowerCase()] || categoryMap.other;

                    const Icon = category.icon;
                    const percentage = total > 0 ? (item.amount / total) * 100 : 0;

                    return (

                        <div key={index}>

                            {/* Row */}

                            <div className="flex items-center justify-between mb-1">

                                <div className="flex items-center gap-2">

                                    <div className={`p-2 rounded-md ${category.color}`}>
                                        <Icon size={14} />
                                    </div>

                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {category.label}
                  </span>

                                </div>

                                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(item.amount)}
                </span>

                            </div>

                            {/* Progress */}

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
