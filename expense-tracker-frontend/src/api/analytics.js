import { apiRequest } from "./client";

export async function getAnalyticsSummary() {
    return apiRequest("/api/analytics/summary");
}

export async function getCategoryBreakdown() {
    return apiRequest("/api/analytics/category-breakdown");
}

export async function getMonthlyFlow() {
    return apiRequest("/api/analytics/monthly-flow");
}
