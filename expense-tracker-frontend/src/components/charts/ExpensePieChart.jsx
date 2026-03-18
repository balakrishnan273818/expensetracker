import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/currency";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ExpensePieChart({ data = [] }) {

    const renderLabel = ({ percent }) => {
        return `${(percent * 100).toFixed(0)}%`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 h-[450px]">

            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Expense Breakdown
            </h2>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={140}
                        label={renderLabel}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={(value, name) => [
                            formatCurrency(Number(value)),
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