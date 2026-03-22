import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "../../utils/currency";
import { memo } from "react";

const generateColors = (count) => {
    return Array.from({ length: count }, (_, i) => {
        const hue = Math.round((360 / count) * i);
        return `hsl(${hue}, 40%, 55%)`; // ✅ softer colors
    });
};

// ✅ SAME TOOLTIP (UNCHANGED)
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

// ✅ UPDATED CONTENT (NAME + % ONLY)
const CustomContent = (props) => {
    const { x, y, width, height, name, percent, fill } = props;

    if (width < 70 || height < 45) {
        return (
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                rx={6}
            />
        );
    }

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                rx={6}
            />

            <text
                x={x + 10}
                y={y + 20}
                fill="#ffffff"
                fillOpacity={1}          // ✅ force full opacity
                stroke="none"            // ✅ prevent weird blending
                fontSize={12}
                fontWeight={500}
            >
                {name}
            </text>

            <text
                x={x + 10}
                y={y + 36}
                fill="#ffffff"
                fillOpacity={1}
                stroke="none"
                fontSize={11}
            >
                {(percent * 100).toFixed(0)}%
            </text>
        </g>
    );
};

export default function ExpectedExpensesTreemap({ data = [] }) {

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No data
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);

    const colors = generateColors(data.length);

    // ✅ Attach percent + color
    const processedData = data.map((item, index) => ({
        ...item,
        fill: colors[index],
        percent: item.value / total,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <Treemap
                data={processedData}
                dataKey="value"
                stroke="currentColor"
                className="text-white dark:text-[#111827]"
                content={<CustomContent />}
                isAnimationActive={false}
            >
                <Tooltip content={<CustomTooltip />} cursor={false} />
            </Treemap>
        </ResponsiveContainer>
    );
}