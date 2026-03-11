import requests
import re


def ai_categorize(description, txn_time):
    print(description)
    prompt = f"""
You are a financial transaction classifier.

Your job is to categorize bank transactions.

Transaction Description:
{description}

Transaction Time:
{txn_time}

Return ONLY in this format:

Category: <Main Category>
SubCategory: <Sub Category>


Allowed Categories and Sub Categories:

Food
- Breakfast
- Lunch
- Dinner
- Snacks
- Beverages

Living
- Groceries
- Medical

Bills
- Electricity
- Water
- Internet
- Phone
- Gas
- Maintenance
- Rent
- other

Travel
- Cab
- Auto
- Metro
- Bus
- Fuel
- other

Family
- Childcare
- Education
- Healthcare
- Allowances

Financial
- Insurance
- Investment

Lifestyle
- Shopping
- Entertainment
- Subscriptions

Other
- Miscellaneous


IMPORTANT RULES:

If the transaction is FOOD related (restaurants, cafes, bakery, food delivery, etc),
choose subcategory based on transaction time:

Breakfast → 05:00 - 11:30  
Lunch → 11:30 - 15:30  
Snacks → 15:30 - 18:30  
Dinner → 18:30 - 23:30  
Beverages → coffee / tea / juice / bar / alcohol


Examples:

Restaurant at 09:00 → Food / Breakfast  
Swiggy at 13:30 → Food / Lunch  
Cafe Coffee Day at 16:00 → Food / Snacks  
Restaurant at 21:00 → Food / Dinner  
Starbucks coffee → Food / Beverages

If not food related, ignore time and classify normally.

Only return the two lines exactly.
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "gemma3:4b",
            "prompt": prompt,
            "stream": False
        }
    )

    result = response.json()["response"]

    category_match = re.search(r'Category:\s*(.*)', result)
    sub_match = re.search(r'SubCategory:\s*(.*)', result)

    category = category_match.group(1).strip() if category_match else "Other"
    sub_category = sub_match.group(1).strip() if sub_match else "Miscellaneous"
    print(category, sub_category)
    return category, sub_category