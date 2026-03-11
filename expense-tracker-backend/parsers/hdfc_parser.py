import pandas as pd
from tqdm import tqdm
ACCOUNT = "hdfc"

def parse(file_path):
    print("hdfc parsing started")
    raw = pd.read_excel(file_path, header=None, engine="xlrd")

    header_row = raw[raw.apply(lambda r: r.astype(str).str.contains("Withdrawal Amt").any(), axis=1)].index[0]

    df = pd.read_excel(file_path, header=header_row, engine="xlrd")

    df.columns = df.columns.str.replace("*","", regex=False).str.strip()

    # convert date once
    '''
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce", dayfirst=True)

    # keep only valid transaction rows
    df = df[df["Date"].notna()]
    #df = df[(df[withdraw_col].notna()) | (df[deposit_col].notna())]
    df = df[(pd.to_numeric(df[withdraw_col], errors="coerce").notna()) |
            (pd.to_numeric(df[deposit_col], errors="coerce").notna())]
    '''
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce", dayfirst=True)

    withdraw_col = "Withdrawal Amt."
    deposit_col = "Deposit Amt."

    df[withdraw_col] = pd.to_numeric(df[withdraw_col], errors="coerce")
    df[deposit_col] = pd.to_numeric(df[deposit_col], errors="coerce")

    df = df[df["Date"].notna()]
    df = df[df["Narration"].notna()]
    df = df[(df[withdraw_col].notna()) | (df[deposit_col].notna())]

    records = []

    for _, r in tqdm(df.iterrows(), total=len(df)):

        debit = pd.to_numeric(r[withdraw_col], errors="coerce")
        credit = pd.to_numeric(r[deposit_col], errors="coerce")

        debit = 0 if pd.isna(debit) else debit
        credit = 0 if pd.isna(credit) else credit

        amount = credit if credit else -debit

        records.append({
            "date": r["Date"].date(),
            "description": r["Narration"],
            "amount": amount,
            "account": ACCOUNT
        })
    print("Hdfc data ingested")
    return records