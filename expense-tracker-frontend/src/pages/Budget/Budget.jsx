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
    "Investment",
    "Other",
    "Groceries",
    "Allowances",
    "Entertainment",
];

// 🔥 Default max per category (can tune later)
const DEFAULT_MAX = {
    Food: 15000,
    Shopping: 10000,
    Travel: 10000,
    Bills: 35000,
    Investment: 150000,
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
        loading,
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
        console.log("save clicked");

        try {
            await saveBudgets(budgets);
            setEditMode(false);
            addToast("Budget saved successfully", "success");
        } catch (err) {
            console.error(err);
            addToast("Failed to save budget", "error");
        }
    };

    // 🔥 Total allocation
    const totalBudget = Object.values(budgets)
        .reduce((sum, b) => sum + (b?.amount || 0), 0);

    const percentage = monthlyIncome > 0
        ? Math.min((totalBudget / monthlyIncome) * 100, 100)
        : 0;

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

            {/* Monthly Income (edit only) */}
            {editMode && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                    <label className="text-sm text-gray-500">
                        Monthly Income
                    </label>
                    <input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                        className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-900"
                    />
                </div>
            )}

            {/* Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">
                        Allocated Budget
                    </span>
                    <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-100">

                        <span>
                            ₹{totalBudget} / {showIncome ? `₹${monthlyIncome}` : "****"}
                        </span>

                        <button
                            onClick={() => setShowIncome(prev => !prev)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            {showIncome ? (
                                <Eye className="w-4 h-4" />
                            ) : (
                                <EyeOff className="w-4 h-4" />
                            )}
                        </button>

                    </div>
                </div>

                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${
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
                                max: existing.max ?? DEFAULT_MAX[cat], // ✅ per-category max
                            }}
                            onChange={handleChange}
                            editMode={editMode}
                        />
                    );
                })}

            </div>

            {/* Constraint Warning */}
            {totalBudget > monthlyIncome && (
                <div className="text-red-500 text-sm font-medium">
                    ⚠ Budget exceeds income by ₹{totalBudget - monthlyIncome}
                </div>
            )}

            {/* Save */}
            <div>
                <button
                    onClick={handleSave}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                    Save Budget
                </button>
            </div>

        </div>
    );
}