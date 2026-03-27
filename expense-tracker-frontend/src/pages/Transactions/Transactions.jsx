import { useState, useEffect, useMemo } from "react";
//import { useSearchParams } from "react-router-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    getTransactions,
    updateTransactionCategory,
    createTransaction,
    deleteTransaction as deleteTransactionAPI
} from "../../api/transactions";
import { parseISO, format, isValid } from "date-fns";
import { Pencil, RotateCcw, Download, Plus, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

import TransactionsTable from "./TransactionsTable";
import EditTransactionModal from "./EditTransactionModal";
import PageHeader from "../../components/common/PageHeader";
import { useMonth } from "../../context/MonthContext";
import { useToast } from "../../context/ToastContext";

export default function Transactions() {

    const navigate = useNavigate();
    const { year, month, setYear, setMonth } = useMonth();
    const { addToast } = useToast();

    const [searchParams] = useSearchParams();

    const [transactions, setTransactions] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [activeTx, setActiveTx] = useState(null);
    const [selectedTxIds, setSelectedTxIds] = useState(new Set());

    // ✅ Query params
    const queryDate = searchParams.get("date") || "";
    const queryCategory = searchParams.get("category") || "";

    // ✅ UI-controlled filters
    const [filters, setFilters] = useState({
        date: queryDate,
        type: "",
        category: queryCategory,
        mode: "",
        bank: "",
        remarks: "",
        description: ""
    });

    // ✅ Derived filters (no setState in effect)
    const effectiveFilters = useMemo(() => {
        return {
            ...filters,
            date: queryDate || filters.date,
            category: queryCategory || filters.category
        };
    }, [filters, queryDate, queryCategory]);

    // ✅ Load transactions
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

    // ✅ Filtering (FIXED)
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {

            if (!tx.parsedDate) return false;

            const txMonth = tx.parsedDate.getMonth();
            const txYear = tx.parsedDate.getFullYear();

            // ✅ FIXED DATE (no ISO)
            const y = tx.parsedDate.getFullYear();
            const m = String(tx.parsedDate.getMonth() + 1).padStart(2, "0");
            const d = String(tx.parsedDate.getDate()).padStart(2, "0");
            const txDateStr = `${y}-${m}-${d}`;

            return (
                // ✅ DATE FILTER
                (!effectiveFilters.date || txDateStr === effectiveFilters.date) &&
                (effectiveFilters.date || (txMonth === month && txYear === year)) &&

                // ✅ TYPE
                (!effectiveFilters.type ||
                    (tx.type || "").toLowerCase().includes(effectiveFilters.type.toLowerCase())
                ) &&

                // ✅ CATEGORY (FIXED STRICT MATCH)
                (!effectiveFilters.category ||
                    (tx.category || "").toLowerCase().trim() ===
                    effectiveFilters.category.toLowerCase().trim()
                ) &&

                // ✅ MODE
                (!effectiveFilters.mode ||
                    (tx.mode || "").includes(effectiveFilters.mode.toLowerCase())
                ) &&

                // ✅ BANK
                (!effectiveFilters.bank || (
                    tx.isCash
                        ? "cash".includes(effectiveFilters.bank.toLowerCase())
                        : (tx.bank || "").toLowerCase().includes(effectiveFilters.bank.toLowerCase())
                )) &&

                // ✅ REMARKS
                (!effectiveFilters.remarks ||
                    (tx.remarks || "").toLowerCase().includes(effectiveFilters.remarks.toLowerCase())
                ) &&

                // ✅ DESCRIPTION
                (!effectiveFilters.description ||
                    (tx.description || "").toLowerCase().includes(effectiveFilters.description.toLowerCase())
                )
            );
        });
    }, [transactions, effectiveFilters, month, year]);

    // ✅ Grouping with totals
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
            .map(([week, data]) => {

                const count = data.length;

                const total = data.reduce((sum, tx) => {
                    const type = (tx.type || "").toLowerCase();

                    if (type === "expense" || type === "investment") {
                        return sum - Math.abs(tx.amount);
                    }

                    return sum; // ignore income / transfer
                }, 0);

                return {
                    label: `Week ${week}`,
                    count,
                    total,
                    data
                };
            })
            .filter(group => group.data.length > 0);

    }, [filteredTransactions]);

    // ✅ Selection
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

    // ✅ Create
    async function handleCreateTransaction(tx) {
        try {
            if (!tx.amount || !tx.category || !tx.date) {
                addToast("Please fill required fields", "error");
                return;
            }

            const created = await createTransaction({
                ...tx,
                amount: Number(tx.amount),
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

    // ✅ Delete
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

    // ✅ Update
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
                            ? { ...tx, ...activeTx }
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
                            ? { ...tx, ...activeTx }
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

        // ✅ Clear UI filters
        setFilters({
            date: "",
            type: "",
            category: "",
            mode: "",
            bank: "",
            remarks: "",
            description: ""
        });

        // ✅ Clear URL params
        navigate("/transactions", { replace: true });
    }

    // ✅ Download
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
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-md
                                bg-gray-200 text-gray-800
                                hover:bg-gray-300
                                dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600
                                transition"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <button
                            onClick={() => setActiveTx({
                                isNew: true,
                                mode: "cash",
                                type: "expense",
                                category: "Others",
                                date: new Date().toISOString().slice(0, 10)
                            })}
                            className="p-2 rounded-md
                                bg-gray-200 text-gray-800
                                hover:bg-gray-300
                                dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600
                                transition"
                        >
                            <Plus size={16} />
                        </button>

                        <button onClick={() => setEditMode(prev => !prev)}
                                className={`p-2 rounded-md transition
                                    ${editMode
                                    ? "bg-blue-600 text-white hover:bg-blue-500"
                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                }`}
                        >
                            <Pencil size={16} />
                        </button>

                        <button onClick={handleDownload}
                                className="p-2 rounded-md
                                bg-gray-200 text-gray-800
                                hover:bg-gray-300
                                dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600
                                transition"
                        >
                            <Download size={16} />
                        </button>

                        <button onClick={resetFilters}
                                className="p-2 rounded-md
                                bg-gray-200 text-gray-800
                                hover:bg-gray-300
                                dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600
                                transition"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                }
            />

            <div className="flex-1 min-h-0 mt-4">
                <TransactionsTable
                    transactions={groupedTransactions}
                    isGrouped={true}
                    filters={filters}
                    setFilters={setFilters}
                    setTransactions={setTransactions}
                    editMode={editMode}
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