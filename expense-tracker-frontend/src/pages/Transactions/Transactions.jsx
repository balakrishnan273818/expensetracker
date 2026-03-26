import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
    getTransactions,
    updateTransactionCategory,
    createTransaction,
    deleteTransaction as deleteTransactionAPI
} from "../../api/transactions";
import { parseISO, format, isValid } from "date-fns";
import { Pencil, RotateCcw, Download } from "lucide-react";
import * as XLSX from "xlsx";

import TransactionsTable from "./TransactionsTable";
import EditTransactionModal from "./EditTransactionModal";
import PageHeader from "../../components/common/PageHeader";
import { useMonth } from "../../context/MonthContext";
import { useToast } from "../../context/ToastContext";
import { Plus, IndianRupee } from "lucide-react";

export default function Transactions() {

    const { year, month, setYear, setMonth } = useMonth();
    const { addToast } = useToast();

    const [searchParams] = useSearchParams();

    const [transactions, setTransactions] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [activeTx, setActiveTx] = useState(null);

    const [selectedTxIds, setSelectedTxIds] = useState(new Set());

    const [filters, setFilters] = useState(() => ({
        date: searchParams.get("date") || "",
        type: "",
        category: "",
        mode: "",
        bank: "",
        remarks: "",
        description: ""
    }));

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
                        mode: (tx.mode || "").toLowerCase(),
                        isCash: (tx.mode || "").toLowerCase() === "cash",
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
                (!filters.mode || (tx.mode || "").includes(filters.mode.toLowerCase())) &&
                (!filters.bank || (
                    tx.isCash
                        ? "cash".includes(filters.bank.toLowerCase())
                        : (tx.bank || "").toLowerCase().includes(filters.bank.toLowerCase())
                )) &&
                (!filters.remarks || (tx.remarks || "").toLowerCase().includes(filters.remarks.toLowerCase())) &&
                (!filters.description || (tx.description || "").toLowerCase().includes(filters.description.toLowerCase()))
            );
        });
    }, [transactions, filters, month, year]);

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

    function toggleSelect(id) {
        setSelectedTxIds(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    }

    function selectAll(ids) {
        setSelectedTxIds(new Set(ids));
    }

    function clearSelection() {
        setSelectedTxIds(new Set());
    }

    async function handleCreateTransaction(tx) {
        try {

            // ✅ VALIDATION (ADD HERE)
            if (!tx.amount || !tx.category || !tx.date) {
                addToast("Please fill required fields", "error");
                return;
            }

            const created = await createTransaction({
                ...tx,
                amount: Number(tx.amount),   // ✅ ensure number
                mode: "cash"
            });

            const parsed = parseISO(created.date);

            setTransactions(prev => [
                {
                    ...created,
                    parsedDate: parsed,
                    formattedDate: format(parsed, "dd MMM yyyy"),
                    isCash: true
                },
                ...prev
            ]);

            addToast("Cash transaction added", "success");

        } catch (err) {
            console.error(err);
            addToast("Failed to add transaction", "error");
        }
    }

    async function deleteTransaction(id) {
        try {
            const tx = transactions.find(t => t.id === id);
            if (!tx || !tx.isCash) {
                addToast("Only cash transactions can be deleted", "error");
                return;
            }

            await deleteTransactionAPI(id);

            setTransactions(prev => prev.filter(t => t.id !== id));

            addToast("Transaction deleted", "success");

        } catch (err) {
            console.error(err);
            addToast("Delete failed", "error");
        }
    }

    async function saveCategoryUpdate(activeTx) {
        try {

            if (activeTx.isNew) {
                await handleCreateTransaction(activeTx);
                setActiveTx(null);
                return;
            }

            if (activeTx.bulk) {

                const ids = Array.from(selectedTxIds);

                await Promise.all(
                    ids.map(id =>
                        updateTransactionCategory(
                            id,
                            activeTx.category,
                            activeTx.subcategory,
                            activeTx.type
                        )
                    )
                );

                setTransactions(prev =>
                    prev.map(tx =>
                        selectedTxIds.has(tx.id)
                            ? {
                                ...tx,
                                category: activeTx.category,
                                subcategory: activeTx.subcategory,
                                type: activeTx.type
                            }
                            : tx
                    )
                );

                clearSelection();

            } else {

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
            }

            setActiveTx(null);

        } catch (err) {
            console.error("Update failed:", err);
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
                addToast("No transactions to download", "error");
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(flatData);

            worksheet["!cols"] = [
                { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 10 },
                { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
                { wch: 25 }, { wch: 30 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

            XLSX.writeFile(workbook, `transactions_${month + 1}_${year}.xlsx`);

            addToast("Download completed successfully", "success");

        } catch (err) {
            console.error(err);
            addToast("Download failed", "error");
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full">

            <PageHeader
                title="Transactions"
                year={year}
                month={month}
                setYear={setYear}
                setMonth={setMonth}
                actions={
                    <div className="flex items-center gap-2">

                        {/* Add Cash */}
                        <button
                            title="Add transaction"
                            onClick={() => setActiveTx({
                                isNew: true,
                                mode: "cash",
                                type: "expense",
                                category: "Others",
                                date: new Date().toISOString().slice(0, 10)
                            })}
                            className="flex items-center gap-2 px-3 py-2 rounded-md
                                     bg-gray-900 text-white
                                     hover:bg-gray-800
                                     dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            <Plus size={16} />
                        </button>

                        <button
                            onClick={() => setEditMode(prev => !prev)}
                            className="p-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700"
                        >
                            <Pencil size={16} />
                        </button>

                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700"
                        >
                            <Download size={16} />
                        </button>

                        {(filters.date || filters.type || filters.category ||
                            filters.mode || filters.bank || filters.remarks || filters.description) && (
                            <button
                                onClick={resetFilters}
                                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                            </button>
                        )}
                    </div>
                }
            />

            {selectedTxIds.size > 0 && (
                <div className="flex items-center justify-between p-2 mt-2 bg-blue-50 dark:bg-gray-800 border rounded-md">
                    <span className="text-sm">{selectedTxIds.size} selected</span>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTx({ bulk: true })}
                            className="px-3 py-1 bg-gray-900 text-white rounded-md"
                        >
                            Edit Selected
                        </button>

                        <button
                            onClick={clearSelection}
                            className="px-3 py-1 border rounded-md"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

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
                    selectedTxIds={selectedTxIds}
                    toggleSelect={toggleSelect}
                    selectAll={selectAll}
                    onDelete={deleteTransaction}
                />
            </div>

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
