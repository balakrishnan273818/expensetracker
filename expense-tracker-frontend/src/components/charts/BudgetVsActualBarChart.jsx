import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend
} from "recharts";

import { formatCurrency } from "../../utils/currency";

export default function BudgetVsActualBarChart({ data = [] }) {

    // Optional: limit to top 8 categories for readability
    const chartData = [...data]
        .sort((a, b) => b.actual - a.actual)
        .slice(0, 8);

    return (
        <div className="w-full h-[320px]">

            <ResponsiveContainer width="100%" height="100%">

                <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                >

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="category"
                        angle={-20}
                        textAnchor="end"
                        interval={0}
                        height={60}
                    />

                    <YAxis />

                    <Tooltip
                        formatter={(value) => formatCurrency(value)}
                    />

                    <Legend />

                    {/* Budget */}
                    <Bar
                        dataKey="budget"
                        name="Budget"
                        radius={[4, 4, 0, 0]}
                    />

                    {/* Actual */}
                    <Bar
                        dataKey="actual"
                        name="Actual"
                        radius={[4, 4, 0, 0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>
    );
}