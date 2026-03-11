import { Link, NavLink } from "react-router-dom"
import ThemeToggle from "../components/ThemeToggle"
import {
    Wallet,
    Calendar,
    LayoutDashboard,
    CalendarCheck,
    BarChart3,
    PiggyBank,
    Receipt
} from "lucide-react"

export default function Navbar() {
    const navItemClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg transition
        ${isActive
            ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600"
            : "text-gray-700 hover:bg-gray-100"}`

    return (
        <div className="w-64 h-screen bg-white shadow-md flex flex-col">

            {/* Logo */}
            <Link
                to="/calendar"
                className="flex items-center gap-2 text-xl font-bold px-6 py-5 border-b"
            >
                <Wallet size={24} />
                Expense Tracker
            </Link>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 p-4">

                <NavLink to="/calendar" className={navItemClass}>
                    <Calendar size={18} />
                    Calendar
                </NavLink>

                <NavLink to="/dashboard" className={navItemClass}>
                    <LayoutDashboard size={18} />
                    Dashboard
                </NavLink>

                <NavLink to="/daily-summary" className={navItemClass}>
                    <CalendarCheck size={18} />
                    Daily Summary
                </NavLink>

                <NavLink to="/overall-summary" className={navItemClass}>
                    <BarChart3 size={18} />
                    Overall Summary
                </NavLink>

                <NavLink to="/budget" className={navItemClass}>
                    <PiggyBank size={18} />
                    Budget
                </NavLink>

                <NavLink to="/transactions" className={navItemClass}>
                    <Receipt size={18} />
                    Transactions
                </NavLink>

            </nav>

            <div className="mt-auto p-4">
                <ThemeToggle />
            </div>

        </div>
    )
}