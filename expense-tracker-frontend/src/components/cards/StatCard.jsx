import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ title, value, change, icon: Icon, positive = true }) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 flex flex-col gap-3">

            {/* Header */}

            <div className="flex items-center justify-between">

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </span>

                {Icon && (
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                        <Icon
                            size={18}
                            className="text-gray-700 dark:text-gray-200"
                        />
                    </div>
                )}

            </div>

            {/* Value */}

            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
            </div>

            {/* Change */}

            {change && (
                <div
                    className={`flex items-center text-sm ${
                        positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                >
                    {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span className="ml-1">{change}</span>
                </div>
            )}

        </div>
    );
}
