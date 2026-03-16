import requests
import re


OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:4b"


def ai_categorize(description, merchant):

    prompt = f"""
You are a financial transaction classifier.

Your job is to categorize bank transactions.

Transaction Description:
{description}

Return ONLY in this format:

Main Category: <Main Category>
Sub Category: <Sub Category>

Allowed Main Categories and Sub Categories:

Food
- Breakfast
- Lunch
- Dinner
- Snacks
- Beverages
- others

Living
- Groceries
- Medical
- others

Bills
- Electricity
- Water
- Internet
- Phone
- Gas
- Maintenance
- Rent
- Subscriptions
- others

Travel
- Cab
- Auto
- Metro
- Bus
- Fuel
- others

Family
- Childcare
- Education
- Healthcare
- Allowances
- others

Investment
- MutualFunds
- Stocks
- others

Financial
- Insurance
- others

Lifestyle
- Shopping
- Entertainment
- others

Others
- Miscellaneous

Only return the two lines exactly.
"""

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

        result = response.json().get("response", "")

    except Exception:
        return "Other", "Miscellaneous"

    # safer parsing
    main_match = re.search(r"Main Category:\s*([^\n\r]+)", result)
    sub_match = re.search(r"Sub Category:\s*([^\n\r]+)", result)

    main_category = main_match.group(1).strip() if main_match else "Other"
    sub_category = sub_match.group(1).strip() if sub_match else "Miscellaneous"

    return main_category, sub_category
