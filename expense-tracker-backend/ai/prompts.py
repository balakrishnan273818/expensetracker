# ai/prompts.py

def categorization_prompt(tx, context):

    return f"""
You are a financial transaction classifier.

Transaction:
{tx}

Similar past transactions:
{context}

Rules:
- Prefer learned patterns over guessing
- Investments are EXPENSE
- Be consistent

Output:
category, subcategory
"""