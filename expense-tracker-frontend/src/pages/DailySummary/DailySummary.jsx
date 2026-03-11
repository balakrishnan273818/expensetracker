import { useState } from "react"
import DailySummaryTable from "../../components/tables/DailySummaryTable"

const transactions = [
    { date: "2026-03-01", category: "Transportation", amount: 15 },
    { date: "2026-03-02", category: "Transportation", amount: 18.5 },
    { date: "2026-03-03", category: "Bills & Utilities", amount: 45 },
    { date: "2026-03-04", category: "Transportation", amount: 55 },
    { date: "2026-03-05", category: "Bills & Utilities", amount: 145 },
    { date: "2026-03-05", category: "Healthcare", amount: 49.99 },
    { date: "2026-03-07", category: "Bills & Utilities", amount: 79.99 },
    { date: "2026-03-08", category: "Entertainment", amount: 10.99 },
    { date: "2026-03-09", category: "Entertainment", amount: 15.99 },
    { date: "2026-03-09", category: "Housing", amount: 1800 }
]

export default function DailySummary() {

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

            <div className="flex justify-between items-center">

                <h1 className="text-xl font-semibold">
                    Daily Summary - {monthNames[month]} {year}
                </h1>

                <div className="flex gap-2">

                    <button
                        onClick={prevMonth}
                        className="px-3 py-1 border rounded-md bg-white"
                    >
                        ◀
                    </button>

                    <button
                        onClick={nextMonth}
                        className="px-3 py-1 border rounded-md bg-white"
                    >
                        ▶
                    </button>

                </div>

            </div>

            <DailySummaryTable
                year={year}
                month={month}
                transactions={transactions}
            />

        </div>
    )
}