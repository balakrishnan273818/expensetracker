# rag/feature/feature_extractor.py

import re
from rag.feature.mode_detector import detect_mode


# ==============================
# MAIN FUNCTION
# ==============================

def extract_features(tx: dict, debug: bool = False) -> dict:
    """
    Extract deterministic features from transaction

    Input:
        tx = {
            "description": str,
            "amount": float,
            "date": str,
            "bank": str
        }

    Output:
        {
            "direction": "debit" | "credit",
            "mode": "upi" | "card" | "cash" | "bank",
            "is_internal": bool,
            "cleaned_description": str
        }
    """

    debug_data = {}

    desc_raw = tx.get("description", "") or ""
    amount = float(tx.get("amount", 0))

    # -------------------------------------
    # 1. NORMALIZE DESCRIPTION
    # -------------------------------------
    desc = desc_raw.upper().strip()

    # remove extra spaces
    desc = re.sub(r"\s+", " ", desc)

    # remove common noise prefixes
    desc = _remove_noise(desc)

    if debug:
        debug_data["normalized"] = desc

    # -------------------------------------
    # 2. DIRECTION
    # -------------------------------------
    direction = "credit" if amount > 0 else "debit"

    # -------------------------------------
    # 3. MODE DETECTION
    # -------------------------------------
    mode = detect_mode(desc)

    # -------------------------------------
    # 4. INTERNAL TRANSFER DETECTION
    # -------------------------------------
    is_internal = _detect_internal(desc)

    # -------------------------------------
    # 5. CLEANED DESCRIPTION (for embeddings)
    # -------------------------------------
    cleaned = _clean_for_embedding(desc)

    if debug:
        debug_data["cleaned_description"] = cleaned
        debug_data["mode"] = mode
        debug_data["direction"] = direction
        debug_data["is_internal"] = is_internal

    result = {
        "direction": direction,
        "mode": mode,
        "is_internal": is_internal,
        "cleaned_description": cleaned
    }

    if debug:
        return {
            "features": result,
            "debug": debug_data
        }

    return result


# ==============================
# HELPERS
# ==============================

def _remove_noise(desc: str) -> str:
    """
    Remove bank-specific noise patterns
    """

    # Remove UPI prefixes like UPI/DR/xxxx/
    desc = re.sub(r"UPI/[A-Z]{2}/\d+/", "", desc)

    # Remove transaction IDs
    desc = re.sub(r"\b\d{6,}\b", "", desc)

    # Remove bank-specific tokens
    noise_tokens = [
        "UPI", "IMPS", "NEFT", "RTGS",
        "DR", "CR", "P2A", "P2P",
        "TXN", "REF", "TRANSFER",
        "PAYMENT", "COLLECT"
    ]

    for token in noise_tokens:
        desc = desc.replace(token, " ")

    return re.sub(r"\s+", " ", desc).strip()


def _detect_internal(desc: str) -> bool:
    """
    Detect internal transfers (same person / own accounts)
    """

    internal_keywords = [
        "SELF",
        "OWN ACCOUNT",
        "TRANSFER TO",
        "TRANSFER FROM",
        "TO ACCOUNT",
        "FROM ACCOUNT"
    ]

    for kw in internal_keywords:
        if kw in desc:
            return True

    return False


def _clean_for_embedding(desc: str) -> str:
    """
    Clean description for semantic embedding
    """

    # remove special characters except spaces
    desc = re.sub(r"[^A-Z0-9\s]", " ", desc)

    # remove short tokens (noise)
    tokens = desc.split()

    filtered = [
        t for t in tokens
        if len(t) > 2 and not t.isdigit()
    ]

    return " ".join(filtered)