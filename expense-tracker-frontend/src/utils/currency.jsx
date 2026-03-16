export function formatCurrency(amount) {
    if (amount === null || amount === undefined) return "₹0";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount));
}
