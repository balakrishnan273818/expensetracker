import { apiRequest } from "./client";

export async function getBudgets() {
    return apiRequest("/api/budgets");
}

export async function createBudget(budget) {
    return apiRequest("/api/budgets", {
        method: "POST",
        body: JSON.stringify(budget),
    });
}

export async function updateBudget(id, budget) {
    return apiRequest(`/api/budgets/${id}`, {
        method: "PUT",
        body: JSON.stringify(budget),
    });
}

export async function deleteBudget(id) {
    return apiRequest(`/api/budgets/${id}`, {
        method: "DELETE",
    });
}
