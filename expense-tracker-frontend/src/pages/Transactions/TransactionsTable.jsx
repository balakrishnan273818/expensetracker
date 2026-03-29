import {useState, useMemo} from "react";
import React from "react";
import TransactionRow from "./TransactionRow";
import {ChevronDown, ChevronRight} from "lucide-react";
import {formatCurrency} from "../../utils/currency";
import DatePicker from "../../components/common/DatePicker";

export default function TransactionsTable({
                                              transactions,
                                              collapsedGroups,
                                              setCollapsedGroups,
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

    function toggleGroup(label) {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            newSet.has(label) ? newSet.delete(label) : newSet.add(label);
            return newSet;
        });
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
        const {key, direction} = sortConfig;

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

    const categoryMap = useMemo(() => {
        const map = {};

        const flatList = isGrouped
            ? transactions.flatMap(g => g.data)
            : transactions;

        flatList.forEach(tx => {
            const category = tx.category || "Others";
            const subcategory = tx.subcategory || "General";

            if (!map[category]) {
                map[category] = new Set();
            }

            map[category].add(subcategory);
        });

        // Convert Set → Array
        Object.keys(map).forEach(key => {
            map[key] = Array.from(map[key]).sort();
        });

        return map;
    }, [transactions, isGrouped]);

    const categoryOptions = Object.keys(categoryMap).sort();

    const subcategoryOptions =
        filters.category && categoryMap[filters.category]
            ? categoryMap[filters.category]
            : [];

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
        <div className="h-full flex flex-col">

            {/* 🔥 PREMIUM FILTER BAR */}
            <div className="mb-3 p-3 rounded-xl border
                bg-white dark:bg-gray-900
                border-gray-200 dark:border-gray-700
                shadow-sm">

                {/* 🔥 ACTIVE FILTER CHIPS */}
                {Object.values(filters).some(v => v !== "" && v !== null) && (
                    <div className="mb-3 flex flex-wrap items-center gap-2">

                        {/* Individual Chips */}
                        {Object.entries(filters).map(([key, value]) => {

                            if (!value) return null;

                            const labelMap = {
                                search: "Search",
                                fromDate: "From",
                                toDate: "To",
                                minAmount: "Min ₹",
                                maxAmount: "Max ₹",
                                type: "Type",
                                bank: "Bank",
                                mode: "Mode",
                                category: "Category"
                            };

                            const displayKey = labelMap[key] || key;

                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-full
                        bg-blue-100 text-blue-700
                        dark:bg-blue-900 dark:text-blue-300"
                                >
                    <span className="font-medium">
                        {displayKey}:
                    </span>

                                    <span>{value}</span>

                                    <button
                                        onClick={() =>
                                            setFilters(prev => ({
                                                ...prev,
                                                [key]: ""
                                            }))
                                        }
                                        className="ml-1 hover:text-red-500"
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}

                        {/* 🔄 CLEAR ALL */}
                        <button
                            onClick={() =>
                                setFilters({
                                    date: "",
                                    fromDate: "",
                                    toDate: "",
                                    minAmount: "",
                                    maxAmount: "",
                                    type: "",
                                    category: "",
                                    mode: "",
                                    bank: "",
                                    search: "",
                                    remarks: "",
                                    description: ""
                                })
                            }
                            className="ml-2 px-3 py-1 text-xs rounded-md
                bg-gray-200 text-gray-700
                hover:bg-gray-300
                dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            Clear All
                        </button>

                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filters.search || ""}
                        onChange={(e) =>
                            setFilters(prev => ({...prev, search: e.target.value}))
                        }
                        className="px-3 py-2 text-sm rounded-md
                            border border-gray-300 dark:border-gray-600
                            bg-gray-50 dark:bg-gray-800
                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* From Date */}
                    <input
                        type="date"
                        value={filters.fromDate || ""}
                        onChange={(e) =>
                            setFilters(prev => ({...prev, fromDate: e.target.value}))
                        }
                        className="px-2 py-2 text-sm rounded-md
                            border border-gray-300 dark:border-gray-600
                            bg-gray-50 dark:bg-gray-800"
                    />

                    {/* To Date */}
                    <input
                        type="date"
                        value={filters.toDate || ""}
                        onChange={(e) =>
                            setFilters(prev => ({...prev, toDate: e.target.value}))
                        }
                        className="px-2 py-2 text-sm rounded-md
                            border border-gray-300 dark:border-gray-600
                            bg-gray-50 dark:bg-gray-800"
                    />

                    {/* Min Amount */}
                    <input
                        type="number"
                        placeholder="Min ₹"
                        value={filters.minAmount || ""}
                        onChange={(e) =>
                            setFilters(prev => ({...prev, minAmount: e.target.value}))
                        }
                        className="w-24 px-2 py-2 text-sm rounded-md
                            border border-gray-300 dark:border-gray-600
                            bg-gray-50 dark:bg-gray-800"
                    />

                    {/* Max Amount */}
                    <input
                        type="number"
                        placeholder="Max ₹"
                        value={filters.maxAmount || ""}
                        onChange={(e) =>
                            setFilters(prev => ({...prev, maxAmount: e.target.value}))
                        }
                        className="w-24 px-2 py-2 text-sm rounded-md
                            border border-gray-300 dark:border-gray-600
                            bg-gray-50 dark:bg-gray-800"
                    />

                    {/* Type */}
                    <select
                        value={filters.type || ""}
                        onChange={(e) =>
                            setFilters(prev => ({...prev, type: e.target.value}))
                        }
                        className="px-2 py-2 text-sm rounded-md
                            border border-gray-300 dark:border-gray-600
                            bg-gray-50 dark:bg-gray-800"
                    >
                        <option value="">All Types</option>
                        <option value="expense">Debit</option>
                        <option value="income">Credit</option>
                        <option value="investment">Investment</option>
                    </select>

                    {/* Category */}
                    <select
                        value={filters.category || ""}
                        onChange={(e) =>
                            setFilters(prev => ({
                                ...prev,
                                category: e.target.value,
                                subcategory: "" // 🔥 reset dependent
                            }))
                        }
                        className="px-2 py-2 text-sm rounded-md
                                    border border-gray-300 dark:border-gray-600
                                    bg-gray-50 dark:bg-gray-800"
                    >
                        <option value="">All Categories</option>
                        {categoryOptions.map(cat => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Subcategory */}
                    <select
                        value={filters.subcategory || ""}
                        onChange={(e) =>
                            setFilters(prev => ({
                                ...prev,
                                subcategory: e.target.value
                            }))
                        }
                        disabled={!filters.category}
                        className="px-2 py-2 text-sm rounded-md
                                    border border-gray-300 dark:border-gray-600
                                    bg-gray-50 dark:bg-gray-800
                                    disabled:opacity-50"
                    >
                        <option value="">All Subcategories</option>
                        {subcategoryOptions.map(sub => (
                            <option key={sub} value={sub}>
                                {sub}
                            </option>
                        ))}
                    </select>

                    {/* Bank */}
                    <select
                        value={filters.bank || ""}
                        onChange={(e) =>
                            setFilters(prev => ({...prev, bank: e.target.value}))
                        }
                        className="px-2 py-2 text-sm rounded-md
                            border border-gray-300 dark:border-gray-600
                            bg-gray-50 dark:bg-gray-800"
                    >
                        <option value="">All Banks</option>
                        <option value="axis">Axis</option>
                        <option value="hdfc">HDFC</option>
                        <option value="idfc">IDFC</option>
                        <option value="cash">Cash</option>
                    </select>

                    {/* Mode */}
                    <select
                        value={filters.mode || ""}
                        onChange={(e) =>
                            setFilters(prev => ({...prev, mode: e.target.value}))
                        }
                        className="px-2 py-2 text-sm rounded-md
                            border border-gray-300 dark:border-gray-600
                            bg-gray-50 dark:bg-gray-800"
                    >
                        <option value="">All Modes</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="netbanking">Net Banking</option>
                        <option value="cash">Cash</option>
                    </select>

                </div>
            </div>

            {/* TABLE */}
            <div className="flex-1 overflow-y-auto border rounded-xl border-gray-200 dark:border-gray-700">

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

                        const isCollapsed = collapsedGroups.has(group.label);

                        return (
                            <React.Fragment key={group.label}>

                                <tr
                                    className="bg-gray-200 dark:bg-gray-700 font-semibold cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                                    onClick={() => toggleGroup(group.label)}
                                >
                                    <td colSpan="9" className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            {isCollapsed
                                                ? <ChevronRight size={16}/>
                                                : <ChevronDown size={16}/>
                                            }
                                            <div className="flex items-center gap-2 text-sm">

                                                {/* Week Label */}
                                                <span className="font-semibold">
                                                    {group.label}
                                                </span>

                                                <span className="text-gray-400">(</span>

                                                {/* Count */}
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {group.count} txns
                                                </span>

                                                {/* Expense */}
                                                <div className="min-w-[100px] flex justify-end">
                                                    <span className="px-3 py-1 rounded-full text-sm font-medium
                                                                    bg-red-100 text-red-700
                                                                    dark:bg-red-700 dark:text-red-100 text-right w-full">
                                                                    {formatCurrency(group.expense || 0)}
                                                    </span>
                                                </div>

                                                {/* Investment */}
                                                <div className="min-w-[100px] flex justify-end">
        <span className="px-3 py-1 rounded-full text-sm font-medium
            bg-blue-100 text-blue-700
            dark:bg-blue-900 dark:text-blue-300 text-right w-full">
            {formatCurrency(group.investment || 0)}
        </span>
                                                </div>

                                                {/* Income */}
                                                <div className="min-w-[100px] flex justify-end">
        <span className="px-3 py-1 rounded-full text-sm font-medium
            bg-green-100 text-green-700
            dark:bg-green-900 dark:text-green-300 text-right w-full">
            {formatCurrency(group.income || 0)}
        </span>
                                                </div>

                                                <span className="text-gray-400">)</span>

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
        </div>
    );
}