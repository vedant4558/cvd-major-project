import os
import glob
import pandas as pd
from PIL import Image
from io import BytesIO

# ============================================================
# EYEPACS V6 DATA EXTRACTION
# ============================================================

PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..")
)

INPUT_DIR = os.path.join(PROJECT_ROOT, "data", "raw", "eyepacs")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "data", "processed", "eyepacs_selected")

SEED = 42

# Exact number of images to extract per grade
TARGETS = {
    1: 1420,
    2: 1420,
    3: 493,
    4: 401,
}

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ------------------------------------------------------------
# Find shards 0-7
# ------------------------------------------------------------

pattern = os.path.join(
    INPUT_DIR,
    "train-0000[0-7]-of-00014.parquet"
)

files = sorted(glob.glob(pattern))

print("=" * 60)
print("EYEPACS V6 EXTRACTION")
print("=" * 60)

print(f"\nFound shards: {len(files)}")

if len(files) != 8:
    raise RuntimeError(
        f"Expected 8 EyePACS shards (0-7), but found {len(files)}."
    )

for f in files:
    print(" -", os.path.basename(f))

# ------------------------------------------------------------
# Load labels + image bytes
# ------------------------------------------------------------

print("\nLoading EyePACS shards...")

dfs = []

for f in files:
    print("Reading:", os.path.basename(f))

    df = pd.read_parquet(f)

    required = {"image", "label_code"}

    if not required.issubset(df.columns):
        raise RuntimeError(
            f"Missing required columns in {f}: "
            f"{required - set(df.columns)}"
        )

    dfs.append(df[["image", "label_code"]])

df = pd.concat(dfs, ignore_index=True)

print("\nTotal EyePACS images loaded:", len(df))

print("\nAvailable distribution:")
print(df["label_code"].value_counts().sort_index())

# ------------------------------------------------------------
# Select target classes
# ------------------------------------------------------------

selected_parts = []

print("\nSelecting images...")

for grade, target_count in TARGETS.items():

    grade_df = df[df["label_code"] == grade].copy()

    available = len(grade_df)

    print(
        f"Grade {grade}: "
        f"available={available}, "
        f"requested={target_count}"
    )

    if available < target_count:
        raise RuntimeError(
            f"Not enough Grade {grade} images. "
            f"Available={available}, requested={target_count}"
        )

    sampled = grade_df.sample(
        n=target_count,
        random_state=SEED
    )

    selected_parts.append(sampled)

selected = pd.concat(
    selected_parts,
    ignore_index=True
)

# Shuffle selected dataset
selected = selected.sample(
    frac=1,
    random_state=SEED
).reset_index(drop=True)

print("\nSelected distribution:")
print(selected["label_code"].value_counts().sort_index())

print("\nTotal selected:", len(selected))

# ------------------------------------------------------------
# Extract JPEG images
# ------------------------------------------------------------

print("\nExtracting images...")

records = []

for idx, row in selected.iterrows():

    grade = int(row["label_code"])

    image_data = row["image"]

    # Hugging Face Parquet image feature is normally a dict
    # containing the raw JPEG bytes.
    if isinstance(image_data, dict):
        image_bytes = image_data.get("bytes")

    else:
        image_bytes = None

    if image_bytes is None:
        raise RuntimeError(
            f"Could not obtain image bytes at row {idx}"
        )

    filename = f"eyepacs_{idx:05d}.jpg"

    output_path = os.path.join(
        OUTPUT_DIR,
        filename
    )

    # Verify that the bytes are actually a valid image
    try:
        img = Image.open(BytesIO(image_bytes))
        img.verify()
    except Exception as e:
        raise RuntimeError(
            f"Invalid image at row {idx}: {e}"
        )

    # Write original JPEG bytes
    with open(output_path, "wb") as out:
        out.write(image_bytes)

    records.append({
        "image": filename,
        "diagnosis": grade,
        "source": "eyepacs"
    })

    if (idx + 1) % 250 == 0:
        print(f"Extracted {idx + 1}/{len(selected)}")

# ------------------------------------------------------------
# Save labels
# ------------------------------------------------------------

labels_df = pd.DataFrame(records)

labels_path = os.path.join(
    OUTPUT_DIR,
    "eyepacs_selected_labels.csv"
)

labels_df.to_csv(
    labels_path,
    index=False
)

# ------------------------------------------------------------
# Final verification
# ------------------------------------------------------------

print("\n" + "=" * 60)
print("EXTRACTION COMPLETED")
print("=" * 60)

print("\nImages extracted:", len(labels_df))

print("\nFinal distribution:")
print(
    labels_df["diagnosis"]
    .value_counts()
    .sort_index()
)

print("\nOutput directory:")
print(OUTPUT_DIR)

print("\nLabels file:")
print(labels_path)

# Verify file count
image_count = len(
    glob.glob(
        os.path.join(OUTPUT_DIR, "*.jpg")
    )
)

print("\nPhysical JPG files:", image_count)

if image_count != len(labels_df):
    raise RuntimeError(
        "Image count does not match label count!"
    )

print("\n✓ Image count matches labels")
print("✓ All selected images verified")
print("✓ Grade 0 was not added")
print("✓ EyePACS extraction ready for V6")