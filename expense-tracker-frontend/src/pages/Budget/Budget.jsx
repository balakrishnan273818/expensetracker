import { useState } from "react";
import useBudget from "../../hooks/useBudget";
import BudgetRow from "./BudgetRow";
import PageHeader from "../../components/common/PageHeader";
import { useMonth } from "../../context/MonthContext";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const CATEGORIES = [
    "Food",
    "Shopping",
    "Travel",
    "Bills",
    "Investments",
    "Other",
    "Groceries",
    "Allowances",
    "Entertainment",
];

const DEFAULT_MAX = {
    Food: 15000,
    Shopping: 10000,
    Travel: 10000,
    Bills: 35000,
    Investments: 150000,
    Other: 10000,
    Groceries: 12000,
    Allowances: 30000,
    Entertainment: 5000,
};

export default function Budget() {
    const [showIncome, setShowIncome] = useState(true);
    const { year, month, setYear, setMonth } = useMonth();

    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

    const {
        budgets,
        setBudgets,
        saveBudgets,
        monthlyIncome,
        setMonthlyIncome
    } = useBudget(monthStr);

    const { addToast } = useToast();
    const [editMode, setEditMode] = useState(false);

    const handleChange = (category, field, value) => {
        setBudgets((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: Number(value),
            },
        }));
    };

    const handleSave = async () => {
        try {
            await saveBudgets(budgets);
            setEditMode(false);
            addToast("Budget saved successfully", "success");
        } catch (err) {
            addToast("Failed to save budget", "error");
        }
    };

    // Totals
    const totalBudget = Object.values(budgets)
        .reduce((sum, b) => sum + (b?.amount || 0), 0);

    const percentage = monthlyIncome > 0
        ? Math.min((totalBudget / monthlyIncome) * 100, 100)
        : 0;

    // Split income equally across 3 banks (UI-only simulation)
    const perBankIncome = Math.round(monthlyIncome / 3);
    const perBankExpense = Math.round(totalBudget / 3);
    const perBankCurrent = perBankIncome - perBankExpense;

    return (
        <div className="space-y-6 w-full">

            {/* Header */}
            <PageHeader
                title="Budget"
                year={year}
                month={month}
                setYear={setYear}
                setMonth={setMonth}
                actions={
                    <button
                        onClick={() => setEditMode(prev => !prev)}
                        className="p-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700"
                    >
                        {editMode ? "Done" : "Edit"}
                    </button>
                }
            />

            {/* 🔥 Bank Cards (STRICT MATCH) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Axis */}
                <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
                    <p className="font-medium">Axis Bank</p>
                    <p className="text-xs text-gray-400">****1234</p>

                    <div className="mt-3 text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>Starting Balance</span>
                            <span>₹{perBankIncome}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Current Balance</span>
                            <span className="font-medium">₹{perBankCurrent}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Month Change</span>
                            <span className="text-red-500">
                                -₹{perBankExpense}
                            </span>
                        </div>
                    </div>
                </div>

                {/* HDFC */}
                <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
                    <p className="font-medium">HDFC Bank</p>
                    <p className="text-xs text-gray-400">****5678</p>

                    <div className="mt-3 text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>Starting Balance</span>
                            <span>₹{perBankIncome}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Current Balance</span>
                            <span className="font-medium">₹{perBankCurrent}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Month Change</span>
                            <span className="text-red-500">
                                -₹{perBankExpense}
                            </span>
                        </div>
                    </div>
                </div>

                {/* IDFC */}
                <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
                    <p className="font-medium">IDFC Bank</p>
                    <p className="text-xs text-gray-400">****9012</p>

                    <div className="mt-3 text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>Starting Balance</span>
                            <span>₹{perBankIncome}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Current Balance</span>
                            <span className="font-medium">₹{perBankCurrent}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Month Change</span>
                            <span className="text-red-500">
                                -₹{perBankExpense}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* 🔥 Total Summary Bar */}
            <div className="border border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 flex justify-between text-sm font-medium">
                <div>
                    <p className="text-gray-500">Total Starting Balance</p>
                    <p>₹{monthlyIncome}</p>
                </div>

                <div>
                    <p className="text-gray-500">Total Current Balance</p>
                    <p className="text-blue-600">₹{monthlyIncome - totalBudget}</p>
                </div>

                <div>
                    <p className="text-gray-500">Net Change</p>
                    <p className="text-red-500">-₹{totalBudget}</p>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">
                        Allocated Budget
                    </span>

                    <span className="font-medium">
                        ₹{totalBudget} / {showIncome ? `₹${monthlyIncome}` : "****"}
                    </span>
                </div>

                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${
                            percentage > 100
                                ? "bg-red-500"
                                : percentage > 80
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className="text-right text-xs mt-1 text-gray-500">
                    {percentage.toFixed(0)}%
                </div>
            </div>

            {/* Budget Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                {CATEGORIES.map((cat) => {
                    const existing = budgets[cat] || {};

                    return (
                        <BudgetRow
                            key={cat}
                            category={cat}
                            data={{
                                amount: existing.amount || 0,
                                max: existing.max ?? DEFAULT_MAX[cat],
                            }}
                            onChange={handleChange}
                            editMode={editMode}
                        />
                    );
                })}
            </div>

            {/* Warning */}
            {totalBudget > monthlyIncome && (
                <div className="text-red-500 text-sm font-medium">
                    ⚠ Budget exceeds income by ₹{totalBudget - monthlyIncome}
                </div>
            )}

            {/* Save */}
            <div>
                <button
                    onClick={handleSave}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    Save Budget
                </button>
            </div>

        </div>
    );
}