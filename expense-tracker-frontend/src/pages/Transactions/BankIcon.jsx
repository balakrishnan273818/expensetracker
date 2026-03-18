import axis from "../../assets/banks/axis.png";
import hdfc from "../../assets/banks/hdfc.png";
import idfc from "../../assets/banks/idfc.png";

export default function BankIcon({ bank }) {
    const b = (bank || "").toLowerCase();

    let src = null;

    if (b.includes("axis")) src = axis;
    else if (b.includes("hdfc")) src = hdfc;
    else if (b.includes("idfc")) src = idfc;

    if (!src) {
        return (
            <div className="w-5 h-5 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded text-xs">
                ?
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={bank}
            className="w-5 h-5 object-contain"
        />
    );
}