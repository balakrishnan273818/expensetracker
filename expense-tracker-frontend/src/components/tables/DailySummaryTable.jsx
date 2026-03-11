import { formatCurrency } from "../../utils/currency"

const categories = [
    "Transportation",
    "Shopping",
    "Bills & Utilities",
    "Entertainment",
    "Healthcare",
    "Housing",
    "EMI",
    "Donations & Gifts",
    "Repairs & Services",
    "Other"
]

export default function DailySummaryTable({ year, month, transactions }) {

    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const data = {}

    transactions.forEach((tx) => {
        const d = new Date(tx.date)

        if (d.getFullYear() === year && d.getMonth() === month) {

            const day = d.getDate()

            if (!data[day]) data[day] = {}

            data[day][tx.category] =
                (data[day][tx.category] || 0) + tx.amount
        }
    })

    function dayTotal(day) {
        if (!data[day]) return 0
        return Object.values(data[day]).reduce((a, b) => a + b, 0)
    }

    function categoryTotal(cat) {
        let total = 0
        Object.values(data).forEach((d) => {
            if (d[cat]) total += d[cat]
        })
        return total
    }

    const monthlyTotal = Object.values(data)
        .flatMap((d) => Object.values(d))
        .reduce((a, b) => a + b, 0)

    const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

    function formatDayLabel(day) {
        const date = new Date(year, month, day)
        const weekday = weekdays[date.getDay()]
        return `${String(day).padStart(2,"0")}-${weekday}`
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">

            <table className="w-full text-sm">

                <thead className="bg-gray-50 border-b text-gray-600">

                <tr>

                    <th className="px-3 py-2 text-left">Date</th>

                    {categories.map((c) => (
                        <th key={c} className="px-3 py-2 text-left">
                            {c}
                        </th>
                    ))}

                    <th className="px-3 py-2 text-right bg-purple-100 text-purple-800 font-semibold">
                        Day Total
                    </th>

                </tr>

                </thead>

                <tbody>

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {

                    const total = dayTotal(day)

                    return (
                        <tr key={day} className="border-b">

                            <td className="px-3 py-2 font-medium">
                                {formatDayLabel(day)}
                            </td>

                            {categories.map((cat) => {

                                const value = data[day]?.[cat]

                                return (
                                    <td key={cat} className="px-3 py-2 text-black">

                                        {value ? formatCurrency(value) : "-"}

                                    </td>
                                )
                            })}

                            <td className="px-3 py-2 text-right bg-purple-100 text-purple-800 font-semibold">

                                {total ? formatCurrency(total) : "-"}

                            </td>

                        </tr>
                    )
                })}

                {/* Category Totals */}

                <tr className="bg-purple-100 font-semibold">

                    <td className="px-3 py-2 text-purple-800">
                        Category Total
                    </td>

                    {categories.map((cat) => (

                        <td key={cat} className="px-3 py-2 text-purple-800">

                            {formatCurrency(categoryTotal(cat))}

                        </td>

                    ))}

                    <td className="px-3 py-2 text-right text-purple-900 font-bold">

                        {formatCurrency(monthlyTotal)}

                    </td>

                </tr>

                </tbody>

            </table>

        </div>
    )
}