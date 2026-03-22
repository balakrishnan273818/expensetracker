import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/currency";
import { memo } from "react";

const RADIAN = Math.PI / 180;

// 🔥 Dynamic unique colors
const generateColors = (count) => {
    return Array.from({ length: count }, (_, i) => {
        const hue = Math.round((360 / count) * i);
        return `hsl(${hue}, 65%, 55%)`;
    });
};

// ✅ Custom Tooltip
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

// ✅ Optimized label spacing
const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    //if (percent < 0.01) return null;

    const radius = outerRadius + (outerRadius * 0.15);

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
            {`${name}, ${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function InvestmentPieChart({ data = [] }) {

    const total = data.reduce((sum, d) => sum + Number(d.value || 0), 0);

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
                    cy="50%"

                    // 🔥 Bigger chart (less empty space)
                    innerRadius="60%"
                    outerRadius="90%"

                    // 🔥 Reduced padding (more usable area)
                    paddingAngle={2}

                    label={renderCustomLabel}
                    labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}

                    isAnimationActive={false}
                    activeShape={false}
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={colors[index]} />
                    ))}
                </Pie>

                {/* 🔥 CENTER VALUE */}
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-lg font-semibold fill-gray-800 dark:fill-gray-100"
                >
                    {formatCurrency(total)}
                </text>

                <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-gray-500 dark:fill-gray-400"
                >
                    Total
                </text>

                <Tooltip content={<CustomTooltip />} cursor={false} />

            </PieChart>
        </ResponsiveContainer>
    );
}