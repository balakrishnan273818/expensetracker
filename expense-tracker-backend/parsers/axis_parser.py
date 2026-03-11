import pandas as pd
from tqdm import tqdm

ACCOUNT = "axis"

def parse(file_path):
    print("Axis parsing started")
    df = pd.read_excel(file_path, engine="xlrd", skiprows=16)

    df.columns = df.columns.str.strip()

    df = df[df["SRL NO"].notna()]
    df = df.dropna(subset=["Tran Date", "PARTICULARS"])
    records = []



    for _, r in tqdm(df.iterrows(), total=len(df)):
        debit = r.get("DR", 0)
        credit = r.get("CR", 0)

        debit = float(debit) if str(debit).strip() else 0
        credit = float(credit) if str(credit).strip() else 0

        amount = credit if credit else -debit
        date = pd.to_datetime(r["Tran Date"]).date()

        records.append({
            "date": date,
            "description": r["PARTICULARS"],
            "amount": amount,
            "account": ACCOUNT
        })
    print("Axis data ingested")
    return records

'''
def parse(file_path):

    df = pd.read_excel(file_path, engine="xlrd", skiprows=16)

    #df = pd.read_excel(file_path, engine="xlrd")
    print(df.columns)

    records = []

    for _, r in df.iterrows():

        debit = r.get("DR", 0)
        credit = r.get("CR", 0)

        amount = credit if credit else -debit

        records.append({
            "date": r["Tran Date"],
            "description": r["PARTICULARS"],
            "amount": amount,
            "balance": r["BAL"]
        })

    return records
'''