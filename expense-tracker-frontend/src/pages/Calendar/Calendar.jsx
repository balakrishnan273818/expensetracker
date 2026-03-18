import { useState } from "react";
import CalendarGrid from "../../components/calendar/CalendarGrid";
import useTransactions from "../../hooks/useTransactions";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendar() {

    const { transactions } = useTransactions();

    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const schedules = [];

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

    return (

        <div className="space-y-6 w-full">

            <div className="flex items-center justify-between">

                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Calendar
                </h1>

                <div className="flex items-center gap-3">

                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>

                    <span className="font-medium text-gray-800 dark:text-gray-100">
                        {monthNames[month]} {year}
                    </span>

                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>

                </div>

            </div>

            <CalendarGrid
                year={year}
                month={month}
                transactions={transactions}
                schedules={schedules}
            />

        </div>

    );
}
