import { CreditCard, Wallet, Landmark, Smartphone } from "lucide-react";

export default function PaymentModeIcon({ mode }) {
    const m = (mode || "").toLowerCase();

    let Icon = Wallet;
    let color = "text-gray-500";

    if (m.includes("upi")) {
        Icon = Smartphone;
        color = "text-blue-500";
    } else if (m.includes("cash")) {
        Icon = Wallet;
        color = "text-green-500";
    } else if (m.includes("card")) {
        Icon = CreditCard;
        color = "text-purple-500";
    } else if (m.includes("bank")) {
        Icon = Landmark;
        color = "text-yellow-600";
    }

    return <Icon size={16} className={color} />;
}