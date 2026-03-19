import { ChevronLeft, ChevronRight } from "lucide-react";

const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

export default function PageHeader({
                                       title,
                                       year,
                                       month,            // 0–11
                                       setYear,
                                       setMonth,
                                       actions = null,   // optional right-side extra actions
                                   }) {

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
        <div className="flex items-center justify-between">

            {/* Left */}
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    {title}
                </h1>
                {actions}
            </div>

            {/* Right - Month Navigator (UNCHANGED UI) */}
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
    );
}