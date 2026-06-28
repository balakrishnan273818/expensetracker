import { useEffect, useState } from "react";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

export default function useBudget(month) {

    const [budgets, setBudgets] = useState({});
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [loading, setLoading] = useState(false);

    const toMonthDate = (monthStr) => `${monthStr}-01`;

    const getBudgets = async () => {
        if (!month) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/budgets?month=${month}`);
            const data = await res.json();

            // ✅ NEW RESPONSE SHAPE
            // {
            //   monthly_income: 80000,
            //   budgets: [...]
            // }

            const map = {};

            (data.budgets || []).forEach((item) => {
                map[item.category] = {
                    amount: Number(item.budget_amount || 0),
                };
            });

            setBudgets(map);
            setMonthlyIncome(Number(data.monthly_income || 0));

        } catch (err) {
            console.error("Failed to fetch budgets", err);
        } finally {
            setLoading(false);
        }
    };

    const saveBudgets = async (budgetMap) => {
        try {

            const payload = {
                month: toMonthDate(month),
                monthly_income: monthlyIncome,
                budgets: Object.entries(budgetMap).map(([category, val]) => ({
                    category,
                    budget_amount: val.amount,
                })),
            };

            await fetch(`${API_BASE}/budgets/bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

        } catch (err) {
            console.error("Failed to save budgets", err);
        }
    };

    useEffect(() => {
        getBudgets();
    }, [month]);

    return {
        budgets,
        setBudgets,
        monthlyIncome,
        setMonthlyIncome,
        saveBudgets,
        loading,
    };
}