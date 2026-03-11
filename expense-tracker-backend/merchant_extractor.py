import re


def extract_merchant(description):

    desc = description.upper()

    parts = re.split(r'[/\-]', desc)

    for p in parts:

        p = p.strip()

        if len(p) < 4:
            continue

        if re.match(r'^\d+$', p):
            continue

        if p in ["UPI", "DR", "CR", "P2M", "P2A", "PAYMENT", "REMARKS"]:
            continue

        return p

    return desc[:30]