import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

export default function DailySummaryTable({ year, month, transactions = [] }) {
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

    categories = categories.sort();

    const data = {};

    filtered.forEach((tx) => {
        const day = new Date(tx.date).getDate();

        if (!data[day]) {
            data[day] = {};
        }

        if (!data[day][tx.category]) {
            data[day][tx.category] = 0;
        }

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

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function formatDayLabel(day) {
        const date = new Date(year, month, day);
        const weekday = weekdays[date.getDay()];
        return `${String(day).padStart(2, "0")}-${weekday}`;
    }

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-auto max-h-[600px]">

            <table className="w-full text-sm">

                <thead className="bg-gray-50 dark:bg-gray-700 border-b text-gray-600 dark:text-gray-200 sticky top-0 z-10">
                <tr>

                    <th className="px-3 py-2 text-left">Date</th>

                    {categories.map((c) => (
                        <th key={c} className="px-3 py-2 text-left">
                            {c}
                        </th>
                    ))}

                    <th className="px-3 py-2 text-right bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-semibold">
                        Day Total
                    </th>

                </tr>
                </thead>

                <tbody>

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const total = dayTotal(day);

                    return (
                        <tr
                            key={day}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >

                            <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-100">
                                {formatDayLabel(day)}
                            </td>

                            {categories.map((cat) => {
                                const value = data[day]?.[cat];

                                return (
                                    <td
                                        key={cat}
                                        className="px-3 py-2 text-gray-800 dark:text-gray-200"
                                    >
                                        {value ? formatCurrency(value) : "-"}
                                    </td>
                                );
                            })}

                            <td className="px-3 py-2 text-right bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-semibold">
                                {total ? formatCurrency(total) : "-"}
                            </td>

                        </tr>
                    );
                })}

                <tr className="bg-purple-100 dark:bg-purple-900/40 font-semibold">

                    <td className="px-3 py-2 text-purple-800 dark:text-purple-300">
                        Category Total
                    </td>

                    {categories.map((cat) => (
                        <td key={cat} className="px-3 py-2 text-purple-800 dark:text-purple-300">
                            {formatCurrency(categoryTotal(cat))}
                        </td>
                    ))}

                    <td className="px-3 py-2 text-right text-purple-900 dark:text-purple-200 font-bold">
                        {formatCurrency(monthlyTotal)}
                    </td>

                </tr>

                </tbody>

            </table>

        </div>
    );
}
