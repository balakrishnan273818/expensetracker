import { useState } from "react"
import StatCard from "../../components/cards/StatCard"
import { Wallet, TrendingDown, PiggyBank, Landmark } from "lucide-react"
import { formatCurrency } from "../../utils/currency"
import ChartCard from "../../components/cards/ChartCard"
import ExpensePieChart from "../../components/charts/ExpensePieChart"
import MonthlyFlowChart from "../../components/charts/MonthlyFlowChart"
import TransactionTable from "../../components/tables/TransactionTable"
import CategoryBreakdownCard from "../../components/cards/CategoryBreakdownCard"

const transactions = [
    {
        description: "Swiggy Order",
        date: "12 Mar",
        amount: 540,
        type: "expense",
        category: "food"
    },
    {
        description: "Salary Credit",
        date: "10 Mar",
        amount: 120000,
        type: "income",
        category: "other"
    },
    {
        description: "Amazon Purchase",
        date: "8 Mar",
        amount: 3200,
        type: "expense",
        category: "shopping"
    },
    {
        description: "Electricity Bill",
        date: "21 Mar",
        amount: 1000,
        type: "expense",
        category: "Bills"
    },
    {
        description: "Flight Ticket",
        date: "5 Mar",
        amount: 8500,
        type: "expense",
        category: "travel"
    },
    {
        description: "Rent",
        date: "1 Mar",
        amount: 19000,
        type: "expense",
        category: "Bills"
    },
    {
        description: "Interest",
        date: "3 Mar",
        amount: 152,
        type: "income",
        category: "Bond interest"
    }
];

const categorySpending = [
    { category: "food", amount: 12000 },
    { category: "shopping", amount: 8500 },
    { category: "travel", amount: 6200 },
    { category: "bills", amount: 4800 }
]


export default function Dashboard() {

    const [dateRange, setDateRange] = useState("this_month")

    return (
        <div className="space-y-8 w-full">

            {/* Header + Date Filter */}
            <div className="flex items-center justify-between">

                <h1 className="text-2xl font-semibold">Dashboard</h1>

                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                >
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="3_months">Last 3 Months</option>
                    <option value="6_months">Last 6 Months</option>
                    <option value="1_year">Last Year</option>
                </select>

            </div>

            {/* Overview Section */}
            <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Overview
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <StatCard
                        title="Total Income"
                        value={formatCurrency(120000)}
                        change="+8% this month"
                        icon={Landmark}
                        positive={true}
                    />

                    <StatCard
                        title="Total Expenses"
                        value={formatCurrency(70000)}
                        change="-5% this month"
                        icon={TrendingDown}
                        positive={false}
                    />

                    <StatCard
                        title="Investments"
                        value={formatCurrency(25000)}
                        icon={PiggyBank}
                    />

                    <StatCard
                        title="Balance"
                        value={formatCurrency(25000)}
                        icon={Wallet}
                    />

                </div>
            </div>

            {/* Analytics Section */}
            <div>

                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Analytics
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2">
                        <ChartCard title="Monthly Cash Flow">
                            <MonthlyFlowChart />
                        </ChartCard>
                    </div>

                    <CategoryBreakdownCard data={categorySpending} />

                </div>

                <div className="mt-6">
                    <ChartCard title="Expense Distribution">
                        <ExpensePieChart />
                    </ChartCard>
                </div>

            </div>

            {/* Transactions Section */}
            <div>

                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Recent Activity
                </h2>

                <TransactionTable transactions={transactions} />

            </div>

        </div>
    )
}

