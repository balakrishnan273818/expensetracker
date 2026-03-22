import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { formatCurrency } from "../../utils/currency";
import { memo } from "react";

// ✅ Consistent color palette
const generateColors = (count) => {
    return Array.from({ length: count }, (_, i) => {
        const hue = Math.round((360 / count) * i);
        return `hsl(${hue}, 40%, 55%)`;
    });
};

// ✅ Tooltip (same as other charts)
const CustomTooltip = memo(({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const { name, value, fill } = payload[0].payload;

    return (
        <div className="bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-md">
            <div className="flex items-center gap-2 mb-1">
                <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: fill }}
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

// ✅ Label (₹ only)
const renderCustomLabel = ({ x, y, width, height, value }) => {
    return (
        <text
            x={x + width + 8}
            y={y + height / 2}
            fill="#6b7280"
            fontSize={11}
            dominantBaseline="middle"
        >
            {formatCurrency(value)}
        </text>
    );
};

export default function OutflowBarChart({ data = [] }) {

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No data
            </div>
        );
    }

    // ✅ Sort descending (critical)
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    const colors = generateColors(sortedData.length);

    const processedData = sortedData.map((item, index) => ({
        ...item,
        fill: colors[index],
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={processedData}
                layout="vertical"
                margin={{ top: 10, right: 70, left: 10, bottom: 10 }}
            >
                {/* X Axis */}
                <XAxis
                    type="number"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={(val) => formatCurrency(val)}
                    axisLine={false}
                    tickLine={false}
                />

                {/* Y Axis */}
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    width={120}
                    axisLine={false}
                    tickLine={false}
                />

                {/* Tooltip */}
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                />

                {/* Bars */}
                <Bar
                    dataKey="value"
                    radius={[6, 6, 6, 6]}
                    barSize={18}
                    isAnimationActive={false}
                    label={renderCustomLabel}
                >
                    {processedData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}