import re
from merchant_extractor import extract_merchant
from categorizer import categorize
from ai_categorizer import ai_categorize
from repositories.merchant_rule_repo import learn_rule
#from repositories.merchant_rule_repo import load_family_alias

# services/categorization_service.py

def normalize_description(desc: str) -> str:
    desc = desc.upper()

    titles = ["MR ", "MRS ", "SMT ", "DR "]

    for t in titles:
        desc = desc.replace(t, "")

    return desc

def detect_family(description: str, family_alias: dict):

    desc = normalize_description(description)

    for name in family_alias:
        if name in desc:
            category, sub_category = family_alias[name]

            return {
                "merchant": name,
                "category": category,
                "sub_category": sub_category
            }

    return None

def derive_payment_method(description):

    desc = description.upper()

    if "UPI" in desc or "IMPS" in desc:
        return "UPI"

    if "POS" in desc or "CARD" in desc:
        return "Card"

    if "ATM" in desc or "CASH" in desc:
        return "Cash"

    if "NEFT" in desc or "RTGS" in desc:
        return "Bank"

    return "Bank"

def categorize_transaction(description, txn_time, ctx):

    rules = ctx.rules
    patterns = ctx.patterns
    aliases = ctx.aliases
    family_alias = ctx.family_alias

    # --------------------------------
    # 1 FAMILY DETECTION (before merchant extraction)
    # --------------------------------

    family = detect_family(description, family_alias)

    if family:
        return family["merchant"], family["category"], family["sub_category"]

    # --------------------------------
    # 2 MERCHANT EXTRACTION
    # --------------------------------

    merchant_info = extract_merchant(description, patterns, aliases)

    merchant = merchant_info["merchant"]
    source = merchant_info.get("source")

    # --------------------------------
    # 3 INTERNAL TRANSFER
    # --------------------------------

    if source == "internal":
        return merchant, "Transfer", "Internal"

    # --------------------------------
    # 4 PATTERN MATCH
    # --------------------------------

    if source == "pattern":
        return merchant, merchant_info["category"], merchant_info["sub_category"]

    # merchant extraction failed
    if not merchant:
        return "UNKNOWN", "Other", "Miscellaneous"

    merchant = merchant.upper()

    # --------------------------------
    # 5 RULE LOOKUP
    # --------------------------------

    category, sub_category = rules.get(merchant, (None, None))

    if category:
        return merchant, category, sub_category

    # --------------------------------
    # 6 STATIC CATEGORIZER
    # --------------------------------

    category, sub_category = categorize(merchant)

    if category != "Other":
        return merchant, category, sub_category

    # --------------------------------
    # 7 AI FALLBACK
    # --------------------------------

    category, sub_category = ai_categorize(description, merchant)

    PERSON_PATTERN = re.compile(r"^[A-Z]+\s[A-Z]+$")

    # --------------------------------
    # 8 AUTO LEARN RULE
    # --------------------------------

    if merchant and len(merchant) > 3:
        if not PERSON_PATTERN.match(merchant):
            learn_rule(merchant, category, sub_category)
            rules[merchant] = (category, sub_category)

    #category, sub_category = normalize_food_subcategory(category, sub_category, txn_time)

    return merchant, category, sub_category




def normalize_food_subcategory(category, sub_category, txn_time):

    if category != "Food":
        return category, sub_category

    if txn_time is None:
        return "Food", "Other"

    hour = txn_time.hour if hasattr(txn_time, "hour") else None

    if hour is None:
        return "Food", "Other"

    if 5 <= hour < 11:
        return "Food", "Breakfast"

    if 11 <= hour < 15:
        return "Food", "Lunch"

    if 15 <= hour < 18:
        return "Food", "Snacks"

    if 18 <= hour <= 23:
        return "Food", "Dinner"

    return "Food", "Other"


