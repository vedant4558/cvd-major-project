from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import models

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    cohen_kappa_score,
)

from config import (
    BATCH_SIZE,
    NUM_CLASSES,
)

from dataset import RetinalDataset
from transforms import get_val_transforms


# ============================================================
# Paths
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

SPLITS_DIR = PROJECT_ROOT / "data" / "splits"

TEST_CSV = SPLITS_DIR / "test.csv"

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "v5_best_model.pth"
)


# ============================================================
# Device
# ============================================================

def get_device():

    if torch.cuda.is_available():
        return torch.device("cuda")

    return torch.device("cpu")


# ============================================================
# Build Model
# ============================================================

def build_model():

    model = models.efficientnet_b0(
        weights=None
    )

    input_features = (
        model.classifier[1].in_features
    )

    model.classifier[1] = nn.Linear(
        input_features,
        NUM_CLASSES,
    )

    return model


# ============================================================
# Load Test Dataset
# ============================================================

def create_test_loader():

    test_dataset = RetinalDataset(
        csv_file=TEST_CSV,
        transform=get_val_transforms(),
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0,
        pin_memory=False,
    )

    return test_dataset, test_loader


# ============================================================
# Quadratic Weighted Kappa
# ============================================================

def calculate_qwk(
    true_labels,
    predictions,
):

    return cohen_kappa_score(
        true_labels,
        predictions,
        weights="quadratic",
    )


# ============================================================
# Evaluate Model
# ============================================================

def evaluate_model(
    model,
    test_loader,
    device,
):

    model.eval()

    all_labels = []
    all_predictions = []

    with torch.no_grad():

        for images, labels in test_loader:

            images = images.to(device)

            outputs = model(images)

            predictions = torch.argmax(
                outputs,
                dim=1,
            )

            all_labels.extend(
                labels.numpy()
            )

            all_predictions.extend(
                predictions.cpu().numpy()
            )

    return all_labels, all_predictions


# ============================================================
# Main
# ============================================================

def main():

    print("=" * 60)
    print("EFFICIENTNET-B0 MODEL EVALUATION")
    print("=" * 60)

    # --------------------------------------------------------
    # Device
    # --------------------------------------------------------

    device = get_device()

    print(f"\nDevice: {device}")

    # --------------------------------------------------------
    # Check model
    # --------------------------------------------------------

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            f"\nModel not found:\n{MODEL_PATH}"
        )

    print(
        f"\nLoading model:\n{MODEL_PATH}"
    )

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    model = build_model()

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=device,
    )

    model.load_state_dict(
        checkpoint
    )

    model = model.to(device)

    print("Model loaded successfully.")

    # --------------------------------------------------------
    # Test dataset
    # --------------------------------------------------------

    print("\nLoading test dataset...")

    test_dataset, test_loader = (
        create_test_loader()
    )

    print(
        f"Test samples: {len(test_dataset)}"
    )

    # --------------------------------------------------------
    # Predictions
    # --------------------------------------------------------

    print("\nRunning predictions...")

    true_labels, predictions = (
        evaluate_model(
            model,
            test_loader,
            device,
        )
    )

    # --------------------------------------------------------
    # Accuracy
    # --------------------------------------------------------

    accuracy = accuracy_score(
        true_labels,
        predictions,
    )

    # --------------------------------------------------------
    # QWK
    # --------------------------------------------------------

    qwk = calculate_qwk(
        true_labels,
        predictions,
    )

    # --------------------------------------------------------
    # Classification Report
    # --------------------------------------------------------

    report = classification_report(
        true_labels,
        predictions,
        labels=list(range(NUM_CLASSES)),
        target_names=[
            "Grade 0",
            "Grade 1",
            "Grade 2",
            "Grade 3",
            "Grade 4",
        ],
        zero_division=0,
    )

    # --------------------------------------------------------
    # Confusion Matrix
    # --------------------------------------------------------

    cm = confusion_matrix(
        true_labels,
        predictions,
        labels=list(range(NUM_CLASSES)),
    )

    # --------------------------------------------------------
    # Results
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("EVALUATION RESULTS")
    print("=" * 60)

    print(
        f"\nAccuracy: {accuracy:.4f}"
    )

    print(
        f"QWK:      {qwk:.4f}"
    )

    print("\nClassification Report:")
    print(report)

    print("Confusion Matrix:")
    print(cm)

    print("\n" + "=" * 60)
    print("EVALUATION COMPLETED")
    print("=" * 60)


# ============================================================
# Entry Point
# ============================================================

if __name__ == "__main__":
    main()