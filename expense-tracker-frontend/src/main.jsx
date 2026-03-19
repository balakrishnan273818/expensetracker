import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ThemeProvider } from "./hooks/useTheme.jsx";
import { MonthProvider } from "./context/MonthContext";
import { ToastProvider } from "./context/ToastContext"; // ✅ add this

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ThemeProvider>
            <ToastProvider>   {/* ✅ wrap here */}
                <MonthProvider>
                    <App />
                </MonthProvider>
            </ToastProvider>
        </ThemeProvider>
    </StrictMode>
);