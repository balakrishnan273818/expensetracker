import { useState } from "react";
import DailySummaryTable from "../../components/tables/DailySummaryTable";
import { formatCurrency } from "../../utils/currency";
import useTransactions from "../../hooks/useTransactions";

export default function DailySummary() {

    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const { transactions, loading } = useTransactions();

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    function prevMonth() {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    }

    function nextMonth() {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    }

    const monthlyTransactions = transactions.filter((tx) => {
        const d = new Date(tx.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const totalMonthlyExpense = monthlyTransactions
        .filter((tx) => tx.type === "expense" || tx.type === "investment")
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const daysSet = new Set(
        monthlyTransactions.map((tx) => new Date(tx.date).getDate())
    );

    const totalDaysWithSpending = daysSet.size;

    const avgDailySpending =
        totalDaysWithSpending > 0
            ? totalMonthlyExpense / totalDaysWithSpending
            : 0;

    return (

        <div className="space-y-6 w-full">

            <div className="flex justify-between items-center">

                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Daily Summary - {monthNames[month]} {year}
                </h1>

                <div className="flex gap-2">

                    <button
                        onClick={prevMonth}
                        className="px-3 py-1 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
                    >
                        ◀
                    </button>

                    <button
                        onClick={nextMonth}
                        className="px-3 py-1 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
                    >
                        ▶
                    </button>

                </div>

            </div>

            {loading && (
                <div className="text-gray-500">Loading data...</div>
            )}

            {!loading && (

                <>
                    <DailySummaryTable
                        year={year}
                        month={month}
                        transactions={transactions}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Total Days with Spending
                            </div>
                            <div className="text-2xl font-semibold mt-2">
                                {totalDaysWithSpending}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Average Daily Spending
                            </div>
                            <div className="text-2xl font-semibold mt-2">
                                {formatCurrency(avgDailySpending)}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Total Monthly Expenses
                            </div>
                            <div className="text-2xl font-semibold mt-2 text-red-500">
                                {formatCurrency(totalMonthlyExpense)}
                            </div>
                        </div>

                    </div>
                </>

            )}

        </div>
    );
}
