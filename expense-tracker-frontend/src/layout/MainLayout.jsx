import Navbar from "./Navbar.jsx"
import { Outlet } from "react-router-dom"

export default function MainLayout() {
    return (
        <div className="flex w-full">

            <Navbar />

            <main className="flex-1 p-6 bg-gray-100 min-h-screen w-full">
                <Outlet />
            </main>

        </div>
    )
}