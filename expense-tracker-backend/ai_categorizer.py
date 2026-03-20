import requests
import re

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:4b"

DEBUG = True  # 🔥 toggle this ON/OFF


VALID_CATEGORIES = {
    "Food", "Allowances", "Groceries", "Shopping", "Travel",
    "Bills", "Investment", "Transfer", "Income",
    "Entertainment", "Others"
}


def ai_categorize(description, merchant):

    prompt = f"""
You are a financial transaction classification engine.

Your task is to classify each transaction into EXACTLY ONE:
- Category
- Subcategory

You MUST choose only from the allowed pairs below.

### Allowed Category–Subcategory Pairs:
Food: Breakfast
Food: Lunch
Food: Dinner
Food: Snacks
Food: Beverages
Food: Others

Allowances: Bhuvi
Allowances: Thatha
Allowances: Amma
Allowances: Divya
Allowances: Others

Groceries: Fruits
Groceries: Vegetables
Groceries: Meat
Groceries: Milk
Groceries: Home essentials
Groceries: Bathroom essentials
Groceries: Cooking essentials
Groceries: Others

Shopping: Amazon
Shopping: Clothing
Shopping: Utilities
Shopping: Electronics
Shopping: Others

Travel: Taxi
Travel: Auto
Travel: Flights
Travel: Train
Travel: Bus
Travel: Others

Bills: Electricity
Bills: Internet
Bills: Mobile
Bills: Subscription
Bills: Gas
Bills: Rent
Bills: Charges
Bills: Credit Card
Bills: Others

Investment: Mutual Funds
Investment: Stocks
Investment: PPF
Investment: FD
Investment: NPS
Investment: Others

Transfer: Axis to HDFC
Transfer: Axis to IDFC
Transfer: IDFC to Axis
Transfer: HDFC to Axis
Transfer: IDFC to HDFC
Transfer: HDFC to IDFC
Transfer: Others

Income: Monthly Salary
Income: Bond Interest
Income: Bank Interest
Income: Reimbursement
Income: Redemption
Income: Dividend
Income: Others

Entertainment: Tourism
Entertainment: Movie Tickets
Entertainment: Others

Others: Cash
Others: Charity
Others: Others

### Rules:
1. Always return exactly one Category and one Subcategory
2. If unsure, choose "Others" within the most relevant category
3. Do NOT create new categories or subcategories
4. Prefer specific subcategory over "Others" when possible
5. Use merchant name, keywords, and context to decide

### Output Format (STRICT):
Category: <category>, Subcategory: <subcategory>

---

### Examples:

Transaction: "Swiggy order #45821"
Output: Category: Food, Subcategory: Dinner

Transaction: "Amazon India purchase electronics"
Output: Category: Shopping, Subcategory: Amazon

Transaction: "Uber trip to office"
Output: Category: Travel, Subcategory: Taxi

Transaction: "Electricity bill BESCOM"
Output: Category: Bills, Subcategory: Electricity

Transaction: "HDFC mutual fund SIP"
Output: Category: Investment, Subcategory: Mutual Funds

Transaction: "Salary credited INFOSYS"
Output: Category: Income, Subcategory: Monthly Salary

Transaction: "Transfer from Axis to HDFC"
Output: Category: Transfer, Subcategory: Axis to HDFC

Transaction: "Unknown merchant XYZ123"
Output: Category: Others, Subcategory: Others

Transaction: "CreditCard Payment XX 0714 Ref#6SIASDRTU80XFB"
Output: Category: Bills, Subcategory: Credit Card

Transaction: "NEFT/CITIN26609120943/SAMSUNG ELECTRO MECH SFTWR I/CITI BANK/Salary January 2026"
Output: Category: Income, Subcategory: Monthly Salary

Transaction: "UPI/DR/132278737088/PAAVAI F/SCBL/9176355/Payment"
Output: Category: Others, Subcategory: Charity

Transaction: "MONTHLY SAVINGS INTEREST CREDIT"
Output: Category: Income, Subcategory: Bank Interest
---
Now classify:
Transaction Description:
{description}

Merchant:
{merchant}
"""

    if DEBUG:
        print("\n================ AI CATEGORIZATION DEBUG ================")
        print(f"[INPUT] Description: {description}")
        print(f"[INPUT] Merchant   : {merchant}")

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False
            },
            timeout=30
        )

        result = response.json().get("response", "").strip()

        if DEBUG:
            print(f"[RAW RESPONSE]\n{result}")

    except Exception as e:
        if DEBUG:
            print(f"[ERROR] API call failed: {e}")
        return "Others", "Others"

    # Parsing
    match = re.search(
        r"Category:\s*([^,]+),\s*Subcategory:\s*([^\n\r]+)",
        result,
        re.IGNORECASE
    )

    if not match:
        if DEBUG:
            print("[PARSE ERROR] Could not extract category/subcategory")
        return "Others", "Others"

    main_category = match.group(1).strip().title()
    sub_category = match.group(2).strip()

    if DEBUG:
        print(f"[PARSED] Category: {main_category}")
        print(f"[PARSED] Subcategory: {sub_category}")

    # Validation
    if main_category not in VALID_CATEGORIES:
        if DEBUG:
            print(f"[VALIDATION FAIL] Invalid category: {main_category}")
        return "Others", "Others"

    if not sub_category:
        if DEBUG:
            print("[VALIDATION FAIL] Empty subcategory → defaulting to Others")
        return main_category, "Others"

    if DEBUG:
        print(f"[FINAL] Category: {main_category}, Subcategory: {sub_category}")
        print("=========================================================\n")

    return main_category, sub_category