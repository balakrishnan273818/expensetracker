import pandas as pd
from tqdm import tqdm

ACCOUNT = "IDFC"


def parse(file_path):

    tqdm.write("IDFC parsing started")

    raw = pd.read_excel(file_path, header=None)

    header_row = raw[
        raw.apply(lambda r: r.astype(str).str.contains("Transaction Date").any(), axis=1)
    ].index[0]

    df = pd.read_excel(file_path, header=header_row)

    df.columns = df.columns.str.strip()

    df = df[df["Transaction Date"].notna()]
    df = df[(df["Debit"].notna()) | (df["Credit"].notna())]

    df["Debit"] = pd.to_numeric(df["Debit"], errors="coerce")
    df["Credit"] = pd.to_numeric(df["Credit"], errors="coerce")

    records = []

    for _, r in tqdm(df.iterrows(), total=len(df), colour="cyan"):

        debit = 0 if pd.isna(r["Debit"]) else r["Debit"]
        credit = 0 if pd.isna(r["Credit"]) else r["Credit"]

        amount = credit if credit else -debit

        date = pd.to_datetime(r["Transaction Date"]).strftime("%Y-%m-%d")

        records.append({
            "date": date,
            "description": str(r["Particulars"]).strip(),
            "amount": amount,
            "bank": ACCOUNT
        })

    tqdm.write("IDFC data ingested")

    return records
