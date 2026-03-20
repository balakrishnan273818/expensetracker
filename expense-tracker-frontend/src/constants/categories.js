import { normalizeCategory } from "../utils/categories";

export const categoryOptions = [
    "Food",
    "Shopping",
    "Travel",
    "Bills",
    "Investment",
    "Transfer",
    "Income",
    "Others",
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
        "Beverages",
        "Others"
    ],

    Allowances: [
        "Bhuvi",
        "Thatha",
        "Amma",
        "Divya",
        "Others"
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
        "Electronics",
        "Others"
    ],

    Travel: [
        "Taxi",
        "Auto",
        "Flights",
        "Train",
        "Bus",
        "Others"
    ],

    Bills: [
        "Electricity",
        "Internet",
        "Mobile",
        "Subscription",
        "Gas",
        "Rent",
        "Charges",
        "Credit Card",
        "Others"
    ],

    Investment: [
        "Mutual Funds",
        "Stocks",
        "PPF",
        "FD",
        "NPS",
        "Others"
    ],

    Transfer: [
        "Axis to HDFC",
        "Axis to IDFC",
        "IDFC to Axis",
        "HDFC to Axis",
        "IDFC to HDFC",
        "HDFC to IDFC",
        "Others"
    ],

    Income: [
        "Monthly Salary",
        "Bond Interest",
        "Bank Interest",
        "Reimbursement",
        "Redemption",
        "Dividend",
        "Others"
    ],
    Entertainment:[
      "Tourism",
      "Movie Tickets",
      "Others"
    ],

    Others: [
        "Cash",
        "Charity",
        "Others"
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