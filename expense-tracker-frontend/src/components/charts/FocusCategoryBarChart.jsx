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

// ✅ Tooltip
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

// ✅ Label (₹ on top)
const renderLabel = ({ x, y, width, value }) => {
    return (
        <text
            x={x + width / 2}
            y={y - 6}
            textAnchor="middle"
            fill="#6b7280"
            fontSize={11}
        >
            {formatCurrency(value)}
        </text>
    );
};

export default function FocusCategoryBarChart({ data = [] }) {

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No data
            </div>
        );
    }

    // ✅ Sort descending
    const sorted = [...data].sort((a, b) => b.value - a.value);

    // ✅ Top 7 + Others
    const top = sorted.slice(0, 7);
    const others = sorted.slice(7);

    const othersValue = others.reduce((sum, d) => sum + d.value, 0);

    const finalData = [
        ...top,
        ...(othersValue > 0
            ? [{ name: "Others", value: othersValue }]
            : []),
    ];

    // ✅ Generate colors based on FINAL data
    const generateColors = (count) => {
        return Array.from({ length: count }, (_, i) => {
            const hue = Math.round((360 / count) * i);
            return `hsl(${hue}, 40%, 55%)`;
        });
    };

    const colors = generateColors(finalData.length);

    const coloredData = finalData.map((item, index) => ({
        ...item,
        fill: colors[index],
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={coloredData}
                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
            >
                <XAxis
                    dataKey="name"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                />

                <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={(val) => formatCurrency(val)}
                    axisLine={false}
                    tickLine={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    barSize={28}
                    isAnimationActive={false}
                    label={renderLabel}
                >
                    {coloredData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}