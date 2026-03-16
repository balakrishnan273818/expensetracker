import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

export default function MonthlyFlowChart({ data = [] }) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 h-[350px]">

            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Monthly Cash Flow
            </h2>

            <ResponsiveContainer width="100%" height="85%">
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
                        formatter={(value) => `₹${value}`}
                        contentStyle={{
                            backgroundColor: "var(--tooltip-bg)",
                            border: "none",
                            borderRadius: "8px",
                            color: "var(--tooltip-text)"
                        }}
                    />

                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />

                </BarChart>
            </ResponsiveContainer>

        </div>
    );
}
