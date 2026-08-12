from pathlib import Path

import pandas as pd

from config import TRAIN_IMAGES_DIR


# ============================================================
# Paths
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

SPLITS_DIR = PROJECT_ROOT / "data" / "splits"

TRAIN_CSV = SPLITS_DIR / "train.csv"
VAL_CSV = SPLITS_DIR / "val.csv"
TEST_CSV = SPLITS_DIR / "test.csv"


# ============================================================
# Load split
# ============================================================

def load_split(path):

    if not path.exists():
        raise FileNotFoundError(
            f"Split file not found:\n{path}"
        )

    df = pd.read_csv(path)

    required_columns = {
        "id_code",
        "diagnosis",
        "source",
    }

    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"{path.name} is missing columns: "
            f"{missing_columns}"
        )

    return df


# ============================================================
# Print split statistics
# ============================================================

def print_statistics(name, df):

    print("\n" + "=" * 60)
    print(f"{name.upper()} SET")
    print("=" * 60)

    print(f"Total samples: {len(df)}")

    print("\nGrade distribution:")
    print(
        df["diagnosis"]
        .value_counts()
        .sort_index()
    )

    print("\nSource distribution:")
    print(
        df["source"]
        .value_counts()
    )

    print("\nSource × Grade:")
    print(
        pd.crosstab(
            df["source"],
            df["diagnosis"],
        )
    )


# ============================================================
# Check duplicate IDs between splits
# ============================================================

def check_cross_split_duplicates(
    train_df,
    val_df,
    test_df,
):

    print("\n" + "=" * 60)
    print("CROSS-SPLIT DUPLICATE CHECK")
    print("=" * 60)

    train_ids = set(train_df["id_code"])
    val_ids = set(val_df["id_code"])
    test_ids = set(test_df["id_code"])

    train_val = train_ids & val_ids
    train_test = train_ids & test_ids
    val_test = val_ids & test_ids

    print(
        f"Train ∩ Validation: {len(train_val)}"
    )

    print(
        f"Train ∩ Test:       {len(train_test)}"
    )

    print(
        f"Validation ∩ Test:  {len(val_test)}"
    )

    if train_val or train_test or val_test:

        print(
            "\nWARNING: Duplicate IDs found "
            "across splits!"
        )

        return False

    print(
        "\nNo duplicate IDs across splits."
    )

    return True


# ============================================================
# Check missing image files
# ============================================================

def check_missing_images(
    name,
    df,
):

    print("\n" + "=" * 60)
    print(f"{name.upper()} IMAGE FILE CHECK")
    print("=" * 60)

    missing = []

    for image_id in df["id_code"]:

        image_path = (
            TRAIN_IMAGES_DIR
            / f"{image_id}.png"
        )

        if not image_path.exists():
            missing.append(image_id)

    print(
        f"Missing images: {len(missing)}"
    )

    if missing:

        print("\nFirst missing files:")

        for image_id in missing[:10]:
            print(image_id)

        return False

    print("All image files found.")

    return True


# ============================================================
# Check duplicate rows
# ============================================================

def check_internal_duplicates(
    name,
    df,
):

    duplicate_count = (
        df["id_code"]
        .duplicated()
        .sum()
    )

    print(
        f"{name}: duplicate IDs = "
        f"{duplicate_count}"
    )

    return duplicate_count == 0


# ============================================================
# Main
# ============================================================

def main():

    print("=" * 60)
    print("RETINAL DATASET AUDIT")
    print("=" * 60)

    print("\nLoading split files...")

    train_df = load_split(TRAIN_CSV)
    val_df = load_split(VAL_CSV)
    test_df = load_split(TEST_CSV)

    print("All split files loaded successfully.")

    # --------------------------------------------------------
    # Statistics
    # --------------------------------------------------------

    print_statistics(
        "Train",
        train_df,
    )

    print_statistics(
        "Validation",
        val_df,
    )

    print_statistics(
        "Test",
        test_df,
    )

    # --------------------------------------------------------
    # Duplicate checks
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("INTERNAL DUPLICATE CHECK")
    print("=" * 60)

    train_clean = check_internal_duplicates(
        "Train",
        train_df,
    )

    val_clean = check_internal_duplicates(
        "Validation",
        val_df,
    )

    test_clean = check_internal_duplicates(
        "Test",
        test_df,
    )

    # --------------------------------------------------------
    # Cross split check
    # --------------------------------------------------------

    cross_split_clean = (
        check_cross_split_duplicates(
            train_df,
            val_df,
            test_df,
        )
    )

    # --------------------------------------------------------
    # Missing image checks
    # --------------------------------------------------------

    train_images_clean = check_missing_images(
        "Train",
        train_df,
    )

    val_images_clean = check_missing_images(
        "Validation",
        val_df,
    )

    test_images_clean = check_missing_images(
        "Test",
        test_df,
    )

    # --------------------------------------------------------
    # Overall result
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("DATASET AUDIT SUMMARY")
    print("=" * 60)

    all_checks_passed = all(
        [
            train_clean,
            val_clean,
            test_clean,
            cross_split_clean,
            train_images_clean,
            val_images_clean,
            test_images_clean,
        ]
    )

    if all_checks_passed:

        print("\n✓ All dataset audit checks passed.")

    else:

        print(
            "\n⚠ Some dataset audit checks failed."
        )

    print(
        "\nDataset audit completed."
    )


# ============================================================
# Entry Point
# ============================================================

if __name__ == "__main__":
    main()