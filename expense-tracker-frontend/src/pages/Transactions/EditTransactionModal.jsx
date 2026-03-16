import { categoryOptions, subcategoryMap } from "../../constants/categories";

export default function EditTransactionModal({
                                                 activeTx,
                                                 setActiveTx,
                                                 onSave
                                             }) {

    return (

        <div className="fixed inset-0 flex items-center justify-center bg-black/40">

            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-96 space-y-4">

                <h2 className="text-lg font-semibold">
                    Edit Transaction
                </h2>

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

                <div className="flex justify-end gap-3 pt-2">

                    <button
                        onClick={() => setActiveTx(null)}
                        className="px-4 py-2 border rounded-md"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSave(activeTx)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>

    );
}