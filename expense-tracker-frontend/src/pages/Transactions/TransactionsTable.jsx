import { useState, useMemo } from "react";
import { Pencil } from "lucide-react";
import TransactionRow from "./TransactionRow";

export default function TransactionsTable({
                                              transactions,
                                              setTransactions,
                                              editMode,
                                              setEditMode,
                                              setActiveTx,
                                              filters,
                                              setFilters
                                          }) {
    //console.log("pages/TransactionsTable rendered");

    // ✅ SORT STATE
    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "desc"   // default: latest first
    });

    // ✅ HANDLE SORT CLICK
    function handleSort(column) {
        setSortConfig((prev) => ({
            key: column,
            direction:
                prev.key === column && prev.direction === "asc"
                    ? "desc"
                    : "asc"
        }));
    }

    // ✅ SORT LOGIC
    const sortedTransactions = useMemo(() => {
        const { key, direction } = sortConfig;

        return [...transactions].sort((a, b) => {

            let valA = a[key];
            let valB = b[key];

            // Handle date (IMPORTANT for your format)
            if (key === "date") {
                const parseDate = (val) => {
                    if (!val) return new Date(0);

                    // DD-MM-YYYY
                    if (typeof val === "string" && /^\d{2}-\d{2}-\d{4}$/.test(val)) {
                        const [d, m, y] = val.split("-");
                        return new Date(`${y}-${m}-${d}`);
                    }

                    // ISO or timestamp
                    return new Date(val);
                };

                valA = parseDate(valA).getTime();
                valB = parseDate(valB).getTime();
            }

            // Handle amount
            if (key === "amount") {
                valA = Number(valA);
                valB = Number(valB);
            }

            // Handle strings (case-insensitive)
            //if (typeof valA === "string") valA = valA.toLowerCase();
            //if (typeof valB === "string") valB = valB.toLowerCase();
            // Normalize null/undefined/empty
            const normalizeString = (val) => {
                if (val === null || val === undefined || val === "") return null;
                return String(val).toLowerCase();
            };

            valA = normalizeString(valA);
            valB = normalizeString(valB);

            // Push empty values to bottom ALWAYS
            if (valA === null && valB === null) return 0;
            if (valA === null) return 1;
            if (valB === null) return -1;

            if (valA < valB) return direction === "asc" ? -1 : 1;
            if (valA > valB) return direction === "asc" ? 1 : -1;

            return 0;
        });

    }, [transactions, sortConfig]);

    // ✅ SORT INDICATOR
    function getSortIndicator(column) {
        if (sortConfig.key !== column) return "";
        return sortConfig.direction === "asc" ? "↑" : "↓";
    }


    return (
        <>
            <div className="flex justify-between items-center">

                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Transactions
                </h1>

                <button
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 dark:bg-gray-700"
                >
                    <Pencil size={16}/>
                    {editMode ? "Finish Editing" : "Edit"}
                </button>

            </div>

            <div className="overflow-y-auto max-h-[650px] border rounded-xl border-gray-200 dark:border-gray-700">

                <table className="w-full text-sm">

                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">

                    {/* ✅ SORT HEADER */}
                    <tr>
                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("date")}>
                            Date {getSortIndicator("date")}
                        </th>

                        <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort("amount")}>
                            Amount {getSortIndicator("amount")}
                        </th>

                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("type")}>
                            Type {getSortIndicator("type")}
                        </th>

                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("category")}>
                            Transaction {getSortIndicator("category")}
                        </th>

                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("mode")}>
                            Payment Mode {getSortIndicator("mode")}
                        </th>

                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("bank")}>
                            Bank {getSortIndicator("bank")}
                        </th>

                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("remarks")}>
                            Remarks {getSortIndicator("remarks")}
                        </th>

                        <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("description")}>
                            Description {getSortIndicator("description")}
                        </th>
                    </tr>

                    {/* ✅ FILTER ROW (restore this) */}
                    <tr className="bg-gray-100 dark:bg-gray-900 text-xs">

                        <th className="px-2 py-2">
                            <input
                                value={filters.date}
                                onChange={(e)=>setFilters({...filters,date:e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                            />
                        </th>

                        <th className="px-2 py-2 flex gap-1">
                            <input
                                placeholder="min"
                                value={filters.minAmount}
                                onChange={(e)=>setFilters({...filters,minAmount:e.target.value})}
                                className="w-16 px-1 py-1 border rounded text-xs"
                            />

                            <input
                                placeholder="max"
                                value={filters.maxAmount}
                                onChange={(e)=>setFilters({...filters,maxAmount:e.target.value})}
                                className="w-16 px-1 py-1 border rounded text-xs"
                            />
                        </th>

                        <th>
                            <input value={filters.type} onChange={(e)=>setFilters({...filters,type:e.target.value})} className="w-full px-2 py-1 border rounded"/>
                        </th>

                        <th>
                            <input value={filters.category} onChange={(e)=>setFilters({...filters,category:e.target.value})} className="w-full px-2 py-1 border rounded"/>
                        </th>

                        <th>
                            <input value={filters.mode} onChange={(e)=>setFilters({...filters,mode:e.target.value})} className="w-full px-2 py-1 border rounded"/>
                        </th>

                        <th>
                            <input value={filters.bank} onChange={(e)=>setFilters({...filters,bank:e.target.value})} className="w-full px-2 py-1 border rounded"/>
                        </th>

                        <th>
                            <input value={filters.remarks} onChange={(e)=>setFilters({...filters,remarks:e.target.value})} className="w-full px-2 py-1 border rounded"/>
                        </th>

                        <th>
                            <input value={filters.description} onChange={(e)=>setFilters({...filters,description:e.target.value})} className="w-full px-2 py-1 border rounded"/>
                        </th>

                    </tr>

                    </thead>

                    <tbody>

                    {sortedTransactions.map((tx) => (
                        <TransactionRow
                            key={tx.id}
                            tx={tx}
                            editMode={editMode}
                            setTransactions={setTransactions}
                            setActiveTx={setActiveTx}
                        />
                    ))}

                    </tbody>

                </table>

            </div>
        </>
    );
}