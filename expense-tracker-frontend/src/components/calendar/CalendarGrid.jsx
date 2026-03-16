import { formatCurrency } from "../../utils/currency";

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getStartDay(year, month) {
    return new Date(year, month, 1).getDay();
}

export default function CalendarGrid({ year, month, transactions = [], schedules = [] }) {
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

    transactions.forEach((tx) => {
        const date = new Date(tx.date);

        if (date.getMonth() === month && date.getFullYear() === year) {
            const day = date.getDate();

            if (!dailyTotals[day]) {
                dailyTotals[day] = {
                    income: 0,
                    expense: 0,
                    investment: 0,
                };
            }

            dailyTotals[day][tx.type] += tx.amount;
        }
    });

    schedules.forEach((sch) => {
        const date = new Date(sch.date);

        if (date.getMonth() === month && date.getFullYear() === year) {
            const day = date.getDate();
            scheduleTotals[day] = (scheduleTotals[day] || 0) + sch.amount;
        }
    });

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

                const categories = [
                    totals.expense > 0 ? "expense" : null,
                    totals.income > 0 ? "income" : null,
                    totals.investment > 0 ? "investment" : null,
                ].filter(Boolean);

                const singleCategory = categories.length === 1;

                return (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg h-28 p-2 flex flex-col justify-between"
                    >
                        {day && (
                            <>
                                <div className="flex justify-between items-start">

                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {day}
                  </span>

                                    {scheduleTotals[day] && (
                                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-200 text-right">
                      {formatCurrency(scheduleTotals[day])}
                    </span>
                                    )}

                                </div>

                                {!singleCategory && (
                                    <div className="flex flex-col gap-1 text-xs font-medium items-end">

                                        {totals.expense > 0 && (
                                            <span className="text-red-500 text-right">
                        - {formatCurrency(totals.expense)}
                      </span>
                                        )}

                                        {totals.income > 0 && (
                                            <span className="text-green-600 text-right">
                        + {formatCurrency(totals.income)}
                      </span>
                                        )}

                                        {totals.investment > 0 && (
                                            <span className="text-blue-600 text-right">
                        {formatCurrency(totals.investment)}
                      </span>
                                        )}

                                    </div>
                                )}

                                {singleCategory && (
                                    <div className="text-xs font-medium self-end text-right">

                                        {totals.expense > 0 && (
                                            <span className="text-red-500">
                        - {formatCurrency(totals.expense)}
                      </span>
                                        )}

                                        {totals.income > 0 && (
                                            <span className="text-green-600">
                        + {formatCurrency(totals.income)}
                      </span>
                                        )}

                                        {totals.investment > 0 && (
                                            <span className="text-blue-600">
                        {formatCurrency(totals.investment)}
                      </span>
                                        )}

                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            })}

        </div>
    );
}
