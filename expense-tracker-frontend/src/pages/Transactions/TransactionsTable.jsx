import { useState, useMemo } from "react";
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

    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "desc"
    });

    function handleSort(column) {
        setSortConfig((prev) => ({
            key: column,
            direction:
                prev.key === column && prev.direction === "asc"
                    ? "desc"
                    : "asc"
        }));
    }

    const sortedTransactions = useMemo(() => {
        const { key, direction } = sortConfig;

        return [...transactions].sort((a, b) => {

            let valA = a[key];
            let valB = b[key];

            if (key === "date") {
                const parseDate = (val) => {
                    if (!val) return new Date(0);

                    if (typeof val === "string" && /^\d{2}-\d{2}-\d{4}$/.test(val)) {
                        const [d, m, y] = val.split("-");
                        return new Date(`${y}-${m}-${d}`);
                    }

                    return new Date(val);
                };

                valA = parseDate(valA).getTime();
                valB = parseDate(valB).getTime();
            }

            if (key === "amount") {
                valA = Number(valA);
                valB = Number(valB);
            }

            const normalizeString = (val) => {
                if (val === null || val === undefined || val === "") return null;
                return String(val).toLowerCase();
            };

            valA = normalizeString(valA);
            valB = normalizeString(valB);

            if (valA === null && valB === null) return 0;
            if (valA === null) return 1;
            if (valB === null) return -1;

            if (valA < valB) return direction === "asc" ? -1 : 1;
            if (valA > valB) return direction === "asc" ? 1 : -1;

            return 0;
        });

    }, [transactions, sortConfig]);

    function getSortIndicator(column) {
        if (sortConfig.key !== column) return "";
        return sortConfig.direction === "asc" ? "↑" : "↓";
    }

    return (
        <div className="overflow-y-auto max-h-[650px] border rounded-xl border-gray-200 dark:border-gray-700">

            <table className="w-full text-sm">

                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">

                <tr>
                    <th className="px-4 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort("date")}>
                        Date {getSortIndicator("date")}
                    </th>

                    <th className="px-4 py-3 text-right cursor-pointer whitespace-nowrap" onClick={() => handleSort("amount")}>
                        Amount {getSortIndicator("amount")}
                    </th>

                    <th className="px-4 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort("type")}>
                        Type {getSortIndicator("type")}
                    </th>

                    <th className="px-4 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort("category")}>
                        Transaction {getSortIndicator("category")}
                    </th>

                    <th className="px-4 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort("mode")}>
                        Payment Mode {getSortIndicator("mode")}
                    </th>

                    <th className="px-4 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort("bank")}>
                        Bank {getSortIndicator("bank")}
                    </th>

                    <th className="px-4 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort("remarks")}>
                        Remarks {getSortIndicator("remarks")}
                    </th>

                    <th className="px-4 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort("description")}>
                        Description {getSortIndicator("description")}
                    </th>
                </tr>

                <tr className="bg-gray-100 dark:bg-gray-900 text-xs">

                    <th className="px-2 py-2">
                        <input
                            value={filters.date}
                            onChange={(e)=>setFilters({...filters,date:e.target.value})}
                            className="w-full px-2 py-1 border rounded"
                        />
                    </th>

                    <th className="px-2 py-2">
                        <input className="w-full px-2 py-1 border rounded" disabled />
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
    );
}