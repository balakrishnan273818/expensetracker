import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getTransactions, updateTransactionCategory } from "../../api/transactions";
import { parseISO, format, isValid } from "date-fns";
//import { ChevronLeft, ChevronRight } from "lucide-react";
//import { Pencil } from "lucide-react";
import { Pencil, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

import TransactionsTable from "./TransactionsTable";
import EditTransactionModal from "./EditTransactionModal";

export default function Transactions() {

    const [searchParams] = useSearchParams();

    const [transactions, setTransactions] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [activeTx, setActiveTx] = useState(null);

    // ✅ FIX: use null instead of "null"
    const [selectedMonth, setSelectedMonth] = useState(null);

    // ✅ Initialize filters from URL
    const [filters, setFilters] = useState(() => ({
        date: searchParams.get("date") || "",
        type: "",
        category: "",
        mode: "",
        bank: "",
        remarks: "",
        description: ""
    }));

    // ✅ Fetch transactions
    useEffect(() => {

        async function loadTransactions() {

            try {

                const data = await getTransactions();

                const normalized = data.map(tx => {

                    const parsed = tx.date ? parseISO(tx.date) : null;
                    const valid = parsed && isValid(parsed);

                    return {
                        ...tx,
                        subcategory: tx.subcategory ?? tx.sub_category,
                        parsedDate: valid ? parsed : null,
                        monthKey: valid ? format(parsed, "MMMM yyyy") : "",
                        formattedDate: valid ? format(parsed, "dd MMM yyyy") : "-",
                        mode: tx.mode || "",
                        bank: tx.bank || ""
                    };

                });

                setTransactions(normalized);

            } catch (err) {
                console.error("Error fetching transactions:", err);
            }

        }

        loadTransactions();

    }, []);

    // ✅ Available months (latest → oldest)
    const availableMonths = useMemo(() => {

        const map = new Map();

        transactions.forEach(tx => {

            if (!tx.monthKey || !tx.parsedDate) return;

            const monthNumber = tx.parsedDate.getMonth();
            const year = tx.parsedDate.getFullYear();

            const sortKey = year * 100 + monthNumber;

            map.set(tx.monthKey, sortKey);

        });

        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);

    }, [transactions]);

    // ✅ Effective month
    const effectiveMonth = selectedMonth || availableMonths[0] || "";

    // ✅ Navigation
    function prevMonth() {
        const currentIndex = availableMonths.indexOf(effectiveMonth);
        if (currentIndex < availableMonths.length - 1) {
            setSelectedMonth(availableMonths[currentIndex + 1]);
        }
    }

    function nextMonth() {
        const currentIndex = availableMonths.indexOf(effectiveMonth);
        if (currentIndex > 0) {
            setSelectedMonth(availableMonths[currentIndex - 1]);
        }
    }

    // ✅ Filtering logic
    const filteredTransactions = useMemo(() => {

        return transactions.filter(tx => {

            return (

                (!filters.date ||
                    tx.date?.slice(0, 10) === filters.date) &&

                (filters.date || effectiveMonth === "" || tx.monthKey === effectiveMonth) &&

                (!filters.type ||
                    (tx.type || "").toLowerCase().includes(filters.type.toLowerCase())) &&

                (!filters.category ||
                    (tx.category || "").toLowerCase().includes(filters.category.toLowerCase())) &&

                (!filters.mode ||
                    (tx.mode || "").toLowerCase().includes(filters.mode.toLowerCase())) &&

                (!filters.bank ||
                    (tx.bank || "").toLowerCase().includes(filters.bank.toLowerCase())) &&

                (!filters.remarks ||
                    (tx.remarks || "").toLowerCase().includes(filters.remarks.toLowerCase())) &&

                (!filters.description ||
                    (tx.description || "").toLowerCase().includes(filters.description.toLowerCase()))

            );

        });

    }, [transactions, filters, effectiveMonth]);

    // ✅ Save category update
    async function saveCategoryUpdate(activeTx) {

        try {

            await updateTransactionCategory(
                activeTx.id,
                activeTx.category,
                activeTx.subcategory,
                activeTx.type
            );

            setTransactions(prev =>
                prev.map(tx =>
                    tx.id === activeTx.id
                        ? {
                            ...tx,
                            category: activeTx.category,
                            subcategory: activeTx.subcategory,
                            type: activeTx.type
                        }
                        : tx
                )
            );

            setActiveTx(null);

        } catch (err) {
            console.error("Failed to update transaction:", err);
        }

    }

    function resetFilters() {
        setFilters({
            date: "",
            type: "",
            category: "",
            mode: "",
            bank: "",
            remarks: "",
            description: ""
        });
    }

    return (
        <div className="space-y-6 w-full">

            {/* ✅ TOP ROW: Title (left) + Month Navigator (right) */}
            <div className="flex justify-between items-center">

                {/* ✅ TITLE + EDIT (grouped together) */}
                <div className="flex items-center gap-3">

                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        Transactions
                    </h1>

                    {/* Edit */}
                    <button
                        onClick={() => setEditMode(prev => !prev)}
                        className="p-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700"
                        title={editMode ? "Finish Editing" : "Edit Transactions"}
                    >
                        <Pencil size={16} />
                    </button>

                    {/* Refresh / Clear Filters */}
                    {(filters.date ||
                        filters.type ||
                        filters.category ||
                        filters.mode ||
                        filters.bank ||
                        filters.remarks ||
                        filters.description) && (

                        <button
                            onClick={resetFilters}
                            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Clear Filters"
                        >
                            <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        </button>

                    )}

                </div>

                {/* RIGHT: Month Navigator */}
                <div className="flex items-center gap-3">

                    <button
                        onClick={prevMonth}
                        disabled={availableMonths.indexOf(effectiveMonth) === availableMonths.length - 1}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>

                    <span className="flex items-center h-full font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
                    {effectiveMonth || "No data"}
                    </span>

                    <button
                        onClick={nextMonth}
                        disabled={availableMonths.indexOf(effectiveMonth) === 0}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>

                </div>

            </div>



            {/* ✅ TABLE */}
            <TransactionsTable
                transactions={filteredTransactions}
                filters={filters}
                setFilters={setFilters}
                setTransactions={setTransactions}
                editMode={editMode}
                setEditMode={setEditMode}
                setActiveTx={setActiveTx}
            />

            {/* ✅ BOTTOM: DATE NOTIFICATION */}
            {filters.date && (
                <div className="text-sm text-red-500">
                    Showing transactions for: {filters.date}
                </div>
            )}

            {activeTx && (
                <EditTransactionModal
                    activeTx={activeTx}
                    setActiveTx={setActiveTx}
                    onSave={saveCategoryUpdate}
                />
            )}

        </div>
    );
}