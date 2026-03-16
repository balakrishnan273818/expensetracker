export default function ChartCard({ title, children }) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 h-full">

            {title && (
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {title}
                </h2>
            )}

            <div className="w-full h-full">
                {children}
            </div>

        </div>
    );
}
