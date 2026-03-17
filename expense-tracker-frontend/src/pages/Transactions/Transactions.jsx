import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getTransactions, updateTransactionCategory } from "../../api/transactions";
import { parseISO, format, isValid } from "date-fns";

import TransactionsTable from "./TransactionsTable";
import EditTransactionModal from "./EditTransactionModal";

export default function Transactions() {

    const [searchParams] = useSearchParams();

    const [transactions, setTransactions] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [activeTx, setActiveTx] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState("");

    // ✅ Initialize filters from URL (CRITICAL FIX)
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

    // ✅ Available months
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
            .sort((a,b)=> b[1] - a[1])
            .map(entry => entry[0]);

    }, [transactions]);

    // ✅ Default selected month
    useEffect(() => {

        if (!selectedMonth && availableMonths.length > 0) {
            setSelectedMonth(availableMonths[0]);
        }

    }, [availableMonths, selectedMonth]);

    // ✅ Filtering logic (FIXED)
    const filteredTransactions = useMemo(() => {

        return transactions.filter(tx => {

            return (

                // ✅ Exact date match (safe)
                (!filters.date ||
                    tx.date?.slice(0, 10) === filters.date) &&

                // ✅ Month filter ONLY if no date filter
                (filters.date || selectedMonth === "" || tx.monthKey === selectedMonth) &&

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

    }, [transactions, filters, selectedMonth]);

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

    return (
        <div className="space-y-6 w-full">

            {/* ✅ Active Date Indicator */}
            {filters.date && (
                <div className="text-sm text-blue-600">
                    Showing transactions for: {filters.date}
                </div>
            )}

            {/* Month Tabs */}
            <div className="flex gap-2 flex-wrap">

                {availableMonths.map(month => (

                    <button
                        key={month}
                        onClick={() => setSelectedMonth(month)}
                        className={`px-3 py-1 rounded-full text-sm border
                        ${selectedMonth === month
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300"}`}
                    >
                        {month}
                    </button>

                ))}

            </div>

            <TransactionsTable
                transactions={filteredTransactions}
                filters={filters}
                setFilters={setFilters}
                setTransactions={setTransactions}
                editMode={editMode}
                setEditMode={setEditMode}
                setActiveTx={setActiveTx}
            />

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