import { NavLink } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

import {
    LayoutDashboard,
    CalendarDays,
    Table,
    BarChart3,
    Wallet,
    Receipt,
    Settings,
} from "lucide-react";

export default function Navbar() {

    const base =
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all";

    const inactive =
        "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";

    const active =
        "bg-blue-600 text-white shadow-sm";

    function navClass({ isActive }) {
        return `${base} ${isActive ? active : inactive}`;
    }

    return (

        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen flex flex-col">

            {/* Header */}

            <div className="px-5 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">

                <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-100">

                    <Wallet size={20} className="text-blue-600" />

                    Expense Tracker

                </div>

                <ThemeToggle />

            </div>

            {/* Navigation */}

            <nav className="flex-1 px-3 py-4 space-y-1">

                <NavLink to="/calendar" className={navClass}>
                    <CalendarDays size={18} />
                    Calendar
                </NavLink>

                <NavLink to="/dashboard" className={navClass}>
                    <LayoutDashboard size={18} />
                    Dashboard
                </NavLink>

                <NavLink to="/daily-summary" className={navClass}>
                    <Table size={18} />
                    Daily Summary
                </NavLink>

                <NavLink to="/overall-summary" className={navClass}>
                    <BarChart3 size={18} />
                    Overall Summary
                </NavLink>

                <NavLink to="/budget" className={navClass}>
                    <Wallet size={18} />
                    Budget
                </NavLink>

                <NavLink to="/transactions" className={navClass}>
                    <Receipt size={18} />
                    Transactions
                </NavLink>

            </nav>

        </aside>
    );
}
