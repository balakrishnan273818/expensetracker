import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#64748b"
];

export default function CategorySpendingChart({ data = [] }) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 h-[320px]">

            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Category Spending
            </h2>

            <ResponsiveContainer width="100%" height="85%">
                <PieChart>

                    <Pie
                        data={data}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={(value) => `₹${value}`}
                        contentStyle={{
                            backgroundColor: "var(--tooltip-bg)",
                            border: "none",
                            borderRadius: "8px",
                            color: "var(--tooltip-text)"
                        }}
                    />

                </PieChart>
            </ResponsiveContainer>

        </div>
    );
}
