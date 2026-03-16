import re


# -----------------------------
# Merchant Extraction Patterns
# -----------------------------

UPI_PATTERNS = [

    # Standard UPI DR format
    re.compile(r"UPI/DR/\d+/([^/]+)/", re.IGNORECASE),

    # UPI DR without trailing slash
    re.compile(r"UPI/DR/\d+/([^/]+)", re.IGNORECASE),

    # UPI dash format
    re.compile(r"UPI-([^-\n]+)-", re.IGNORECASE),

    # POS transactions
    re.compile(r"POS/([^/]+)", re.IGNORECASE),

    # Generic fallback pattern
    re.compile(r"/([A-Z][A-Z0-9\s]{2,})/", re.IGNORECASE)

]


# -----------------------------
# Internal Transfer Patterns
# -----------------------------

INTERNAL_PATTERNS = [
    "ADDMONEY",
    "IDFC FIRST",
    "IMPS P2P",
    "BALAKRISHNAN"
]


# -----------------------------
# Merchant Normalization
# -----------------------------

def clean_merchant(name):
    """
    Normalize merchant name
    """

    if not name:
        return "UNKNOWN"

    name = name.upper().strip()

    # remove special characters
    name = re.sub(r"[^A-Z0-9 ]", "", name)

    # collapse spaces
    name = re.sub(r"\s+", " ", name)

    return name


# -----------------------------
# Pattern Rule Matching
# -----------------------------

def find_pattern_rule(desc, patterns):

    d = desc.upper()

    for p in patterns:

        pattern = p["pattern"]

        # ignore very short patterns
        if len(pattern) < 3:
            continue

        if pattern in d:
            return {
                "merchant": p["merchant"],
                "category": p["category"],
                "sub_category": p["sub_category"],
                "source": "pattern"
            }

    return None


# -----------------------------
# Merchant Extraction
# -----------------------------

def extract_merchant(desc, patterns=None, aliases=None):

    if patterns is None:
        patterns = []

    d = desc.upper()

    # 1 INTERNAL TRANSFER DETECTION
    for p in INTERNAL_PATTERNS:
        if p in d:
            return {
                "merchant": "INTERNAL_TRANSFER",
                "source": "internal"
            }

    # 2 PATTERN RULE MATCH
    pattern_match = find_pattern_rule(d, patterns)

    if pattern_match:
        return pattern_match

    # 3 WALLET TOPUP
    if "ADDMONEY" in d:
        return {
            "merchant": "ADDMONEY",
            "source": "wallet"
        }

    # 4 MERCHANT EXTRACTION USING MULTIPLE PATTERNS
    merchant = None

    for pattern in UPI_PATTERNS:

        m = pattern.search(d)

        if m:
            merchant = m.group(1).strip()
            break

    if merchant is None:
        return {
            "merchant": "UNKNOWN",
            "source": "unknown"
        }

    # 5 NORMALIZE MERCHANT
    merchant = clean_merchant(merchant)

    # protect against garbage merchants
    if len(merchant) < 2:
        merchant = "UNKNOWN"

    # 6 ALIAS NORMALIZATION (DB aliases)
    if aliases:
        merchant = aliases.get(merchant, merchant)

    return {
        "merchant": merchant,
        "source": "extracted"
    }
