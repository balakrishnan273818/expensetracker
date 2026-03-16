import { useMemo } from "react";
import useTransactions from "../../hooks/useTransactions";
import StatCard from "../../components/cards/StatCard";
import ChartCard from "../../components/cards/ChartCard";
import CategoryBreakdownCard from "../../components/cards/CategoryBreakdownCard";
import MonthlyFlowChart from "../../components/charts/MonthlyFlowChart";
import ExpensePieChart from "../../components/charts/ExpensePieChart";
import { Wallet, TrendingDown, PiggyBank, Landmark } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

export default function OverallSummary() {
    const { transactions, loading } = useTransactions();

    const {
        income,
        expenses,
        investments,
        balance,
        categorySpending,
        expensePieData,
        monthlyFlowData,
    } = useMemo(() => {
        const income = transactions
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + t.amount, 0);

        const expenses = transactions
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + Math.abs(t.amount), 0);

        const investments = transactions
            .filter((t) => t.type === "investment")
            .reduce((s, t) => s + Math.abs(t.amount), 0);

        const balance = income - expenses - investments;

        const cat = {};
        transactions
            .filter((t) => t.type === "expense")
            .forEach((tx) => {
                if (!cat[tx.category]) cat[tx.category] = 0;
                cat[tx.category] += Math.abs(tx.amount);
            });

        const categorySpending = Object.entries(cat).map(([category, amount]) => ({
            category,
            amount,
        }));

        const expensePieData = categorySpending.map((c) => ({
            name: c.category,
            value: c.amount,
        }));

        const flow = {};
        transactions.forEach((tx) => {
            const d = new Date(tx.date);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            const label = d.toLocaleString("default", { month: "short", year: "2-digit" });

            if (!flow[key]) flow[key] = { month: label, income: 0, expense: 0 };

            if (tx.type === "income") flow[key].income += tx.amount;
            if (tx.type === "expense") flow[key].expense += Math.abs(tx.amount);
        });

        const monthlyFlowData = Object.values(flow);

        return {
            income,
            expenses,
            investments,
            balance,
            categorySpending,
            expensePieData,
            monthlyFlowData,
        };
    }, [transactions]);

    if (loading) {
        return <div className="text-gray-500">Loading...</div>;
    }

    return (
        <div className="space-y-8 w-full">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Overall Summary
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Income"
                    value={formatCurrency(income)}
                    icon={Landmark}
                    positive
                />

                <StatCard
                    title="Total Expenses"
                    value={formatCurrency(expenses)}
                    icon={TrendingDown}
                    positive={false}
                />

                <StatCard
                    title="Total Investments"
                    value={formatCurrency(investments)}
                    icon={PiggyBank}
                />

                <StatCard
                    title="Net Balance"
                    value={formatCurrency(balance)}
                    icon={Wallet}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard title="Income vs Expense Trend">
                        <MonthlyFlowChart data={monthlyFlowData} />
                    </ChartCard>
                </div>

                <CategoryBreakdownCard data={categorySpending} />
            </div>

            <ChartCard title="Expense Distribution">
                <ExpensePieChart data={expensePieData} />
            </ChartCard>
        </div>
    );
}
