import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {

    const [dark, setDark] = useState(
        localStorage.getItem("theme") === "dark"
    )

    useEffect(() => {

        const root = document.documentElement

        if (dark) {
            root.classList.add("dark")
            localStorage.setItem("theme", "dark")
        } else {
            root.classList.remove("dark")
            localStorage.setItem("theme", "light")
        }

    }, [dark])

    return (
        <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700"
        >
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
    )
}