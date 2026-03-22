import Navbar from "./Navbar.jsx";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function MainLayout() {
    const location = useLocation();

    return (
        <div className="flex w-full h-screen bg-gray-100 dark:bg-gray-950">

            <Navbar />

            <main className="flex-1 flex flex-col text-gray-900 dark:text-gray-100 overflow-hidden">

                {/* Scroll container */}
                <div className="flex-1 overflow-y-auto">

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="p-6 space-y-6"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>

                </div>

            </main>
        </div>
    );
}