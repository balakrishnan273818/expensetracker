import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/currency";
import { memo } from "react";

const RADIAN = Math.PI / 180;

// 🔥 Dynamic color generator (unique colors)
const generateColors = (count) => {
    return Array.from({ length: count }, (_, i) => {
        const hue = Math.round((360 / count) * i);
        return `hsl(${hue}, 65%, 55%)`;
    });
};

// 🔥 Custom Tooltip
const CustomTooltip = memo(({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const { name, value, color } = payload[0];

    return (
        <div className="bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-md">
            <div className="flex items-center gap-2 mb-1">
                <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {name}
                </span>
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {formatCurrency(Number(value))}
            </div>
        </div>
    );
});

// 🔥 Label renderer (supports semi + full)
const renderCustomLabel = (semi) => (props) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = props;

    //if (percent < 0.01) return null;

    const radius = outerRadius + (outerRadius * (semi ? 0.2 : 0.25));

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="#9ca3af"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
            className="text-xs"
        >
            {`${name}, ${(percent * 100).toFixed(2)}%`}
        </text>
    );
};

export default function ExpensePieChart({ data = [], semi = false }) {

    const total = data.reduce((sum, d) => sum + Number(d.value || 0), 0);

    // ✅ Generate unique colors
    const colors = generateColors(data.length);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No data
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>

                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"

                    cx="50%"
                    cy={semi ? "75%" : "50%"}

                    innerRadius={semi ? "75%" : "55%"}
                    outerRadius={semi ? "120%" : "80%"}

                    startAngle={semi ? 180 : 0}
                    endAngle={semi ? 0 : 360}

                    paddingAngle={2}

                    label={renderCustomLabel(semi)}
                    labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}

                    isAnimationActive={false}
                    activeShape={false}
                >
                    {data.map((entry, index) => {
                        const name = entry.name.toLowerCase();

                        return (
                            <Cell
                                key={index}
                                fill={
                                    name.includes("expense")
                                        ? "#ef4444"       // 🔴 Expense
                                        : name.includes("investment")
                                            ? "#3b82f6"       // 🔵 Investment
                                            : colors[index]   // 🎨 Unique colors
                                }
                            />
                        );
                    })}
                </Pie>

                {/* 🔥 CENTER VALUE */}
                <text
                    x="50%"
                    y={semi ? "70%" : "50%"}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-lg font-semibold fill-gray-800 dark:fill-gray-100"
                >
                    {formatCurrency(total)}
                </text>

                {!semi && (
                    <text
                        x="50%"
                        y="60%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-gray-500 dark:fill-gray-400"
                    >
                        Total
                    </text>
                )}

                <Tooltip content={<CustomTooltip />} cursor={false} />

            </PieChart>
        </ResponsiveContainer>
    );
}