export default function ChartCard({ title, children }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 w-full">

            <h2 className="text-lg font-semibold mb-4">
                {title}
            </h2>

            <div className="w-full">
                {children}
            </div>

        </div>
    )
}