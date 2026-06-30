import os
import logging
import requests
import re

logger = logging.getLogger(__name__)

# ── Cloud provider (used on Render when GROQ_API_KEY env var is set) ──────────
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

# ── Local fallback (used when GROQ_API_KEY is absent — local dev with Ollama) ─
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma3:4b"

VALID_CATEGORIES = {
    "Food", "Allowances", "Groceries", "Shopping", "Travel",
    "Bills", "Investment", "Transfer", "Income",
    "Entertainment", "Others"
}


def _build_prompt(description: str, merchant: str, rag_section: str) -> str:
    return f"""You are a financial transaction classification engine.

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
{rag_section}
Now classify:
Transaction Description:
{description}

Merchant:
{merchant}
"""


def _call_groq(prompt: str) -> str:
    """Call Groq chat completions API and return the raw text response."""
    response = requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0,
            "max_tokens": 50
        },
        timeout=30
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()


def _call_ollama(prompt: str) -> str:
    """Call local Ollama generate API and return the raw text response."""
    response = requests.post(
        OLLAMA_URL,
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        timeout=30
    )
    response.raise_for_status()
    return response.json().get("response", "").strip()


def _parse_response(result: str):
    """Parse 'Category: X, Subcategory: Y' from model output."""
    match = re.search(
        r"Category:\s*([^,]+),\s*Subcategory:\s*([^\n\r]+)",
        result,
        re.IGNORECASE
    )

    if not match:
        logger.debug("AI parse error: could not extract from response: %s", result[:100])
        return "Others", "Others"

    main_category = match.group(1).strip().title()
    sub_category = match.group(2).strip()

    if main_category not in VALID_CATEGORIES:
        logger.debug("AI validation fail: invalid category=%s", main_category)
        return "Others", "Others"

    if not sub_category:
        return main_category, "Others"

    return main_category, sub_category


def ai_categorize(description: str, merchant: str, rag_context: str = ""):
    """
    Classify a transaction using an LLM.

    Routing:
      - GROQ_API_KEY set  →  Groq (llama-3.1-8b-instant)  (Render / cloud)
      - GROQ_API_KEY absent →  local Ollama (gemma3:4b)    (development)

    rag_context: optional few-shot block from similar past transactions.
    Falls back to ("Others", "Others") on any API failure.
    """
    rag_section = (rag_context + "\n---\n") if rag_context else ""
    prompt = _build_prompt(description, merchant, rag_section)

    provider = "groq" if GROQ_API_KEY else "ollama"
    logger.debug(
        "AI categorize via %s | description=%s | merchant=%s | has_rag=%s",
        provider, description[:60], merchant, bool(rag_context)
    )

    try:
        result = _call_groq(prompt) if GROQ_API_KEY else _call_ollama(prompt)
        logger.debug("AI raw response: %s", result[:120])
    except Exception as e:
        logger.warning("AI categorizer (%s) failed: %s", provider, e)
        return "Others", "Others"

    return _parse_response(result)
