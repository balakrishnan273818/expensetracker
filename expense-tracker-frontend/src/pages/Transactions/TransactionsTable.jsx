import { useState, useMemo } from "react";
import React from "react";
import TransactionRow from "./TransactionRow";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "../../utils/currency"; // ✅ added

export default function TransactionsTable({
                                              transactions,
                                              setTransactions,
                                              editMode,
                                              setActiveTx,
                                              filters,
                                              setFilters,
                                              isGrouped = false,

                                              selectedTxIds,
                                              toggleSelect,
                                              selectAll,
                                              onDelete
                                          }) {

    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "desc"
    });

    const [collapsedGroups, setCollapsedGroups] = useState({});

    function toggleGroup(label) {
        setCollapsedGroups(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    }

    function handleSort(column) {
        setSortConfig((prev) => ({
            key: column,
            direction:
                prev.key === column && prev.direction === "asc"
                    ? "desc"
                    : "asc"
        }));
    }

    function sortList(list) {
        const { key, direction } = sortConfig;

        return [...list].sort((a, b) => {

            let valA = a[key];
            let valB = b[key];

            if (key === "date") {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }

            if (key === "amount") {
                valA = Number(valA);
                valB = Number(valB);
            }

            const normalize = (val) => {
                if (val === null || val === undefined || val === "") return null;
                return String(val).toLowerCase();
            };

            valA = normalize(valA);
            valB = normalize(valB);

            if (valA === null && valB === null) return 0;
            if (valA === null) return 1;
            if (valB === null) return -1;

            if (valA < valB) return direction === "asc" ? -1 : 1;
            if (valA > valB) return direction === "asc" ? 1 : -1;

            return 0;
        });
    }

    const processedData = useMemo(() => {

        if (!isGrouped) return sortList(transactions);

        return transactions.map(group => ({
            ...group,
            data: sortList(group.data)
        }));

    }, [transactions, sortConfig, isGrouped]);

    function getSortIndicator(column) {
        if (sortConfig.key !== column) return "";
        return sortConfig.direction === "asc" ? "↑" : "↓";
    }

    const allTransactionIds = useMemo(() => {
        if (!isGrouped) return processedData.map(tx => tx.id);
        return processedData.flatMap(group => group.data.map(tx => tx.id));
    }, [processedData, isGrouped]);

    const isAllSelected =
        allTransactionIds.length > 0 &&
        allTransactionIds.every(id => selectedTxIds.has(id));

    return (
        <div className="h-full overflow-y-auto border rounded-xl border-gray-200 dark:border-gray-700">

            <table className="w-full text-sm">

                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 z-10">

                <tr>
                    <th className="px-2 py-3">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) =>
                                e.target.checked
                                    ? selectAll(allTransactionIds)
                                    : selectAll([])
                            }
                        />
                    </th>

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

                <tr className="bg-gray-100 dark:bg-gray-900 text-xs">
                    <th></th>
                    <th className="px-2 py-2">
                        <input value={filters.date} onChange={(e)=>setFilters({...filters,date:e.target.value})} className="w-full px-2 py-1 border rounded"/>
                    </th>
                    <th><input disabled className="w-full px-2 py-1 border rounded"/></th>
                    <th><input value={filters.type} onChange={(e)=>setFilters({...filters,type:e.target.value})} className="w-full px-2 py-1 border rounded"/></th>
                    <th><input value={filters.category} onChange={(e)=>setFilters({...filters,category:e.target.value})} className="w-full px-2 py-1 border rounded"/></th>
                    <th><input value={filters.mode} onChange={(e)=>setFilters({...filters,mode:e.target.value})} className="w-full px-2 py-1 border rounded"/></th>
                    <th><input value={filters.bank} onChange={(e)=>setFilters({...filters,bank:e.target.value})} className="w-full px-2 py-1 border rounded"/></th>
                    <th><input value={filters.remarks} onChange={(e)=>setFilters({...filters,remarks:e.target.value})} className="w-full px-2 py-1 border rounded"/></th>
                    <th><input value={filters.description} onChange={(e)=>setFilters({...filters,description:e.target.value})} className="w-full px-2 py-1 border rounded"/></th>
                </tr>

                </thead>

                <tbody>

                {!isGrouped && processedData.map((tx) => (
                    <TransactionRow
                        key={tx.id}
                        tx={tx}
                        editMode={editMode}
                        setTransactions={setTransactions}
                        setActiveTx={setActiveTx}
                        isSelected={selectedTxIds.has(tx.id)}
                        toggleSelect={toggleSelect}
                        onDelete={onDelete}
                    />
                ))}

                {isGrouped && processedData.map((group) => {

                    const isCollapsed = collapsedGroups[group.label];

                    return (
                        <React.Fragment key={group.label}>

                            <tr
                                className="bg-gray-200 dark:bg-gray-700 font-semibold cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                                onClick={() => toggleGroup(group.label)}
                            >
                                <td colSpan="9" className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}

                                        {/* ✅ UPDATED HEADER */}
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <span className="font-semibold">{group.label}</span>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                ({group.count} txns,
                                            </span>

                                            <span className="text-gray-500 dark:text-gray-400">
                                                Expense:
                                            </span>

                                            <span className={group.total < 0 ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                                                {formatCurrency(group.total)}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400">)</span>
                                        </div>

                                    </div>
                                </td>
                            </tr>

                            {!isCollapsed && group.data.map((tx) => (
                                <TransactionRow
                                    key={tx.id}
                                    tx={tx}
                                    editMode={editMode}
                                    setTransactions={setTransactions}
                                    setActiveTx={setActiveTx}
                                    isSelected={selectedTxIds.has(tx.id)}
                                    toggleSelect={toggleSelect}
                                    onDelete={onDelete}
                                />
                            ))}

                        </React.Fragment>
                    );
                })}

                </tbody>

            </table>

        </div>
    );
}