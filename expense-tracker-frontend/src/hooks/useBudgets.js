import { useEffect, useState } from "react";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "../api/budgets";

export default function useBudgets() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadBudgets() {
        try {
            setLoading(true);
            const data = await getBudgets();
            setBudgets(data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setBudgets([]);
        } finally {
            setLoading(false);
        }
    }

    async function addBudget(budget) {
        await createBudget(budget);
        await loadBudgets();
    }

    async function editBudget(id, budget) {
        await updateBudget(id, budget);
        await loadBudgets();
    }

    async function removeBudget(id) {
        await deleteBudget(id);
        await loadBudgets();
    }

    useEffect(() => {
        loadBudgets();
    }, []);

    return {
        budgets,
        loading,
        error,
        addBudget,
        editBudget,
        removeBudget,
        reload: loadBudgets,
    };
}
