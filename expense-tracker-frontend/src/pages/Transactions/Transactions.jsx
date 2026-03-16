import { useState, useEffect } from "react";
import { getTransactions, updateTransactionCategory } from "../../api/transactions";

import TransactionsTable from "./TransactionsTable";
import EditTransactionModal from "./EditTransactionModal";

export default function Transactions() {

    const [transactions, setTransactions] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [activeTx, setActiveTx] = useState(null);

    const [filters, setFilters] = useState({
        date: "",
        type: "",
        category: "",
        mode: "",
        remarks: "",
        description: ""
    });

    useEffect(() => {

        async function loadTransactions() {

            try {

                const data = await getTransactions();

                const normalized = data.map(tx => ({
                    ...tx,
                    subcategory: tx.subcategory ?? tx.sub_category
                }));

                setTransactions(normalized);

            } catch (err) {

                console.error("Error fetching transactions:", err);

            }

        }

        loadTransactions();

    }, []);

    const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date).toLocaleDateString();
        return (
            (!filters.date ||
                txDate.toLowerCase().includes(filters.date.toLowerCase())) &&
            (!filters.type ||
                (tx.type || "").toLowerCase().includes(filters.type.toLowerCase())) &&
            (!filters.category ||
                (tx.category || "").toLowerCase().includes(filters.category.toLowerCase())) &&
            (!filters.mode ||
                (tx.mode || "").toLowerCase().includes(filters.mode.toLowerCase())) &&
            (!filters.remarks ||
                (tx.remarks || "").toLowerCase().includes(filters.remarks.toLowerCase())) &&
            (!filters.description ||
                (tx.description || "").toLowerCase().includes(filters.description.toLowerCase()))
        );
    });

    async function saveCategoryUpdate(activeTx) {

        try {

            await updateTransactionCategory(
                activeTx.id,
                activeTx.category,
                activeTx.subcategory
            );

            setTransactions(prev =>
                prev.map(tx =>
                    tx.id === activeTx.id
                        ? {
                            ...tx,
                            category: activeTx.category,
                            subcategory: activeTx.subcategory
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

            {/*<TransactionsTable*/}
            {/*    transactions={transactions}*/}
            {/*    setTransactions={setTransactions}*/}
            {/*    editMode={editMode}*/}
            {/*    setEditMode={setEditMode}*/}
            {/*    setActiveTx={setActiveTx}*/}
            {/*/>*/}

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