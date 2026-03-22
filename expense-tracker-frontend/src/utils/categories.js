import {
    Utensils,
    Home,
    ShoppingCart,
    Plane,
    Lightbulb,
    TrendingUp,
    Wallet
} from "lucide-react";

const rawCategoryMap = {
    food: {
        label: "Food",
        icon: Utensils,
        color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
    },

    rent: {
        label: "Rent",
        icon: Home,
        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
    },

    shopping: {
        label: "Shopping",
        icon: ShoppingCart,
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

    investment: {
        label: "Investment",
        icon: TrendingUp,
        color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
    },

    other: {
        label: "Other",
        icon: Wallet,
        color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    }
};


/**
 * Normalize category string from DB/UI/LLM
 */
export function normalizeCategory(category) {
    if (!category) return "other";

    return category
        .toString()
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/\s+/g, "");
}

/**
 * Safe getter used everywhere instead of direct map access
 */
export function getCategoryMeta(category) {
    const key = normalizeCategory(category);
    return rawCategoryMap[key] || rawCategoryMap["other"];
}

export const categoryMap = rawCategoryMap;