import pandas as pd
from tqdm import tqdm
from datetime import datetime

ACCOUNT = "hdfc"

def parse(file_path):

    tqdm.write("HDFC parsing started")

    raw = pd.read_excel(file_path, header=None, engine="xlrd")

    header_row = raw[
        raw.apply(lambda r: r.astype(str).str.contains("Withdrawal Amt").any(), axis=1)
    ].index[0]

    df = pd.read_excel(file_path, header=header_row, engine="xlrd")

    df.columns = df.columns.str.replace("*", "", regex=False).str.strip()

    # 🔥 FIXED DATE PARSING (STRICT FORMAT)
    def parse_hdfc_date(val):
        try:
            return datetime.strptime(str(val).strip(), "%d/%m/%y")
        except Exception:
            return pd.NaT

    df["Date"] = df["Date"].apply(parse_hdfc_date)

    withdraw_col = "Withdrawal Amt."
    deposit_col = "Deposit Amt."

    df[withdraw_col] = pd.to_numeric(df[withdraw_col], errors="coerce")
    df[deposit_col] = pd.to_numeric(df[deposit_col], errors="coerce")

    df = df[df["Date"].notna()]
    df = df[df["Narration"].notna()]
    df = df[(df[withdraw_col].notna()) | (df[deposit_col].notna())]

    records = []

    for _, r in tqdm(df.iterrows(), total=len(df), colour="cyan"):

        debit = 0 if pd.isna(r[withdraw_col]) else r[withdraw_col]
        credit = 0 if pd.isna(r[deposit_col]) else r[deposit_col]

        # safer amount logic
        if credit > 0:
            amount = credit
        elif debit > 0:
            amount = -debit
        else:
            amount = 0

        records.append({
            "date": r["Date"].strftime("%Y-%m-%d"),
            "description": str(r["Narration"]).strip(),
            "amount": amount,
            "bank": ACCOUNT
        })

    tqdm.write("HDFC data ingested")

    return records