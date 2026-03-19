import { useState } from "react";
import CalendarGrid from "../../components/calendar/CalendarGrid";
import useTransactions from "../../hooks/useTransactions";
import PageHeader from "../../components/common/PageHeader";
import { useMonth } from "../../context/MonthContext";

export default function Calendar() {

    const { transactions } = useTransactions();

    const { year, month, setYear, setMonth } = useMonth();
    /*const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());*/

    const schedules = [];

    return (

        <div className="space-y-6 w-full">

            {/* Reusable Header */}
            <PageHeader
                title="Calendar"
                year={year}
                month={month}
                setYear={setYear}
                setMonth={setMonth}
            />

            {/* Calendar Grid */}
            <CalendarGrid
                year={year}
                month={month}
                transactions={transactions}
                schedules={schedules}
            />

        </div>

    );
}