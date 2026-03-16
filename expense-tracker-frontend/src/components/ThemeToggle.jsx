import { Sun, Moon } from "lucide-react";
import useTheme from "../hooks/useTheme.jsx";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    function toggleTheme() {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100
                 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700
                 transition-colors"
        >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
