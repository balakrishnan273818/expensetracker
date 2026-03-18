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

    function normalizeCategory(tx) {

        let category =
            tx.category ||
            tx.subcategory ||
            tx.sub_category ||
            "Others";

        category = String(category).trim().toLowerCase();

        // normalize common variants
        if (!category || category === "null" || category === "undefined") {
            return "Others";
        }

        if (category.includes("other")) return "Others";
        if (category.includes("bill")) return "Bills";
        if (category.includes("food") || category.includes("dining")) return "Food";
        if (category.includes("travel")) return "Travel";
        if (category.includes("shop")) return "Shopping";
        if (category.includes("invest")) return "Investments";

        // capitalize first letter
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    const {
        income,
        expenses,
        investments,
        balance,
        categorySpending,
        expensePieData,
        monthlyFlowData,
    } = useMemo(() => {

        // ✅ CLEAN + VALIDATE DATA FIRST
        const validTx = transactions.filter(tx =>
            tx &&
            tx.date &&
            !isNaN(new Date(tx.date)) &&
            typeof tx.amount === "number"
        );

        let income = 0;
        let expenses = 0;
        let investments = 0;

        const categoryMap = {};

        validTx.forEach(tx => {

            const type = (tx.type || "").toLowerCase();
            const amount = Math.abs(tx.amount);

            const category = normalizeCategory(tx);

            // detect investment
            const isInvestment =
                type === "investment" || category === "Investments";

            if (type === "expense" || isInvestment) {

                const finalCategory = isInvestment ? "Investments" : category;

                if (!categoryMap[finalCategory]) {
                    categoryMap[finalCategory] = 0;
                }

                categoryMap[finalCategory] += amount;
            }

        });

        const monthlyMap = {};

        validTx.forEach(tx => {

            const type = (tx.type || "").toLowerCase();
            const category = (tx.category || "").toLowerCase();
            const subcategory = (tx.subcategory || tx.sub_category || "").toLowerCase();
            const amount = Math.abs(tx.amount);

            // ✅ detect investment robustly
            const isInvestment =
                type === "investment" ||
                category.includes("invest") ||
                subcategory.includes("invest");

            const date = new Date(tx.date);
            const year = date.getFullYear();
            const month = date.getMonth();

            const key = `${year}-${month}`;
            const label = date.toLocaleString("default", {
                month: "short",
                year: "2-digit"
            });

            if (!monthlyMap[key]) {
                monthlyMap[key] = {
                    month: label,
                    income: 0,
                    expense: 0
                };
            }

            // ✅ TYPE HANDLING
            if (type === "income") {
                income += amount;
                monthlyMap[key].income += amount;
            }

            else if (isInvestment) {
                investments += amount;

                // treat as expense in trend
                monthlyMap[key].expense += amount;

                if (!categoryMap["Investments"]) categoryMap["Investments"] = 0;
                categoryMap["Investments"] += amount;
            }

            else if (type === "expense") {
                expenses += amount;
                monthlyMap[key].expense += amount;

                if (!categoryMap[tx.category || "Others"]) {
                    categoryMap[tx.category || "Others"] = 0;
                }
                categoryMap[tx.category || "Others"] += amount;
            }

        });

        const balance = income - expenses - investments;

        // ✅ CATEGORY DATA
        const categorySpending = Object.entries(categoryMap)
            .reduce((acc, [category, amount]) => {
                const existing = acc.find(c => c.category === category);

                if (existing) {
                    existing.amount += amount;
                } else {
                    acc.push({ category, amount });
                }

                return acc;
            }, [])
            .sort((a, b) => b.amount - a.amount);

        // ✅ PIE DATA
        const expensePieData = categorySpending.map(c => ({
            name: c.category,
            value: c.amount
        }));

        // ✅ SORT MONTHLY DATA (IMPORTANT FIX)
        const monthlyFlowData = Object.entries(monthlyMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(entry => entry[1]);

        return {
            income,
            expenses,
            investments,
            balance,
            categorySpending,
            expensePieData,
            monthlyFlowData
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

            {/* ✅ TOP STATS */}
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

            {/* ✅ CHART + CATEGORY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2">
                    <ChartCard title="Income vs Expense Trend">
                        <MonthlyFlowChart data={monthlyFlowData} />
                    </ChartCard>
                </div>

                <CategoryBreakdownCard data={categorySpending} />

            </div>

            {/* ✅ PIE */}
            <ChartCard title="Expense Distribution">
                <ExpensePieChart data={expensePieData} />
            </ChartCard>

        </div>
    );
}