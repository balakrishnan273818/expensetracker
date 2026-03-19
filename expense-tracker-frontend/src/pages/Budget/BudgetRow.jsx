export default function BudgetRow({ category, data, onChange, editMode }) {

    const { amount, max } = data;

    const handleSliderChange = (e) => {
        onChange(category, "amount", Number(e.target.value));
    };

    const handleAmountChange = (e) => {
        let val = Number(e.target.value);
        if (val > max) val = max;
        onChange(category, "amount", val);
    };

    const handleMaxChange = (e) => {
        let newMax = Number(e.target.value);

        if (isNaN(newMax)) newMax = 0;

        // Only enforce logical constraint
        if (newMax < amount) {
            onChange(category, "amount", newMax);
        }

        onChange(category, "max", newMax);
    };

    return (
        <div className={`grid gap-4 items-center py-2 border-b 
        ${editMode ? "grid-cols-4" : "grid-cols-3"}`}>

            {/* Category */}
            <div className="font-medium">{category}</div>

            {/* Slider */}
            <input
                type="range"
                min="0"
                max={max || 10000}
                step="1000"
                value={amount || 0}
                onChange={handleSliderChange}
                className="w-full"
            />

            {/* Amount */}
            <input
                type="number"
                value={amount || 0}
                onChange={handleAmountChange}
                className="border rounded px-2 py-1 w-full dark:bg-gray-900"
            />

            {/* ✅ Max (ONLY in edit mode) */}
            {editMode && (
                <input
                    type="number"
                    value={max ?? ""}
                    onChange={handleMaxChange}
                    className="border rounded px-2 py-1 w-full dark:bg-gray-900 appearance-none"
                />
            )}

        </div>
    );
}