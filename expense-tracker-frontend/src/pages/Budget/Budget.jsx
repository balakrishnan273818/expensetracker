import useBudgets from "../../hooks/useBudgets";
import useTransactions from "../../hooks/useTransactions";
import BudgetProgressCard from "../../components/budget/BudgetProgressCard";

export default function Budget() {

    const { budgets } = useBudgets();
    const { transactions } = useTransactions();

    function calculateSpent(category) {

        return transactions
            .filter(
                (tx) =>
                    tx.type === "expense" &&
                    tx.category === category
            )
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    }

    return (

        <div className="space-y-6 w-full">

            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Budget
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {budgets.map((budget) => {

                    const spent = calculateSpent(budget.category);

                    return (
                        <BudgetProgressCard
                            key={budget.id}
                            category={budget.category}
                            spent={spent}
                            limit={budget.limit}
                        />
                    );

                })}

            </div>

        </div>

    );
}
