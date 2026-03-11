import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Calendar from "./pages/Calendar/Calendar";
import DailySummary from "./pages/DailySummary/DailySummary";
import OverallSummary from "./pages/OverallSummary/OverallSummary";
import Budget from "./pages/Budget/Budget";
import Transactions from "./pages/Transactions/Transactions";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<MainLayout />}>

                    <Route path="/" element={<Navigate to="/calendar" />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/daily-summary" element={<DailySummary />} />
                    <Route path="/overall-summary" element={<OverallSummary />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/transactions" element={<Transactions />} />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;