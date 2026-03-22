import { useMemo } from "react";
import useTransactions from "../../hooks/useTransactions";
import useBudget from "../../hooks/useBudget";
import ChartCard from "../../components/cards/ChartCard";
import CategoryBreakdownCard from "../../components/cards/CategoryBreakdownCard";
import PageHeader from "../../components/common/PageHeader";
import { useMonth } from "../../context/MonthContext";

export default function OverallSummary() {

    const { transactions, loading } = useTransactions();

    const { year, month, setYear, setMonth } = useMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

    const { budgets } = useBudget(monthStr);

    const {
        budgetVsActual,
        savingsRate,
        commitmentRatio,
        overdraft
    } = useMemo(() => {

        function normalizeCategory(tx) {
            let category =
                tx.category ||
                tx.subcategory ||
                tx.sub_category ||
                "Others";

            category = String(category).trim().toLowerCase();

            if (!category || category === "null" || category === "undefined") {
                return "Others";
            }

            if (category.includes("other")) return "Others";
            if (category.includes("bill")) return "Bills";
            if (category.includes("food") || category.includes("dining")) return "Food";
            if (category.includes("travel")) return "Travel";
            if (category.includes("shop")) return "Shopping";
            if (category.includes("invest")) return "Investments";

            return category.charAt(0).toUpperCase() + category.slice(1);
        }

        // ✅ Month-safe filtering
        const validTx = transactions.filter(tx => {
            if (!tx || !tx.date || typeof tx.amount !== "number") return false;
            return tx.date.slice(0, 7) === monthStr;
        });

        const categoryMap = {};

        let income = 0;
        let expenses = 0;
        let investments = 0;

        validTx.forEach(tx => {
            const type = (tx.type || "").toLowerCase();
            const amount = Math.abs(tx.amount);

            const normalized = normalizeCategory(tx);

            const isInvestment =
                type === "investment" ||
                normalized === "Investments";

            if (type === "income") {
                income += amount;
            }
            else if (isInvestment) {
                investments += amount;

                if (!categoryMap["Investments"]) categoryMap["Investments"] = 0;
                categoryMap["Investments"] += amount;
            }
            else if (type === "expense") {
                expenses += amount;

                if (!categoryMap[normalized]) categoryMap[normalized] = 0;
                categoryMap[normalized] += amount;
            }
        });

        // ✅ Normalize budgets
        const normalizedBudgetMap = {};

        Object.entries(budgets || {}).forEach(([key, value]) => {
            const normalizedKey = normalizeCategory({ category: key });

            if (!normalizedBudgetMap[normalizedKey]) {
                normalizedBudgetMap[normalizedKey] = 0;
            }

            normalizedBudgetMap[normalizedKey] += value?.amount || 0;
        });

        const allCategories = new Set([
            ...Object.keys(categoryMap),
            ...Object.keys(normalizedBudgetMap)
        ]);

        const budgetVsActual = Array.from(allCategories)
            .map(cat => ({
                category: cat,
                budget: normalizedBudgetMap[cat] || 0,
                actual: categoryMap[cat] || 0
            }))
            .sort((a, b) => b.actual - a.actual);

        // ✅ KPIs
        const savingsRate = income > 0 ? (investments / income) * 100 : 0;
        const commitmentRatio = income > 0 ? (expenses / income) * 100 : 0;

        // 🔥 TRUE overdraft (deficit based)
        const overdraft = income > 0
            ? ((expenses + investments - income) / income) * 100
            : 0;

        return {
            budgetVsActual,
            savingsRate,
            commitmentRatio,
            overdraft
        };

    }, [transactions, budgets, monthStr]);

    if (loading) {
        return <div className="text-gray-500">Loading...</div>;
    }

    // 🔥 Status helper
    const getStatus = (value, type) => {
        if (type === "savings") {
            if (value > 40) return { label: "Healthy", color: "text-green-600" };
            if (value > 20) return { label: "Moderate", color: "text-yellow-500" };
            return { label: "Low", color: "text-red-500" };
        }

        if (type === "commitment") {
            if (value < 50) return { label: "Healthy", color: "text-green-600" };
            if (value < 80) return { label: "Risk", color: "text-yellow-500" };
            return { label: "Critical", color: "text-red-500" };
        }

        if (type === "overdraft") {
            if (value <= 0) return { label: "Healthy", color: "text-green-600" };
            if (value < 20) return { label: "Warning", color: "text-yellow-500" };
            return { label: "Critical", color: "text-red-500" };
        }
    };

    return (
        <div className="space-y-8 w-full">

            {/* Header */}
            <PageHeader
                title="Overall Summary"
                year={year}
                month={month}
                setYear={setYear}
                setMonth={setMonth}
            />

            {/* Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT */}
                <div className="lg:col-span-2">
                    <ChartCard title="Budget vs Actual (Top Spending Categories)">
                        <CategoryBreakdownCard data={budgetVsActual} isBudgetView />
                    </ChartCard>
                </div>

                {/* RIGHT */}
                <div className="space-y-4">

                    {/* Savings */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Overall Savings Rate</p>
                        <p className="text-lg font-semibold text-green-600">
                            {savingsRate.toFixed(2)}%
                        </p>
                        <p className={`text-xs ${getStatus(savingsRate, "savings").color}`}>
                            {getStatus(savingsRate, "savings").label}
                        </p>
                    </div>

                    {/* Commitment */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Commitment Ratio</p>
                        <p className="text-lg font-semibold text-yellow-500">
                            {commitmentRatio.toFixed(2)}%
                        </p>
                        <p className={`text-xs ${getStatus(commitmentRatio, "commitment").color}`}>
                            {getStatus(commitmentRatio, "commitment").label}
                        </p>
                    </div>

                    {/* Overdraft */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Overdraft</p>
                        <p className="text-lg font-semibold text-red-500">
                            {overdraft.toFixed(2)}%
                        </p>
                        <p className={`text-xs ${getStatus(overdraft, "overdraft").color}`}>
                            {getStatus(overdraft, "overdraft").label}
                        </p>
                    </div>

                </div>

            </div>

        </div>
    );
}