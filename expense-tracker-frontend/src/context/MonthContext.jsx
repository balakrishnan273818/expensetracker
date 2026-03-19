import { createContext, useContext, useState } from "react";

const MonthContext = createContext();

export function MonthProvider({ children }) {

    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth()); // 0–11

    return (
        <MonthContext.Provider
            value={{
                year,
                month,
                setYear,
                setMonth,
            }}
        >
            {children}
        </MonthContext.Provider>
    );
}

export function useMonth() {
    return useContext(MonthContext);
}