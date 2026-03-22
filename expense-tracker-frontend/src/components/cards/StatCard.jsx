import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * StatCard Component
 *
 * Props:
 * - title: string → Card title
 * - value: string/number → Main metric value
 * - change: string → Optional change indicator (e.g. +5%)
 * - icon: Lucide icon component
 * - positive: boolean → For change indicator (green/red)
 * - variant: string → Controls color theme (income, expense, investment, balance)
 */
export default function StatCard({
                                     title,
                                     value,
                                     change,
                                     icon: Icon,
                                     positive = true,
                                     variant,
                                 }) {
    // ===============================
    // VARIANT COLOR STYLES
    // ===============================
    const variantStyles = {
        income: "text-green-600 dark:text-green-400",
        expense: "text-red-600 dark:text-red-400",
        investment: "text-blue-600 dark:text-blue-400",
        balance: "text-purple-600 dark:text-purple-400",
    };

    const valueColor = variantStyles[variant] || "text-gray-900 dark:text-white";
    const iconColor = variantStyles[variant] || "text-gray-700 dark:text-gray-200";

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 flex flex-col gap-3">

            {/* Header: Title + Icon */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {title}
                </span>

                {Icon && (
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                        <Icon size={18} className={iconColor} />
                    </div>
                )}
            </div>

            {/* Main Value */}
            <div className={`text-2xl font-semibold ${valueColor}`}>
                {value}
            </div>

            {/* Change Indicator (Optional) */}
            {change && (
                <div
                    className={`flex items-center text-sm ${
                        positive
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                    }`}
                >
                    {positive ? (
                        <ArrowUpRight size={16} />
                    ) : (
                        <ArrowDownRight size={16} />
                    )}
                    <span className="ml-1">{change}</span>
                </div>
            )}
        </div>
    );
}