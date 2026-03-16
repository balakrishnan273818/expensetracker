import { createContext, useContext } from "react";
import useTransactions from "../hooks/useTransactions";
import useBudgets from "../hooks/useBudgets";

const AppContext = createContext();

export function AppProvider({ children }) {
    const transactionsState = useTransactions();
    const budgetsState = useBudgets();

    return (
        <AppContext.Provider
            value={{
                ...transactionsState,
                ...budgetsState
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
