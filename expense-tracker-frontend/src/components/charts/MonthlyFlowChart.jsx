import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import { formatCurrency } from "../../utils/currency";

export default function MonthlyFlowChart({ data = [] }) {

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No data
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>

                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.2} />

                <XAxis
                    dataKey="month"
                    tick={{ fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                />

                <YAxis
                    tick={{ fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                />

                <Tooltip
                    formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        name === "income" ? "Income" :
                            name === "expense" ? "Expense" :
                                "Investment"
                    ]}
                    cursor={{ fill: "rgba(156,163,175,0.1)" }}
                />

                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="investment" fill="#3b82f6" radius={[4, 4, 0, 0]} />

            </BarChart>
        </ResponsiveContainer>
    );
}