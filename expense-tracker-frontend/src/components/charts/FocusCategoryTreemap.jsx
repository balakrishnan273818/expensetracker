import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "../../utils/currency";
import { memo } from "react";

// Tooltip
const CustomTooltip = memo(({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const { name, value, fill } = payload[0].payload;

    return (
        <div className="bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-md">
            <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fill }} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{name}</span>
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {formatCurrency(Number(value))}
            </div>
        </div>
    );
});

// Tile renderer
const CustomContent = ({ x, y, width, height, name, value, fill }) => {
    // ✅ snap to pixel grid
    const px = Math.round(x);
    const py = Math.round(y);

    if (width < 70 || height < 45) {
        return (
            <rect
                x={px}
                y={py}
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
                x={px}
                y={py}
                width={width}
                height={height}
                fill={fill}
                rx={6}
            />

            <text
                x={px + 10}
                y={py + 20}
                fill="#ffffff"
                fontSize={12}
                fontWeight={600}
                shapeRendering="crispEdges"
                textRendering="geometricPrecision"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
            >
                {name}
            </text>

            <text
                x={px + 10}
                y={py + 36}
                fill="#ffffff"
                fontSize={11}
                shapeRendering="crispEdges"
                textRendering="geometricPrecision"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
            >
                {formatCurrency(value)}
            </text>
        </g>
    );
};

export default function FocusCategoryTreemap({ data = [] }) {
    if (!data.length) {
        return <div className="flex items-center justify-center h-full text-sm text-gray-400">No data</div>;
    }

    const sorted = [...data].sort((a, b) => b.value - a.value);

    const generateColors = (count) =>
        Array.from({ length: count }, (_, i) => {
            const hue = Math.round((360 / count) * i);
            return `hsl(${hue}, 40%, 55%)`;
        });

    const colors = generateColors(sorted.length);

    const finalData = sorted.map((d, i) => ({
        ...d,
        fill: colors[i],
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <Treemap
                data={finalData}
                dataKey="value"
                stroke="rgba(255,255,255,0.4)"
                content={<CustomContent />}
            >
                <Tooltip content={<CustomTooltip />} />
            </Treemap>
        </ResponsiveContainer>
    );
}