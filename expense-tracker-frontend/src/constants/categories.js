import { normalizeCategory } from "../utils/categories";

export const categoryOptions = [
    "Food",
    "Shopping",
    "Travel",
    "Bills",
    "Investment",
    "Transfer",
    "Income",
    "Other",
    "Groceries",
    "Allowances",
    "Entertainment"
];

const rawSubcategoryMap = {
    Food: [
        "Breakfast",
        "Lunch",
        "Dinner",
        "Snacks",
        "Beverages"
    ],

    Allowances: [
        "Bhuvi",
        "Thatha",
        "Amma",
        "Divya",
        "others"
    ],

    Groceries: [
        "Fruits",
        "Vegetables",
        "Meat",
        "Milk",
        "Home essentials",
        "Bathroom essentials",
        "Cooking essentials",
        "Others"
    ],

    Shopping: [
        "Amazon",
        "Clothing",
        "Utilities",
        "Electronics"
    ],

    Travel: [
        "Taxi",
        "Auto",
        "Flights",
        "Train",
        "Bus"
    ],

    Bills: [
        "Electricity",
        "Internet",
        "Mobile",
        "Subscription",
        "Gas",
        "Rent",
        "Charges",
        "Credit Card"
    ],

    Investment: [
        "Mutual Funds",
        "Stocks",
        "PPF",
        "FD",
        "NPS"
    ],

    Transfer: [
        "Axis to HDFC",
        "Axis to IDFC",
        "IDFC to Axis",
        "HDFC to Axis",
        "IDFC to HDFC",
        "HDFC to IDFC"
    ],

    Income: [
        "Monthly Salary",
        "Bond Interest",
        "Bank Interest",
        "Reimbursement",
        "Redemption",
        "Dividend"
    ],
    Entertainment:[
      "Tourism",
      "Movie Tickets",
      "Others"
    ],

    Others: [
        "Misc",
        "Cash"
    ]
};

/**
 * Always use this instead of direct map access
 */
export function getSubcategories(category) {
    const key = normalizeCategory(category);
    return rawSubcategoryMap[key] || [];
}

export const subcategoryMap = rawSubcategoryMap;