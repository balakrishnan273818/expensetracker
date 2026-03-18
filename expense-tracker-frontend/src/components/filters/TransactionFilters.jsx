import { useState, useEffect } from "react";

export default function TransactionFilters({
                                               categories = [],
                                               banks = [],
                                               onChange
                                           }) {
    const [filters, setFilters] = useState({
        category: "",
        bank: "",
        type: "",
        search: ""
    });

    function updateFilter(field, value) {
        const updated = { ...filters, [field]: value };
        setFilters(updated);
    }

    useEffect(() => {
        onChange?.(filters);
    }, [filters]);

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-wrap gap-3">

            <input
                placeholder="Search description..."
                className="px-3 py-2 border rounded-md
                           bg-white dark:bg-gray-900
                           border-gray-300 dark:border-gray-600
                           text-black dark:text-white
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
            />

            <select
                className="px-3 py-2 border rounded-md
                           bg-white dark:bg-gray-900
                           border-gray-300 dark:border-gray-600
                           text-black dark:text-white"
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
            >
                <option value="">All Categories</option>
                {categories.map((c) => (
                    <option key={c}>{c}</option>
                ))}
            </select>

            <select
                className="px-3 py-2 border rounded-md
                           bg-white dark:bg-gray-900
                           border-gray-300 dark:border-gray-600
                           text-black dark:text-white"
                value={filters.bank}
                onChange={(e) => updateFilter("bank", e.target.value)}
            >
                <option value="">All Banks</option>
                {banks.map((b) => (
                    <option key={b}>{b}</option>
                ))}
            </select>

            <select
                className="px-3 py-2 border rounded-md
                           bg-white dark:bg-gray-900
                           border-gray-300 dark:border-gray-600
                           text-black dark:text-white"
                value={filters.type}
                onChange={(e) => updateFilter("type", e.target.value)}
            >
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
            </select>

        </div>
    );
}