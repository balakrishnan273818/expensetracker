import { Pencil } from "lucide-react";
import TransactionRow from "./TransactionRow";

export default function TransactionsTable({
                                              transactions,
                                              setTransactions,
                                              editMode,
                                              setEditMode,
                                              setActiveTx,
                                              filters,
                                              setFilters
                                          }) {

    return (
        <>
            <div className="flex justify-between items-center">

                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Transactions
                </h1>

                <button
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 dark:bg-gray-700"
                >
                    <Pencil size={16}/>
                    {editMode ? "Finish Editing" : "Edit"}
                </button>

            </div>

            <div className="overflow-y-auto max-h-[650px] border rounded-xl border-gray-200 dark:border-gray-700">

                <table className="w-full text-sm">

                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">

                    <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Transaction</th>
                        <th className="px-4 py-3 text-left">Payment Mode</th>
                        <th className="px-4 py-3 text-left">Bank</th>
                        <th className="px-4 py-3 text-left">Remarks</th>
                        <th className="px-4 py-3 text-left">Description</th>
                    </tr>

                    <tr className="bg-gray-100 dark:bg-gray-900 text-xs">

                        <th className="px-2 py-2">
                            <input
                                value={filters.date}
                                onChange={(e)=>setFilters({...filters,date:e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                            />
                        </th>

                        <th className="px-2 py-2 flex gap-1">
                            <input
                                placeholder="min"
                                value={filters.minAmount}
                                onChange={(e)=>setFilters({...filters,minAmount:e.target.value})}
                                className="w-16 px-1 py-1 border rounded text-xs"
                            />

                            <input
                                placeholder="max"
                                value={filters.maxAmount}
                                onChange={(e)=>setFilters({...filters,maxAmount:e.target.value})}
                                className="w-16 px-1 py-1 border rounded text-xs"
                            />
                        </th>

                        <th>
                            <input
                                value={filters.type}
                                onChange={(e)=>setFilters({...filters,type:e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                            />
                        </th>

                        <th>
                            <input
                                value={filters.category}
                                onChange={(e)=>setFilters({...filters,category:e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                            />
                        </th>

                        <th>
                            <input
                                value={filters.mode}
                                onChange={(e)=>setFilters({...filters,mode:e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                            />
                        </th>

                        <th>
                            <input
                                value={filters.bank}
                                onChange={(e)=>setFilters({...filters,bank:e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                            />
                        </th>

                        <th>
                            <input
                                value={filters.remarks}
                                onChange={(e)=>setFilters({...filters,remarks:e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                            />
                        </th>

                        <th>
                            <input
                                value={filters.description}
                                onChange={(e)=>setFilters({...filters,description:e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                            />
                        </th>

                    </tr>

                    </thead>

                    <tbody>

                    {transactions.map((tx) => (

                        <TransactionRow
                            key={tx.id}
                            tx={tx}
                            editMode={editMode}
                            setTransactions={setTransactions}
                            setActiveTx={setActiveTx}
                        />

                    ))}

                    </tbody>

                </table>

            </div>
        </>
    );
}