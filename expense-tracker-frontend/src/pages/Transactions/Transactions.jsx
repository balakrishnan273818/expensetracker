import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getTransactions, updateTransactionCategory } from "../../api/transactions";
import { parseISO, format, isValid } from "date-fns";
import { Pencil, RotateCcw, Download } from "lucide-react";
import * as XLSX from "xlsx";

import TransactionsTable from "./TransactionsTable";
import EditTransactionModal from "./EditTransactionModal";
import PageHeader from "../../components/common/PageHeader";
import { useMonth } from "../../context/MonthContext";
import { useToast } from "../../context/ToastContext"; // adjust if needed

export default function Transactions() {

    const { year, month, setYear, setMonth } = useMonth();
    const { showToast } = useToast();

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

    // ✅ Filtering
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {

            if (!tx.parsedDate) return false;

            const txMonth = tx.parsedDate.getMonth();
            const txYear = tx.parsedDate.getFullYear();

            return (
                (!filters.date || tx.date?.slice(0, 10) === filters.date) &&
                (filters.date || (txMonth === month && txYear === year)) &&
                (!filters.type || (tx.type || "").toLowerCase().includes(filters.type.toLowerCase())) &&
                (!filters.category || (tx.category || "").toLowerCase().includes(filters.category.toLowerCase())) &&
                (!filters.mode || (tx.mode || "").toLowerCase().includes(filters.mode.toLowerCase())) &&
                (!filters.bank || (tx.bank || "").toLowerCase().includes(filters.bank.toLowerCase())) &&
                (!filters.remarks || (tx.remarks || "").toLowerCase().includes(filters.remarks.toLowerCase())) &&
                (!filters.description || (tx.description || "").toLowerCase().includes(filters.description.toLowerCase()))
            );
        });
    }, [transactions, filters, month, year]);

    // ✅ Week grouping
    const groupedTransactions = useMemo(() => {

        const weeks = { 1: [], 2: [], 3: [], 4: [], 5: [] };

        filteredTransactions.forEach(tx => {
            const day = tx.parsedDate.getDate();

            if (day <= 7) weeks[1].push(tx);
            else if (day <= 14) weeks[2].push(tx);
            else if (day <= 21) weeks[3].push(tx);
            else if (day <= 28) weeks[4].push(tx);
            else weeks[5].push(tx);
        });

        return Object.entries(weeks)
            .map(([week, data]) => ({
                label: `Week ${week}`,
                data
            }))
            .filter(group => group.data.length > 0);

    }, [filteredTransactions]);

    // ✅ Download XLSX
    function handleDownload() {
        try {

            const flatData = groupedTransactions.flatMap(group =>
                group.data.map(tx => ({
                    Week: group.label,
                    Date: tx.formattedDate,
                    Amount: `₹${tx.amount}`,
                    Type: tx.type,
                    Category: tx.category,
                    Subcategory: tx.subcategory,
                    Mode: tx.mode,
                    Bank: tx.bank,
                    Remarks: tx.remarks,
                    Description: tx.description
                }))
            );

            if (!flatData.length) {
                showToast("No transactions to download", "error");
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(flatData);

            // ✅ Column widths
            worksheet["!cols"] = [
                { wch: 10 }, // Week
                { wch: 15 }, // Date
                { wch: 12 }, // Amount
                { wch: 10 }, // Type
                { wch: 20 }, // Category
                { wch: 20 }, // Subcategory
                { wch: 15 }, // Mode
                { wch: 15 }, // Bank
                { wch: 25 }, // Remarks
                { wch: 30 }  // Description
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

            const fileName = `transactions_${month + 1}_${year}.xlsx`;

            XLSX.writeFile(workbook, fileName);

            showToast("Download completed successfully", "success");

        } catch (err) {
            console.error(err);
            showToast("Download failed", "error");
        }
    }

    // ✅ Update
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
        <div className="flex flex-col h-[calc(100vh-120px)] w-full">

            {/* Header */}
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

                        {/* Download */}
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700"
                            title="Download as Excel"
                        >
                            <Download size={16} />
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
            <div className="flex-1 min-h-0 mt-4">
                <TransactionsTable
                    transactions={groupedTransactions}
                    isGrouped={true}
                    filters={filters}
                    setFilters={setFilters}
                    setTransactions={setTransactions}
                    editMode={editMode}
                    setEditMode={setEditMode}
                    setActiveTx={setActiveTx}
                />
            </div>

            {/* Date Notice */}
            {filters.date && (
                <div className="text-sm text-red-500 mt-2">
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