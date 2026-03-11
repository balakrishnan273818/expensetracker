CATEGORY_RULES = {
    "Food": ["SWIGGY", "ZOMATO", "LOAVES", "RESTAURANT"],
    "Groceries": ["DMART", "BIGBASKET"],
    "Cab": ["UBER", "OLA"],
    "Insurance": ["LIC"],
    "Investment": ["ZERODHA"],
    "Fuel": ["PETROL", "FUEL"],
    "Transfer": ["BALAKRISHNAN", "IDFC"]
}

def categorize(description):

    desc = description.upper()

    for category, keywords in CATEGORY_RULES.items():
        for k in keywords:
            if k in desc:
                return category

    return "Miscellaneous"