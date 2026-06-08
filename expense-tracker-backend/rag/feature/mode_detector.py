# rag/feature/mode_detector.py

def detect_mode(desc: str) -> str:

    desc = desc.upper()

    if "UPI" in desc or "IMPS" in desc:
        return "upi"

    if "POS" in desc or "CARD" in desc or "ECOM" in desc:
        return "card"

    if "ATM" in desc or "CASH" in desc:
        return "cash"

    if "NEFT" in desc or "RTGS" in desc:
        return "bank"

    return "bank"