import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getTransactions, updateTransactionCategory } from "../../api/transactions";
import { parseISO, format, isValid } from "date-fns";
import { Pencil, RotateCcw } from "lucide-react";

import TransactionsTable from "./TransactionsTable";
import EditTransactionModal from "./EditTransactionModal";
import PageHeader from "../../components/common/PageHeader";
import { useMonth } from "../../context/MonthContext";

export default function Transactions() {

    const { year, month, setYear, setMonth } = useMonth();

    const [searchParams] = useSearchParams();

    const [transactions, setTransactions] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [activeTx, setActiveTx] = useState(null);

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

    // ✅ Filtering logic (UPDATED)
    const filteredTransactions = useMemo(() => {

        return transactions.filter(tx => {

            if (!tx.parsedDate) return false;

            const txMonth = tx.parsedDate.getMonth();
            const txYear = tx.parsedDate.getFullYear();

            return (

                // Date filter
                (!filters.date ||
                    tx.date?.slice(0, 10) === filters.date) &&

                // Month filter (GLOBAL)
                (filters.date || (txMonth === month && txYear === year)) &&

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

    }, [transactions, filters, month, year]);

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

            {/* ✅ Reusable Header */}
            <PageHeader
                title="Transactions"
                year={year}
                month={month}
                setYear={setYear}
                setMonth={setMonth}
                actions={
                    <div className="flex items-center gap-2">

                        {/* Edit */}
                        <button
                            onClick={() => setEditMode(prev => !prev)}
                            className="p-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700"
                            title={editMode ? "Finish Editing" : "Edit Transactions"}
                        >
                            <Pencil size={16} />
                        </button>

                        {/* Reset Filters */}
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
                }
            />

            {/* Table */}
            <TransactionsTable
                transactions={filteredTransactions}
                filters={filters}
                setFilters={setFilters}
                setTransactions={setTransactions}
                editMode={editMode}
                setEditMode={setEditMode}
                setActiveTx={setActiveTx}
            />

            {/* Date Notice */}
            {filters.date && (
                <div className="text-sm text-red-500">
                    Showing transactions for: {filters.date}
                </div>
            )}

            {/* Modal */}
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