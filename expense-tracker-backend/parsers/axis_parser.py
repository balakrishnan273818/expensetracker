import pandas as pd
from tqdm import tqdm
from datetime import datetime

ACCOUNT = "Axis"

def parse(file_path):

    tqdm.write("Axis parsing started")

    df = pd.read_excel(file_path, engine="xlrd", skiprows=16)

    df.columns = df.columns.str.strip()

    df = df[df["SRL NO"].notna()]
    df = df.dropna(subset=["Tran Date", "PARTICULARS"])

    records = []

    for _, r in tqdm(df.iterrows(), total=len(df), colour="cyan"):

        debit = pd.to_numeric(r.get("DR", 0), errors="coerce")
        credit = pd.to_numeric(r.get("CR", 0), errors="coerce")

        debit = 0 if pd.isna(debit) else debit
        credit = 0 if pd.isna(credit) else credit

        # safer amount logic
        if credit > 0:
            amount = credit
        elif debit > 0:
            amount = -debit
        else:
            amount = 0

        # 🔥 FIXED DATE PARSING (explicit format)
        try:
            date = datetime.strptime(str(r["Tran Date"]).strip(), "%d-%m-%Y").strftime("%Y-%m-%d")
        except Exception:
            # fallback (in case pandas already parsed it)
            date = pd.to_datetime(r["Tran Date"]).strftime("%Y-%m-%d")

        records.append({
            "date": date,
            "description": str(r["PARTICULARS"]).strip(),
            "amount": amount,
            "bank": ACCOUNT
        })

    tqdm.write("Axis data ingested")

    return records