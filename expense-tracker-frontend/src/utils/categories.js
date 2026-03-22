import {
    Utensils,
    Home,
    ShoppingCart,
    Plane,
    Lightbulb,
    Wallet,
    Film,
    ShoppingBag,
    Package,
    ArrowLeftRight,
    HandCoins,
    Banknote,
    LineChart,         // ✅ NEW
    ArrowDownCircle    // ✅ NEW
} from "lucide-react";

/**
 * Central category configuration
 */
const rawCategoryMap = {
    food: {
        label: "Food",
        icon: Utensils,
        color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
    },

    groceries: {
        label: "Groceries",
        icon: ShoppingCart,
        color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
    },

    shopping: {
        label: "Shopping",
        icon: ShoppingBag,
        color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
    },

    travel: {
        label: "Travel",
        icon: Plane,
        color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
    },

    bills: {
        label: "Bills",
        icon: Lightbulb,
        color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300"
    },

    investments: {
        label: "Investments",
        icon: LineChart, // ✅ FIXED
        color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
    },

    allowances: {
        label: "Allowances",
        icon: HandCoins,
        color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300"
    },

    cash: {
        label: "Cash",
        icon: Banknote,
        color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
    },

    entertainment: {
        label: "Entertainment",
        icon: Film,
        color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300"
    },

    transfer: {
        label: "Transfer",
        icon: ArrowLeftRight,
        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
    },

    income: {
        label: "Income",
        icon: ArrowDownCircle, // ✅ FIXED
        color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
    },

    rent: {
        label: "Rent",
        icon: Home,
        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
    },

    other: {
        label: "Others",
        icon: Package,
        color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    }
};

export function normalizeCategory(category) {
    if (!category) return "other";

    return category
        .toString()
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/\s+/g, "");
}

export function getCategoryMeta(category) {
    const key = normalizeCategory(category);
    return rawCategoryMap[key] || rawCategoryMap["other"];
}

export const categoryMap = rawCategoryMap;