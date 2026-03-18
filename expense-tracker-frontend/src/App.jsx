import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Calendar from "./pages/Calendar/Calendar";
import DailySummary from "./pages/DailySummary/DailySummary";
import OverallSummary from "./pages/OverallSummary/OverallSummary";
import Budget from "./pages/Budget/Budget";
import Transactions_archive from "./pages/Transactions/Transactions.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route index element={<Navigate to="/calendar" replace />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="daily-summary" element={<DailySummary />} />
                    <Route path="overall-summary" element={<OverallSummary />} />
                    <Route path="budget" element={<Budget />} />
                    <Route path="transactions" element={<Transactions_archive />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
