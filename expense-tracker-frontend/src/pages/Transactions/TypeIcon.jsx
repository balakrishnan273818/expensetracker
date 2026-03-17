import {
    ArrowDownCircle,
    ArrowUpCircle,
    PiggyBank,
    Repeat
} from "lucide-react";

export default function TypeIcon({ type }) {

    const map = {
        income: {
            icon: ArrowDownCircle,
            label: "Income",
            color: "text-green-500"
        },
        expense: {
            icon: ArrowUpCircle,
            label: "Expense",
            color: "text-red-500"
        },
        transfer: {
            icon: Repeat,
            label: "Transfer",
            color: "text-blue-500"
        }
    };

    const config = map[type?.toLowerCase()] || map.expense;
    const Icon = config.icon;

    return (
        <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className="text-sm">{config.label}</span>
        </div>
    );
}