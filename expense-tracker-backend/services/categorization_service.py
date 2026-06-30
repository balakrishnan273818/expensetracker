import re
import logging

from merchant_extractor import extract_merchant
from categorizer import categorize
from ai_categorizer import ai_categorize
from rag_engine import get_embedding, build_rag_context
from repositories.merchant_rule_repo import learn_rule
from repositories.transaction_repo import find_similar_transactions

logger = logging.getLogger(__name__)


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
                "type": "expense",
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

    # ------------------------------------------------
    # 1 FAMILY DETECTION
    # ------------------------------------------------

    family = detect_family(description, family_alias)

    if family:
        return (
            family["merchant"],
            family["type"],
            family["category"],
            family["sub_category"]
        )

    # ------------------------------------------------
    # 2 MERCHANT EXTRACTION
    # ------------------------------------------------

    merchant_info = extract_merchant(description, patterns, aliases)

    merchant = merchant_info["merchant"]
    source = merchant_info.get("source")

    # ------------------------------------------------
    # 3 INTERNAL TRANSFER
    # ------------------------------------------------

    if source == "internal":
        return merchant, "transfer", "Transfer", "Internal"

    # ------------------------------------------------
    # 4 PATTERN MATCH
    # ------------------------------------------------

    if source == "pattern":
        return (
            merchant,
            "expense",
            merchant_info["category"],
            merchant_info["sub_category"]
        )

    if not merchant:
        return "UNKNOWN", "expense", "Others", "Miscellaneous"

    merchant = merchant.upper()

    # ------------------------------------------------
    # 5 RULE LOOKUP
    # ------------------------------------------------

    rule = rules.get(merchant)

    if rule:

        return (
            merchant,
            rule["type"],
            rule["category"],
            rule["sub_category"]
        )

    # ------------------------------------------------
    # 6 STATIC CATEGORIZER
    # ------------------------------------------------

    category, sub_category = categorize(merchant)

    if category != "Others":

        tx_type = "expense"

        return merchant, tx_type, category, sub_category

    # ------------------------------------------------
    # 7 RAG RETRIEVAL — find similar past transactions
    # ------------------------------------------------

    rag_context = ""

    embedding = get_embedding(description)

    if embedding:
        similar = find_similar_transactions(embedding)

        if similar:
            logger.debug(
                "RAG found %d similar transactions for merchant=%s",
                len(similar), merchant
            )
            rag_context = build_rag_context(similar)
        else:
            logger.debug("RAG: no similar transactions found for merchant=%s", merchant)
    else:
        logger.debug("RAG: embedding unavailable for merchant=%s, skipping retrieval", merchant)

    # ------------------------------------------------
    # 8 AI FALLBACK (with RAG context when available)
    # ------------------------------------------------

    category, sub_category = ai_categorize(description, merchant, rag_context=rag_context)

    tx_type = "expense"

    PERSON_PATTERN = re.compile(r"^[A-Z]+\s[A-Z]+$")

    # ------------------------------------------------
    # 9 AUTO LEARN RULE
    # ------------------------------------------------

    if merchant and len(merchant) > 3:

        if not PERSON_PATTERN.match(merchant):

            learn_rule(
                merchant,
                tx_type,
                category,
                sub_category
            )

            rules[merchant] = {
                "type": tx_type,
                "category": category,
                "sub_category": sub_category
            }

    return merchant, tx_type, category, sub_category