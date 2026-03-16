import pandas as pd
from tqdm import tqdm

ACCOUNT = "HDFC"


def parse(file_path):

    tqdm.write("HDFC parsing started")

    raw = pd.read_excel(file_path, header=None, engine="xlrd")

    header_row = raw[
        raw.apply(lambda r: r.astype(str).str.contains("Withdrawal Amt").any(), axis=1)
    ].index[0]

    df = pd.read_excel(file_path, header=header_row, engine="xlrd")

    df.columns = df.columns.str.replace("*", "", regex=False).str.strip()

    df["Date"] = pd.to_datetime(df["Date"], errors="coerce", dayfirst=True, format='mixed')

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

        amount = credit if credit else -debit

        records.append({
            "date": r["Date"].strftime("%Y-%m-%d"),
            "description": str(r["Narration"]).strip(),
            "amount": amount,
            "bank": ACCOUNT
        })

    tqdm.write("HDFC data ingested")

    return records
