import TypeIcon from "./TypeIcon";
import { getSubcategories } from "../../constants/categories";
import { formatDate } from "../../utils/date";
import PaymentModeIcon from "./PaymentModeIcon";
import BankIcon from "./BankIcon";

export default function TransactionRow({
                                           tx,
                                           editMode,
                                           setTransactions,
                                           setActiveTx
                                       }) {



    const isExpense = tx.amount < 0;

    return (

        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">

            <td className="px-4 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {formatDate(tx.date)}
            </td>

            <td className="px-4 py-4 text-right whitespace-nowrap">
                <span className={`font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}>
                    {isExpense ? "-" : "+"} ₹{Math.abs(tx.amount)}
                </span>
            </td>

            <td className="px-4 py-4">
                <TypeIcon type={tx.type}/>
            </td>

            <td
                className={`px-4 py-4 ${editMode ? "cursor-pointer hover:underline" : ""}`}
                onClick={() => {

                    if (!editMode) return;

                    const normalizedSub = tx.subcategory ?? tx.sub_category;

                    const validSubs = getSubcategories(tx.category);

                    const safeSub = validSubs.includes(normalizedSub)
                        ? normalizedSub
                        : validSubs[0] || "";

                    setActiveTx({
                        ...tx,
                        subcategory: safeSub
                    });

                }}
            >
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {tx.category}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {tx.subcategory}
                </div>
            </td>

            <td className="px-4 py-4 text-sm text-gray-800 dark:text-gray-100 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <PaymentModeIcon mode={tx.mode} />
                    <span>{tx.mode}</span>
                </div>
            </td>

            <td className="px-4 py-4 text-sm text-gray-800 dark:text-gray-100 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <BankIcon bank={tx.bank} />
                    <span>{tx.bank}</span>
                </div>
            </td>

            <td className="px-4 py-4">

                {editMode ? (

                    <input
                        type="text"
                        value={tx.remarks || ""}
                        onChange={(e) => {

                            const value = e.target.value;

                            setTransactions(prev =>
                                prev.map(t =>
                                    t.id === tx.id ? { ...t, remarks: value } : t
                                )
                            );

                        }}
                        onBlur={async (e) => {

                            const value = e.target.value;

                            await fetch(`http://localhost:5000/api/transactions/${tx.id}/remarks`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ remarks: value })
                            });

                        }}
                        className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-800 text-sm"
                    />

                ) : (

                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        {tx.remarks || "-"}
                    </div>

                )}

            </td>

            <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                {tx.description}
            </td>

        </tr>

    );
}