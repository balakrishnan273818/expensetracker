import re

CATEGORY_RULES = {
    "SWIGGY": ("Food", "Delivery"),
    "ZOMATO": ("Food", "Delivery"),
    "LOAVES": ("Food", "Restaurant"),

    "DMART": ("Groceries", "Others"),
    "BIGBASKET": ("Groceries", "Others"),

    "UBER": ("Travel", "Taxi"),
    "OLA": ("Travel", "Taxi"),

    "LIC": ("Bills", "Others"),
    "ZERODHA": ("Investment", "Stocks"),

    "PETROL": ("Travel", "Others"),
    "FUEL": ("Travel", "Others")
}

# Sort rules by merchant length (longer matches first)
SORTED_RULES = sorted(CATEGORY_RULES.items(), key=lambda x: len(x[0]), reverse=True)


def categorize(description):

    desc = description.upper()

    for merchant, category_pair in SORTED_RULES:

        # match full word
        if re.search(rf"\b{merchant}\b", desc):
            return category_pair

    return ("Others", "Miscellaneous")
