import { parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getStartDay(year, month) {
    return new Date(year, month, 1).getDay();
}

export default function CalendarGrid({
                                         year,
                                         month,
                                         transactions = [],
                                         schedules = []
                                     }) {
    const navigate = useNavigate(); // ✅ NEW

    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getStartDay(year, month);

    const days = [];

    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        days.push(d);
    }

    const dailyTotals = {};
    const scheduleTotals = {};

    // ✅ Aggregation (income / expense / investment)
    transactions.forEach((tx) => {
        const date = parseISO(tx.date);

        if (date.getMonth() === month && date.getFullYear() === year) {
            const day = date.getDate();

            if (!dailyTotals[day]) {
                dailyTotals[day] = {
                    income: 0,
                    expense: 0,
                    investment: 0,
                };
            }

            if (tx.type === "income") {
                dailyTotals[day].income += tx.amount;
            }

            if (tx.type === "expense") {
                const amount = Math.abs(tx.amount);

                const isInvestment =
                    tx.category?.toLowerCase().includes("invest") ||
                    tx.sub_category?.toLowerCase().includes("sip") ||
                    tx.sub_category?.toLowerCase().includes("mutual");

                if (isInvestment) {
                    dailyTotals[day].investment += amount;
                } else {
                    dailyTotals[day].expense += amount;
                }
            }
        }
    });

    schedules.forEach((sch) => {
        const date = parseISO(sch.date);

        if (date.getMonth() === month && date.getFullYear() === year) {
            const day = date.getDate();
            scheduleTotals[day] =
                (scheduleTotals[day] || 0) + sch.amount;
        }
    });

    // ✅ NEW: Click handler
    const handleDayClick = (day) => {
        if (!day) return;

        const monthStr = String(month + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");

        const date = `${year}-${monthStr}-${dayStr}`;

        navigate(`/transactions?date=${date}`);
    };

    return (
        <div className="grid grid-cols-7 gap-2">

            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                    key={d}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 pb-2"
                >
                    {d}
                </div>
            ))}

            {days.map((day, index) => {
                const totals = dailyTotals[day] || {};

                return (
                    <div
                        key={index}
                        onClick={() => handleDayClick(day)} // ✅ NEW
                        className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg h-28 p-2 flex flex-col justify-between hover:shadow-md transition"
                    >
                        {day && (
                            <>
                                <div className="flex justify-between items-start">

                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        {day}
                                    </span>

                                    {scheduleTotals[day] && (
                                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">
                                            {formatCurrency(scheduleTotals[day])}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 text-xs font-medium items-end">

                                    {totals.income > 0 && (
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
                                            + {formatCurrency(totals.income)}
                                        </span>
                                    )}

                                    {totals.investment > 0 && (
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                                            {formatCurrency(totals.investment)}
                                        </span>
                                    )}

                                    {totals.expense > 0 && (
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md font-semibold">
                                            - {formatCurrency(totals.expense)}
                                        </span>
                                    )}

                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}