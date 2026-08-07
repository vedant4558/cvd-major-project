import pandas as pd
from sklearn.model_selection import train_test_split
from pathlib import Path
from config import LABELS_FILE
print("Loading dataset...")
# -----------------------------
# Load dataset
# -----------------------------
df = pd.read_csv(LABELS_FILE)
print("Dataset loaded successfully!")
print("=" * 50)
print(f"Total Images: {len(df)}")
print("=" * 50)

# -----------------------------
# Create output folder
# -----------------------------
split_dir = LABELS_FILE.parent / "splits"
split_dir.mkdir(exist_ok=True)

# -----------------------------
# Train (70%) and Temp (30%)
# -----------------------------
train_df, temp_df = train_test_split(
    df,
    test_size=0.30,
    stratify=df["diagnosis"],
    random_state=42
)

# -----------------------------
# Validation (15%) and Test (15%)
# -----------------------------
val_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    stratify=temp_df["diagnosis"],
    random_state=42
)

# -----------------------------
# Save CSV Files
# -----------------------------
train_df.to_csv(split_dir / "train.csv", index=False)
val_df.to_csv(split_dir / "val.csv", index=False)
test_df.to_csv(split_dir / "test.csv", index=False)

# -----------------------------
# Display Statistics
# -----------------------------
print("\nTrain Set")
print(train_df["diagnosis"].value_counts().sort_index())

print("\nValidation Set")
print(val_df["diagnosis"].value_counts().sort_index())

print("\nTest Set")
print(test_df["diagnosis"].value_counts().sort_index())

print("\nCSV files saved in:")
print(split_dir)

print("\nDataset splitting completed successfully!")