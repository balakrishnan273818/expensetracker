import { useState } from "react";

import StatCard from "../../components/cards/StatCard";
import ChartCard from "../../components/cards/ChartCard";
import TransactionsTable from "../../components/tables/TransactionsTable.jsx";
import TransactionDrawer from "../../components/drawer/TransactionDrawer";
import CategoryBreakdownCard from "../../components/cards/CategoryBreakdownCard";

import ExpensePieChart from "../../components/charts/ExpensePieChart";
import MonthlyFlowChart from "../../components/charts/MonthlyFlowChart";

import { Wallet, TrendingDown, PiggyBank, Landmark } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

import useTransactions from "../../hooks/useTransactions";
import PageHeader from "../../layout/PageHeader";


export default function Dashboard() {

    const { transactions } = useTransactions();

    const [selectedTx, setSelectedTx] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const investments = transactions
        .filter((t) => t.type === "investment")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const balance = income - expenses - investments;

    const categoryMap = {};

    transactions
        .filter((t) => t.type === "expense")
        .forEach((tx) => {
            if (!categoryMap[tx.category]) categoryMap[tx.category] = 0;
            categoryMap[tx.category] += Math.abs(tx.amount);
        });

    const categorySpending = Object.entries(categoryMap).map(([category, amount]) => ({
        category,
        amount
    }));

    const expensePieData = categorySpending.map((c) => ({
        name: c.category,
        value: c.amount
    }));

    const monthlyFlow = {};

    transactions.forEach((tx) => {
        const date = new Date(tx.date);
        const month = date.toLocaleString("default", { month: "short" });

        if (!monthlyFlow[month]) {
            monthlyFlow[month] = { month, income: 0, expense: 0 };
        }

        if (tx.type === "income") monthlyFlow[month].income += tx.amount;
        if (tx.type === "expense") monthlyFlow[month].expense += Math.abs(tx.amount);
    });

    const monthlyFlowData = Object.values(monthlyFlow);

    return (
        <div className="space-y-8 w-full">

            {/*<h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">*/}
            {/*    Dashboard*/}
            {/*</h1>*/}

            <PageHeader
                title="Dashboard"
                subtitle="Overview of your financial activity"
            />


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
                    title="Investments"
                    value={formatCurrency(investments)}
                    icon={PiggyBank}
                />

                <StatCard
                    title="Balance"
                    value={formatCurrency(balance)}
                    icon={Wallet}
                />

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2">
                    <ChartCard title="Monthly Cash Flow">
                        <MonthlyFlowChart data={monthlyFlowData} />
                    </ChartCard>
                </div>

                <CategoryBreakdownCard data={categorySpending} />

            </div>

            <ChartCard title="Expense Distribution">
                <ExpensePieChart data={expensePieData} />
            </ChartCard>

            <TransactionsTable
                transactions={transactions.slice(0, 10)}
                onSelect={(tx) => {
                    setSelectedTx(tx);
                    setDrawerOpen(true);
                }}
            />

            <TransactionDrawer
                open={drawerOpen}
                transaction={selectedTx}
                onClose={() => setDrawerOpen(false)}
            />

        </div>
    );
}
