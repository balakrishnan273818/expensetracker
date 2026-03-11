import {
    Utensils,
    Home,
    ShoppingCart,
    Plane,
    Lightbulb,
    TrendingUp,
    Wallet
} from "lucide-react"

export const categoryMap = {
    food: {
        label: "Food",
        icon: Utensils,
        color: "bg-orange-100 text-orange-600"
    },

    rent: {
        label: "Rent",
        icon: Home,
        color: "bg-blue-100 text-blue-600"
    },

    shopping: {
        label: "Shopping",
        icon: ShoppingCart,
        color: "bg-purple-100 text-purple-600"
    },

    travel: {
        label: "Travel",
        icon: Plane,
        color: "bg-green-100 text-green-600"
    },

    bills: {
        label: "Bills",
        icon: Lightbulb,
        color: "bg-yellow-100 text-yellow-600"
    },

    investment: {
        label: "Investment",
        icon: TrendingUp,
        color: "bg-indigo-100 text-indigo-600"
    },

    other: {
        label: "Other",
        icon: Wallet,
        color: "bg-gray-100 text-gray-600"
    }
}