import { useState } from "react";
import { formatCurrency } from "../../utils/currency";
import { getCategoryMeta } from "../../utils/categories";

export default function DailySummaryTable({ year, month, transactions = [] }) {

    const CATEGORY_ORDER = [
        "Food",
        "Groceries",
        "Bills",
        "Allowances",
        "Investments",
        "Travel",
        "Shopping",
        "Entertainment",
        "Others",
    ];

    const [hoveredCol, setHoveredCol] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null);

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const filtered = transactions.filter((tx) => {
        const d = new Date(tx.date);
        return (
            (tx.type === "expense" || tx.type === "investment") &&
            d.getFullYear() === year &&
            d.getMonth() === month
        );
    });

    let categories = [...new Set(filtered.map((t) => t.category))];

    if (!categories.includes("Investments")) {
        categories.push("Investments");
    }

    categories = categories.sort((a, b) => {
        const indexA = CATEGORY_ORDER.indexOf(a);
        const indexB = CATEGORY_ORDER.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const data = {};

    filtered.forEach((tx) => {
        const day = new Date(tx.date).getDate();
        if (!data[day]) data[day] = {};
        if (!data[day][tx.category]) data[day][tx.category] = 0;
        data[day][tx.category] += Math.abs(tx.amount);
    });

    function dayTotal(day) {
        if (!data[day]) return 0;
        return Object.values(data[day]).reduce((a, b) => a + b, 0);
    }

    function categoryTotal(cat) {
        let total = 0;
        Object.values(data).forEach((d) => {
            if (d[cat]) total += d[cat];
        });
        return total;
    }

    const monthlyTotal = Object.values(data)
        .flatMap((d) => Object.values(d))
        .reduce((a, b) => a + b, 0);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-auto max-h-[calc(100vh-280px)]">

            <table className="w-full text-sm min-w-[800px]">

                {/* HEADER */}
                <thead className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
                <tr>

                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 sticky left-0 bg-white dark:bg-gray-900 z-30">
                        Date
                    </th>

                    {categories.map((c, colIndex) => {
                        const meta = getCategoryMeta(c);
                        const Icon = meta.icon;

                        return (
                            <th
                                key={c}
                                onMouseEnter={() => setHoveredCol(colIndex)}
                                onMouseLeave={() => setHoveredCol(null)}
                                className={`px-4 py-3 text-left transition
                                        ${colIndex !== 0 ? "border-l border-gray-100 dark:border-gray-800" : ""}
                                        ${hoveredCol === colIndex ? "bg-gray-100 dark:bg-gray-800" : ""}
                                    `}
                            >
                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                                    style={{
                                        backgroundColor: `${meta.color}15`,
                                        color: meta.color,
                                    }}
                                >
                                    <Icon size={14} />
                                    {meta.label}
                                </div>
                            </th>
                        );
                    })}

                    <th className="px-4 py-3 text-right text-sm font-semibold text-purple-600 dark:text-purple-300">
                        Total
                    </th>

                </tr>
                </thead>

                {/* BODY */}
                <tbody>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const total = dayTotal(day);
                    const dateObj = new Date(year, month, day);

                    return (
                        <tr
                            key={day}
                            onMouseEnter={() => setHoveredRow(day)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className="border-b border-gray-100 dark:border-gray-800 transition"
                        >

                            {/* DATE */}
                            <td
                                className={`px-4 py-3 whitespace-nowrap sticky left-0 z-10
                                        ${hoveredRow === day ? "bg-gray-50 dark:bg-gray-800/60" : "bg-white dark:bg-gray-900"}
                                    `}
                            >
                                <div className="flex items-center justify-center gap-2 font-medium text-gray-800 dark:text-gray-100">
                                        <span className="w-[36px] text-gray-500 dark:text-gray-400">
                                            {dateObj.toLocaleDateString("en-US", { weekday: "short" })}
                                        </span>
                                    <span className="tabular-nums">
                                            {dateObj.toLocaleDateString("en-US", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                </div>
                            </td>

                            {categories.map((cat, colIndex) => {
                                const value = data[day]?.[cat];

                                return (
                                    <td
                                        key={cat}
                                        onMouseEnter={() => setHoveredCol(colIndex)}
                                        onMouseLeave={() => setHoveredCol(null)}
                                        className={`px-4 py-3 text-right transition
                                                ${hoveredCol === colIndex
                                            ? "bg-gray-100 dark:bg-gray-800"
                                            : hoveredRow === day
                                                ? "bg-gray-50 dark:bg-gray-800/60"
                                                : ""}
                                            `}
                                    >
                                        {value ? (
                                            <span className="font-medium tabular-nums">
                                                    {formatCurrency(value)}
                                                </span>
                                        ) : (
                                            <span className="text-gray-300 dark:text-gray-600">—</span>
                                        )}
                                    </td>
                                );
                            })}

                            <td className="px-4 py-3 text-right">
                                {total ? (
                                    <span className="font-semibold text-purple-600 dark:text-purple-300 tabular-nums">
                                            {formatCurrency(total)}
                                        </span>
                                ) : (
                                    <span className="text-gray-300 dark:text-gray-600">—</span>
                                )}
                            </td>

                        </tr>
                    );
                })}

                {/* FOOTER */}
                <tr className="bg-purple-100 dark:bg-purple-900 font-semibold sticky bottom-0 z-30 shadow-[0_-2px_8px_rgba(0,0,0,0.25)]">

                    <td className="px-4 py-3 text-purple-700 dark:text-purple-300 sticky left-0 bg-purple-100 dark:bg-purple-900">
                        Total
                    </td>

                    {categories.map((cat) => (
                        <td key={cat} className="px-4 py-3 text-right text-purple-700 dark:text-purple-300 tabular-nums">
                            {formatCurrency(categoryTotal(cat))}
                        </td>
                    ))}

                    <td className="px-4 py-3 text-right text-purple-800 dark:text-purple-200 text-base font-bold tabular-nums">
                        {formatCurrency(monthlyTotal)}
                    </td>

                </tr>

                </tbody>

            </table>

        </div>
    );
}