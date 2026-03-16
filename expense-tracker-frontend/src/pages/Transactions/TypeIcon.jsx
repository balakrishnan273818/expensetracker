import {
    ArrowDownCircle,
    ArrowUpCircle,
    PiggyBank,
    Repeat
} from "lucide-react";

export default function TypeIcon({ type }) {

    const map = {

        expense: <ArrowDownCircle size={20} className="text-red-500"/>,
        income: <ArrowUpCircle size={20} className="text-green-600"/>,
        investment: <PiggyBank size={20} className="text-blue-600"/>,
        transfer: <Repeat size={20} className="text-gray-500"/>

    };

    return map[type] || null;

}