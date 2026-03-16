import { useState } from "react";
import { Upload } from "lucide-react";

export default function FileDropZone({ onFile }) {
    const [dragging, setDragging] = useState(false);

    function handleDrop(e) {
        e.preventDefault();
        setDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) onFile?.(file);
    }

    function handleSelect(e) {
        const file = e.target.files?.[0];
        if (file) onFile?.(file);
    }

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition
      ${
                dragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-700"
            }
      bg-white dark:bg-gray-800`}
        >

            <Upload className="mb-3 text-gray-500 dark:text-gray-400" size={28} />

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Drag & drop your bank statement here
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                or click to upload
            </p>

            <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleSelect}
                className="hidden"
                id="file-upload"
            />

            <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
                Select File
            </label>

        </div>
    );
}
