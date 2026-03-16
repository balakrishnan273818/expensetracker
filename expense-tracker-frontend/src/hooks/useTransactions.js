import { useEffect, useState } from "react";
import { getTransactions, updateTransactionsBulk } from "../api/transactions";

export default function useTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadTransactions() {
        try {
            setLoading(true);
            const data = await getTransactions();
            setTransactions(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }

    async function saveTransactions(updatedTransactions) {
        await updateTransactionsBulk(updatedTransactions);
        await loadTransactions();
    }

    useEffect(() => {
        loadTransactions();
    }, []);

    return {
        transactions,
        setTransactions,
        saveTransactions,
        loading,
        error,
    };
}
