import { useEffect, useState } from "react";

export default function Settings() {

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const [newCategory, setNewCategory] = useState("");
    const [newSubcategory, setNewSubcategory] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    async function loadData() {

        const c = await fetch("http://localhost:5000/api/categories");
        const s = await fetch("http://localhost:5000/api/subcategories");

        setCategories(await c.json());
        setSubcategories(await s.json());

    }

    useEffect(() => {
        async function init() {
            await loadData();
        }

        init();
    }, []);

    async function addCategory() {

        if (!newCategory.trim()) return;

        await fetch("http://localhost:5000/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newCategory })
        });

        setNewCategory("");
        loadData();

    }

    async function addSubcategory() {

        if (!selectedCategory || !newSubcategory.trim()) return;

        await fetch("http://localhost:5000/api/subcategories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                category: selectedCategory,
                name: newSubcategory
            })
        });

        setNewSubcategory("");
        loadData();

    }

    return (

        <div className="space-y-8 w-full">

            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Settings
            </h1>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">

                <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                    Categories
                </h2>

                <div className="flex gap-2">

                    <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category"
                        className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-900"
                    />

                    <button
                        onClick={addCategory}
                        className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800
            dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        Add
                    </button>

                </div>

                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">

                    {categories.map((c) => (
                        <li key={c.id}>{c.name}</li>
                    ))}

                </ul>

            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">

                <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                    Subcategories
                </h2>

                <div className="flex gap-2">

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-900"
                    >

                        <option value="">Select category</option>

                        {categories.map((c) => (
                            <option key={c.id}>{c.name}</option>
                        ))}

                    </select>

                    <input
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                        placeholder="Subcategory"
                        className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-900"
                    />

                    <button
                        onClick={addSubcategory}
                        className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800
            dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        Add
                    </button>

                </div>

                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">

                    {subcategories.map((s) => (
                        <li key={s.id}>
                            {s.category} → {s.name}
                        </li>
                    ))}

                </ul>

            </div>

        </div>

    );
}
