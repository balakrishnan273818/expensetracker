import { categoryOptions, subcategoryMap } from "../../constants/categories";

export default function EditTransactionModal({
                                                 activeTx,
                                                 setActiveTx,
                                                 onSave
                                             }) {

    const inputClass =
        "w-full mt-1 border rounded px-3 py-2 " +
        "bg-white text-gray-900 " +
        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500";

    const labelClass =
        "text-sm text-gray-700 dark:text-gray-300";

    return (

        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">

            <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl p-6 w-96 space-y-4 shadow-lg">

                <h2 className="text-lg font-semibold">
                    Edit Transaction
                </h2>

                {/* Transaction Type */}
                <div>

                    <label className={labelClass}>
                        Transaction Type
                    </label>

                    <select
                        value={activeTx.type || "expense"}
                        onChange={(e) => {

                            const value = e.target.value;

                            setActiveTx(prev => ({
                                ...prev,
                                type: value
                            }));

                        }}
                        className={inputClass}
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                        <option value="transfer">Transfer</option>
                    </select>

                </div>

                {/* Category */}
                <div>

                    <label className={labelClass}>
                        Category
                    </label>

                    <select
                        value={activeTx.category}
                        onChange={(e) => {

                            const newCategory = e.target.value;
                            const firstSub = (subcategoryMap[newCategory] || [])[0] || "";

                            setActiveTx(prev => ({
                                ...prev,
                                category: newCategory,
                                subcategory: firstSub
                            }));

                        }}
                        className={inputClass}
                    >
                        {categoryOptions.map(cat => (
                            <option key={cat}>{cat}</option>
                        ))}
                    </select>

                </div>

                {/* Subcategory */}
                <div>

                    <label className={labelClass}>
                        Subcategory
                    </label>

                    <select
                        value={activeTx.subcategory}
                        onChange={(e) => {

                            const value = e.target.value;

                            setActiveTx(prev => ({
                                ...prev,
                                subcategory: value
                            }));

                        }}
                        className={inputClass}
                    >
                        {(subcategoryMap[activeTx.category] || []).map(sub => (
                            <option key={sub}>{sub}</option>
                        ))}
                    </select>

                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">

                    <button
                        onClick={() => setActiveTx(null)}
                        className="px-4 py-2 border rounded-md
                                   bg-white text-gray-800
                                   dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600
                                   hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSave(activeTx)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>

    );
}