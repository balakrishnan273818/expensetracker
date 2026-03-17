import { categoryOptions, subcategoryMap } from "../../constants/categories";

export default function EditTransactionModal({
                                                 activeTx,
                                                 setActiveTx,
                                                 onSave
                                             }) {

    return (

        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-96 space-y-4 shadow-lg">

                <h2 className="text-lg font-semibold">
                    Edit Transaction
                </h2>

                {/* Transaction Type */}

                <div>

                    <label className="text-sm">
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
                        className="w-full mt-1 border rounded px-3 py-2"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                        <option value="transfer">Transfer</option>
                    </select>

                </div>

                {/* Category */}

                <div>

                    <label className="text-sm">
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
                        className="w-full mt-1 border rounded px-3 py-2"
                    >

                        {categoryOptions.map(cat => (
                            <option key={cat}>{cat}</option>
                        ))}

                    </select>

                </div>

                {/* Subcategory */}

                <div>

                    <label className="text-sm">
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
                        className="w-full mt-1 border rounded px-3 py-2"
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
                        className="px-4 py-2 border rounded-md"
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