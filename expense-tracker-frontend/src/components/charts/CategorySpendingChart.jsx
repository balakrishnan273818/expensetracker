import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/currency";

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

    // ✅ CLEAN + SORT + GROUP SMALL VALUES
    const processedData = (() => {

        if (!data || data.length === 0) return [];

        // sort descending
        const sorted = [...data].sort((a, b) => b.amount - a.amount);

        // group very small categories
        const threshold = sorted.reduce((s, d) => s + d.amount, 0) * 0.03; // 3%

        const main = [];
        let othersTotal = 0;

        sorted.forEach(item => {
            if (item.amount < threshold) {
                othersTotal += item.amount;
            } else {
                main.push(item);
            }
        });

        if (othersTotal > 0) {
            main.push({ category: "Others", amount: othersTotal });
        }

        return main;

    })();

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 h-[320px]">

            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Category Spending
            </h2>

            <ResponsiveContainer width="100%" height="85%">
                <PieChart>

                    <Pie
                        data={processedData}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                    >
                        {processedData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={(value, name) => [
                            formatCurrency(Number(value)), // ✅ consistent formatting
                            name
                        ]}
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