import { useState, useMemo } from "react";

// UI Components
import StatCard from "../../components/cards/StatCard";
import ChartCard from "../../components/cards/ChartCard";
import TransactionsTable from "../../components/tables/TransactionsTable.jsx";
import TransactionDrawer from "../../components/drawer/TransactionDrawer";

// Charts
import ExpensePieChart from "../../components/charts/ExpensePieChart";
import InvestmentPieChart from "../../components/charts/InvestmentPieChart";
import ExpectedExpensesBarChart from "../../components/charts/ExpectedExpensesBarChart";
import OutflowBarChart from "../../components/charts/OutflowBarChart";
import FocusCategoryTreemap from "../../components/charts/FocusCategoryTreemap";

// Icons
import {
    Wallet,
    TrendingDown,
    PiggyBank,
    Landmark,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

// Utils & Hooks
import { formatCurrency } from "../../utils/currency";
import useTransactions from "../../hooks/useTransactions";
import { useMonth } from "../../context/MonthContext";
import { subcategoryMap } from "../../constants/categories";

export default function Dashboard() {
    const { transactions } = useTransactions();
    const { year, month, setMonth, setYear } = useMonth();

    const [selectedTx, setSelectedTx] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isInvestment = (tx) =>
        (tx.category?.toLowerCase() || "") === "investments";

    const groupByCategory = (list) => {
        const map = {};
        list.forEach((tx) => {
            if (!map[tx.category]) map[tx.category] = 0;
            map[tx.category] += Math.abs(tx.amount);
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    };

    const groupBySubcategory = (list) => {
        const map = {};
        list.forEach((tx) => {
            const key = tx.sub_category || "Others";
            if (!map[key]) map[key] = 0;
            map[key] += Math.abs(tx.amount);
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    };

    function prevMonth() {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    }

    function nextMonth() {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    }

    const filteredTx = useMemo(() => {
        return transactions.filter((tx) => {
            const d = new Date(tx.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    }, [transactions, month, year]);

    const income = filteredTx
        .filter((t) => t.type?.toLowerCase() === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const investments = filteredTx
        .filter(isInvestment)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const expenses = filteredTx
        .filter(
            (t) =>
                t.type?.toLowerCase() === "expense" &&
                !isInvestment(t)
        )
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const balance = income - expenses - investments;

    const expenseTx = filteredTx.filter(
        (t) => t.type?.toLowerCase() === "expense" && !isInvestment(t)
    );

    const investmentTx = filteredTx.filter(isInvestment);

    const expectedSubcategories = new Set(
        [...subcategoryMap["Bills"], ...subcategoryMap["Allowances"]].map((s) =>
            s.toLowerCase()
        )
    );

    const expectedMap = {};

    expenseTx.forEach((tx) => {
        const sub = tx.sub_category?.toLowerCase() || "";
        if (expectedSubcategories.has(sub)) {
            if (!expectedMap[tx.sub_category]) expectedMap[tx.sub_category] = 0;
            expectedMap[tx.sub_category] += Math.abs(tx.amount);
        }
    });

    const expectedData = Object.entries(expectedMap).map(([name, value]) => ({
        name,
        value,
    }));

    const totalExpected = expectedData.reduce((sum, d) => sum + d.value, 0);

    const investVsExpense = [
        { name: "Investment", value: investments },
        { name: "Expense", value: expenses },
    ];

    const outflowData = groupByCategory(expenseTx);
    const totalOutflow = outflowData.reduce((sum, d) => sum + d.value, 0);

    const investmentData = groupBySubcategory(investmentTx).sort(
        (a, b) => b.value - a.value
    );

    const focusCategories = [
        "Food",
        "Travel",
        "Groceries",
        "Shopping",
        "Entertainment",
    ];

    const focusData = groupBySubcategory(
        expenseTx.filter((t) =>
            focusCategories
                .map((c) => c.toLowerCase())
                .includes((t.category || "").toLowerCase())
        )
    ).sort((a, b) => b.value - a.value);

    const totalFocus = focusData.reduce((sum, d) => sum + d.value, 0);

    const monthLabel = new Date(year, month).toLocaleString("default", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="space-y-6 w-full">

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            Overview of your financial activity
                        </p>
                    </div>
                    <div className="flex items-center gap-3">

                        <button
                            onClick={prevMonth}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                        </button>

                        <span className="font-medium text-gray-800 dark:text-gray-100">
                        {monthLabel}
                    </span>

                        <button
                            onClick={nextMonth}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                        </button>

                    </div>

                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Income" value={formatCurrency(income)} icon={Landmark} variant="income" />
                <StatCard title="Total Expenses" value={formatCurrency(expenses)} icon={TrendingDown} variant="expense" />
                <StatCard title="Investments" value={formatCurrency(investments)} icon={PiggyBank} variant="investment" />
                <StatCard title="Balance" value={formatCurrency(balance)} icon={Wallet} variant="balance" />
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Investment vs Expense">
                    <ExpensePieChart data={investVsExpense} semi />
                </ChartCard>

                <ChartCard title="Outflow Distribution">
                    <OutflowBarChart data={outflowData} />
                </ChartCard>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Investment Distribution">
                    <InvestmentPieChart data={investmentData} />
                </ChartCard>

                <ChartCard title="Expected Expenses">
                    <ExpectedExpensesBarChart data={expectedData} />
                </ChartCard>
            </div>

            {/* Row 3 */}
            <ChartCard title="Key Spending Categories">
                <div className="h-[300px]">
                    <FocusCategoryTreemap data={focusData} />
                </div>
            </ChartCard>

            {/* Transactions */}
            <TransactionsTable
                transactions={filteredTx.slice(0, 10)}
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