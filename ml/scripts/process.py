import pandas as pd
from pathlib import Path

INPUT_FILE = Path(r"E:\Coding\HeavyLift\ml\data\raw\DATASET FOR HEAVEY EQUIPMENT LAHON PROJECT.xlsx")
OUTPUT_FILE = Path(r"E:\Coding\HeavyLift\ml\data\process\combined_data.csv")

all_data = []

print(f"Processing {INPUT_FILE}...")

workbook = pd.read_excel(INPUT_FILE, sheet_name=None)

for sheet_name, df in workbook.items():
    df["month"] = sheet_name
    all_data.append(df)

combined_df = pd.concat(all_data, ignore_index=True)
combined_df.to_csv(OUTPUT_FILE, index=False)
print(f"\nDone! Saved {len(combined_df)} rows to {OUTPUT_FILE}")