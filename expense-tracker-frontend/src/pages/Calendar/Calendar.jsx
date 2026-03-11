import { useState } from "react"
import CalendarGrid from "../../components/calendar/CalendarGrid"

const transactions = [

    { date: "2026-03-02", amount: 540, type: "expense" },
    { date: "2026-03-04", amount: 3200, type: "expense" },
    { date: "2026-03-08", amount: 8500, type: "expense" },

    { date: "2026-03-05", amount: 120000, type: "income" },
    { date: "2026-03-15", amount: 15000, type: "income" },

    { date: "2026-03-10", amount: 10000, type: "investment" },
    { date: "2026-03-18", amount: 8000, type: "investment" },

    { date: "2026-03-18", amount: 1200, type: "expense" },
    { date: "2026-03-18", amount: 500, type: "income" }

]

const schedules = [

    { date: "2026-03-01", amount: 25000, name: "Rent" },
    { date: "2026-03-05", amount: 15000, name: "EMI" },
    { date: "2026-03-10", amount: 5000, name: "Insurance" },
    { date: "2026-03-15", amount: 10000, name: "SIP" }

]

export default function Calendar() {

    const today = new Date()

    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth())

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ]

    function prevMonth() {

        if (month === 0) {
            setMonth(11)
            setYear(year - 1)
        } else {
            setMonth(month - 1)
        }
    }

    function nextMonth() {

        if (month === 11) {
            setMonth(0)
            setYear(year + 1)
        } else {
            setMonth(month + 1)
        }
    }

    return (
        <div className="space-y-6 w-full">

            <div className="flex items-center justify-between">

                <h1 className="text-2xl font-semibold">
                    Calendar
                </h1>

                <div className="flex items-center gap-4">

                    <button
                        onClick={prevMonth}
                        className="px-3 py-1 border rounded-md bg-white"
                    >
                        ◀
                    </button>

                    <span className="font-medium">
            {monthNames[month]} {year}
          </span>

                    <button
                        onClick={nextMonth}
                        className="px-3 py-1 border rounded-md bg-white"
                    >
                        ▶
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
    )
}