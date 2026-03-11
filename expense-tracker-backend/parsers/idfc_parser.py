import pandas as pd
from tqdm import tqdm
ACCOUNT = "idfc"

def parse(file_path):
    print("idfc parsing started")
    raw = pd.read_excel(file_path, header=None)

    header_row = raw[raw.apply(lambda r: r.astype(str).str.contains("Transaction Date").any(), axis=1)].index[0]

    df = pd.read_excel(file_path, header=header_row)

    df.columns = df.columns.str.strip()

    df = df[df["Transaction Date"].notna()]
    df = df[(df["Debit"].notna()) | (df["Credit"].notna())]

    records = []

    for _, r in tqdm(df.iterrows(), total=len(df)):

        #debit = float(str(r.get("Debit",0)).replace(",","")) if str(r.get("Debit","")).strip() else 0
        #credit = float(str(r.get("Credit",0)).replace(",","")) if str(r.get("Credit","")).strip() else 0
        #amount = credit if credit else -debit

        debit = float(str(r["Debit"]).replace(",", "")) if pd.notna(r["Debit"]) else 0
        credit = float(str(r["Credit"]).replace(",", "")) if pd.notna(r["Credit"]) else 0
        amount = credit if credit else -debit

        date = pd.to_datetime(r["Transaction Date"]).date()

        records.append({
            "date": date,
            "description": r["Particulars"],
            "amount": amount,
            "account": ACCOUNT
        })
    print("idfc data ingested")
    return records