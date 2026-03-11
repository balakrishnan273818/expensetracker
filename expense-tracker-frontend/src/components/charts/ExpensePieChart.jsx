import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const data = [
    { name: "Food", value: 12000 },
    { name: "Rent", value: 25000 },
    { name: "Shopping", value: 8000 },
    { name: "Travel", value: 6000 }
]

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"]

export default function ExpensePieChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>

                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>

                <Tooltip />

            </PieChart>
        </ResponsiveContainer>
    )
}