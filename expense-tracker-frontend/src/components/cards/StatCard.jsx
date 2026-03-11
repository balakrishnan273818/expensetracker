import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function StatCard({ title, value, change, icon: Icon, positive = true }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">

            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{title}</span>

                {Icon && (
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon size={18} className="text-gray-600" />
                    </div>
                )}
            </div>

            {/* Value */}
            <div className="text-2xl font-semibold text-gray-800">
                {value}
            </div>

            {/* Change Indicator */}
            {change && (
                <div
                    className={`flex items-center text-sm ${
                        positive ? "text-green-600" : "text-red-600"
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
    )
}