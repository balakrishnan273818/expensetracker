import { formatCurrency } from "../../utils/currency"
import { categoryMap } from "../../utils/categories"

export default function CategoryBreakdownCard({ data }) {

    const total = data.reduce((sum, item) => sum + item.amount, 0)

    return (
        <div className="bg-white rounded-xl shadow-sm p-5">

            <h2 className="text-lg font-semibold mb-4">
                Top Spending Categories
            </h2>

            <div className="space-y-4">

                {data.map((item, index) => {
                    const category = categoryMap[item.category] || categoryMap.other
                    const Icon = category.icon
                    const percentage = (item.amount / total) * 100

                    return (
                        <div key={index}>

                            {/* Row */}
                            <div className="flex items-center justify-between mb-1">

                                <div className="flex items-center gap-2">

                                    <div className={`p-2 rounded-md ${category.color}`}>
                                        <Icon size={14} />
                                    </div>

                                    <span className="text-sm font-medium">
                    {category.label}
                  </span>

                                </div>

                                <span className="text-sm text-gray-600">
                  {formatCurrency(item.amount)}
                </span>

                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2">

                                <div
                                    className="h-2 rounded-full bg-blue-500"
                                    style={{ width: `${percentage}%` }}
                                />

                            </div>

                        </div>
                    )
                })}

            </div>

        </div>
    )
}