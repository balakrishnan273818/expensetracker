import pandas as pd
import psycopg2
import os


def detect_engine(file):
    ext = os.path.splitext(file)[1]
    if ext == ".xlsx":
        return "openpyxl"
    elif ext == ".xls":
        return "xlrd"
    else:
        raise Exception("Unsupported file type")


def parse_idfc(file, engine):

    raw = pd.read_excel(file, header=None, engine=engine)

    header_row = raw[raw[0] == "Transaction Date"].index[0]

    df = pd.read_excel(file, header=header_row, engine=engine)

    df = df[df["Transaction Date"].notna()]

    records = []

    for _, r in df.iterrows():

        amount = r["Debit"] if pd.notna(r["Debit"]) else r["Credit"]

        records.append({
            "date": r["Transaction Date"],
            "description": r["Particulars"],
            "amount": amount,
            "account": "IDFCExpense"
        })

    return records


def parse_axis(file, engine):

    raw = pd.read_excel(file, header=None, engine=engine)

    header_row = raw[
        raw.apply(lambda r: r.astype(str).str.contains("Tran Date").any(), axis=1)
    ].index[0]

    df = pd.read_excel(file, header=header_row, engine=engine)

    df = df[df["Tran Date"].notna()]

    records = []

    for _, r in df.iterrows():

        amount = r["Debit"] if pd.notna(r["Debit"]) else r["Credit"]

        records.append({
            "date": r["Tran Date"],
            "description": r["Description"],
            "amount": amount,
            "account": "AxisSalary"
        })

    return records


def detect_bank(file):

    name = file.upper()

    if "IDFC" in name:
        return "IDFC"
    if "AXIS" in name:
        return "AXIS"

    raise Exception("Bank not recognized")


def insert_records(records):

    conn = psycopg2.connect(
        host="localhost",
        database="expense_tracker",
        user="postgres",
        password="Bull@1895",
        port="5432"
    )

    cur = conn.cursor()

    for r in records:

        cur.execute("""
        INSERT INTO transactions
        (date, amount, description, account, source)
        VALUES (%s,%s,%s,%s,%s)
        ON CONFLICT DO NOTHING
        """, (
            r["date"],
            r["amount"],
            r["description"],
            r["account"],
            "bank_import"
        ))

    conn.commit()
    cur.close()
    conn.close()


def main():

    file = "statement_file"

    engine = detect_engine(file)

    bank = detect_bank(file)

    if bank == "IDFC":
        records = parse_idfc(file, engine)

    elif bank == "AXIS":
        records = parse_axis(file, engine)

    else:
        raise Exception("Parser not implemented")

    insert_records(records)


if __name__ == "__main__":
    main()