import {useState} from "react";
import {DayPicker} from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DatePicker({
                                       value,
                                       onChange,
                                       placeholder = "Select date"
                                   }) {

    const [open, setOpen] = useState(false);

    return (
        <div className="relative">

            {/* Trigger */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="px-3 py-2 text-sm rounded-md
                    border border-gray-300 dark:border-gray-600
                    bg-gray-50 dark:bg-gray-800
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition"
            >
                {value || placeholder}
            </button>

            {/* Calendar */}
            {open && (
                <div className="absolute z-50 mt-2 p-2 rounded-lg shadow-lg
                    bg-white dark:bg-gray-900 border dark:border-gray-700">

                    <DayPicker
                        mode="single"
                        selected={value ? new Date(value) : undefined}
                        onSelect={(date) => {
                            if (!date) return;

                            const formatted = date.toISOString().slice(0, 10);
                            onChange(formatted);
                            setOpen(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
}