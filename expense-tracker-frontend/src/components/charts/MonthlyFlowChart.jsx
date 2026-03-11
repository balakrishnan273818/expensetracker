import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
    { month: "Jan", income: 100000, expense: 70000 },
    { month: "Feb", income: 110000, expense: 75000 },
    { month: "Mar", income: 120000, expense: 80000 },
    { month: "Apr", income: 90000, expense: 60000 }
]

export default function MonthlyFlowChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>

                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="income" fill="#22c55e" />
                <Bar dataKey="expense" fill="#ef4444" />

            </BarChart>
        </ResponsiveContainer>
    )
}