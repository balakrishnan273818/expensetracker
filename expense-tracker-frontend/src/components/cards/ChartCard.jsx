export default function ChartCard({ title, children }) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 flex flex-col">

            {title && (
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {title}
                </h2>
            )}

            {/* CRITICAL FIX */}
            <div className="w-full flex-1 min-h-[300px]">
                {children}
            </div>

        </div>
    );
}