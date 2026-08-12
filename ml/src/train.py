from pathlib import Path

import pandas as pd
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader
from torchvision import models

from config import (
    BATCH_SIZE,
    NUM_CLASSES,
    MODELS_DIR,
    EPOCHS,
)

from dataset import RetinalDataset
from transforms import (
    get_train_transforms,
    get_val_transforms,
)


# ============================================================
# Paths
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

SPLITS_DIR = PROJECT_ROOT / "data" / "splits"

TRAIN_CSV = SPLITS_DIR / "train.csv"
VAL_CSV = SPLITS_DIR / "val.csv"

BASELINE_MODEL_PATH = (
    MODELS_DIR / "best_model.pth"
)

FINE_TUNED_MODEL_PATH = (
    MODELS_DIR / "finetuned_best_model.pth"
)


# ============================================================
# Device
# ============================================================

def get_device():

    if torch.cuda.is_available():
        return torch.device("cuda")

    return torch.device("cpu")


# ============================================================
# DataLoaders
# ============================================================

def create_dataloaders():

    train_dataset = RetinalDataset(
        csv_file=TRAIN_CSV,
        transform=get_train_transforms(),
    )

    val_dataset = RetinalDataset(
        csv_file=VAL_CSV,
        transform=get_val_transforms(),
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=0,
        pin_memory=False,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0,
        pin_memory=False,
    )

    return (
        train_dataset,
        val_dataset,
        train_loader,
        val_loader,
    )


# ============================================================
# Class Weights
# ============================================================

def calculate_class_weights(train_csv):

    df = pd.read_csv(train_csv)

    class_counts = (
        df["diagnosis"]
        .value_counts()
        .sort_index()
    )

    total_samples = len(df)

    weights = total_samples / (
        NUM_CLASSES * class_counts
    )

    weights = weights.sort_index()

    print("\nTraining class distribution:")
    print(class_counts)

    print("\nClass weights:")
    print(weights)

    return torch.tensor(
        weights.values,
        dtype=torch.float32,
    )


# ============================================================
# Build Fine-Tuning Model
# ============================================================

def build_model(device):

    print("\nLoading EfficientNet-B0...")

    model = models.efficientnet_b0(
        weights=models.EfficientNet_B0_Weights.DEFAULT
    )

    # --------------------------------------------------------
    # Replace ImageNet classifier
    # --------------------------------------------------------

    input_features = (
        model.classifier[1].in_features
    )

    model.classifier[1] = nn.Linear(
        input_features,
        NUM_CLASSES,
    )

    # --------------------------------------------------------
    # Load our previously trained model
    # --------------------------------------------------------

    if not BASELINE_MODEL_PATH.exists():

        raise FileNotFoundError(
            f"\nBaseline model not found:\n"
            f"{BASELINE_MODEL_PATH}"
        )

    print(
        f"\nLoading baseline model:\n"
        f"{BASELINE_MODEL_PATH}"
    )

    state_dict = torch.load(
        BASELINE_MODEL_PATH,
        map_location=device,
    )

    model.load_state_dict(state_dict)

    print("Baseline model loaded successfully.")

    # --------------------------------------------------------
    # Freeze everything first
    # --------------------------------------------------------

    for parameter in model.parameters():
        parameter.requires_grad = False

    # --------------------------------------------------------
    # Unfreeze final EfficientNet feature blocks
    # --------------------------------------------------------

    for parameter in model.features[-2:].parameters():
        parameter.requires_grad = True

    # --------------------------------------------------------
    # Always train classifier
    # --------------------------------------------------------

    for parameter in model.classifier.parameters():
        parameter.requires_grad = True

    model = model.to(device)

    # --------------------------------------------------------
    # Display trainable parameters
    # --------------------------------------------------------

    total_parameters = 0
    trainable_parameters = 0

    for parameter in model.parameters():

        parameter_count = parameter.numel()

        total_parameters += parameter_count

        if parameter.requires_grad:
            trainable_parameters += parameter_count

    print(
        f"\nTotal parameters: "
        f"{total_parameters:,}"
    )

    print(
        f"Trainable parameters: "
        f"{trainable_parameters:,}"
    )

    print(
        "\nFine-tuning final EfficientNet blocks "
        "and classifier."
    )

    return model


# ============================================================
# Train One Epoch
# ============================================================

def train_one_epoch(
    model,
    loader,
    criterion,
    optimizer,
    device,
):

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels,
        )

        loss.backward()

        # Gradient clipping
        torch.nn.utils.clip_grad_norm_(
            model.parameters(),
            max_norm=1.0,
        )

        optimizer.step()

        running_loss += (
            loss.item() * images.size(0)
        )

        predictions = torch.argmax(
            outputs,
            dim=1,
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    epoch_loss = running_loss / total
    epoch_accuracy = correct / total

    return epoch_loss, epoch_accuracy


# ============================================================
# Validation
# ============================================================

def validate(
    model,
    loader,
    criterion,
    device,
):

    model.eval()

    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():

        for images, labels in loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            loss = criterion(
                outputs,
                labels,
            )

            running_loss += (
                loss.item() * images.size(0)
            )

            predictions = torch.argmax(
                outputs,
                dim=1,
            )

            correct += (
                predictions == labels
            ).sum().item()

            total += labels.size(0)

    epoch_loss = running_loss / total
    epoch_accuracy = correct / total

    return epoch_loss, epoch_accuracy


# ============================================================
# Main
# ============================================================

def main():

    print("=" * 60)
    print("EFFICIENTNET-B0 FINE-TUNING")
    print("=" * 60)

    # --------------------------------------------------------
    # Device
    # --------------------------------------------------------

    device = get_device()

    print(f"\nDevice: {device}")

    # --------------------------------------------------------
    # Data
    # --------------------------------------------------------

    print("\nLoading datasets...")

    (
        train_dataset,
        val_dataset,
        train_loader,
        val_loader,
    ) = create_dataloaders()

    print(
        f"Training samples:   "
        f"{len(train_dataset)}"
    )

    print(
        f"Validation samples: "
        f"{len(val_dataset)}"
    )

    # --------------------------------------------------------
    # Class weights
    # --------------------------------------------------------

    class_weights = calculate_class_weights(
        TRAIN_CSV
    )

    class_weights = class_weights.to(device)

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = build_model(device)

    # --------------------------------------------------------
    # Loss
    # --------------------------------------------------------

    criterion = nn.CrossEntropyLoss(
        weight=class_weights
    )

    # --------------------------------------------------------
    # Optimizer
    # --------------------------------------------------------

    optimizer = AdamW(
        filter(
            lambda p: p.requires_grad,
            model.parameters(),
        ),
        lr=1e-5,
        weight_decay=1e-4,
    )

    # --------------------------------------------------------
    # Scheduler
    # --------------------------------------------------------

    scheduler = ReduceLROnPlateau(
        optimizer,
        mode="min",
        factor=0.5,
        patience=1,
    )

    # --------------------------------------------------------
    # Training
    # --------------------------------------------------------

    best_val_loss = float("inf")

    print("\nStarting fine-tuning...")

    for epoch in range(1, EPOCHS + 1):

        print(
            f"\nEpoch {epoch}/{EPOCHS}"
        )

        train_loss, train_accuracy = (
            train_one_epoch(
                model,
                train_loader,
                criterion,
                optimizer,
                device,
            )
        )

        val_loss, val_accuracy = validate(
            model,
            val_loader,
            criterion,
            device,
        )

        scheduler.step(val_loss)

        current_lr = (
            optimizer.param_groups[0]["lr"]
        )

        print(
            f"Train Loss: "
            f"{train_loss:.4f}"
        )

        print(
            f"Train Accuracy: "
            f"{train_accuracy:.4f}"
        )

        print(
            f"Validation Loss: "
            f"{val_loss:.4f}"
        )

        print(
            f"Validation Accuracy: "
            f"{val_accuracy:.4f}"
        )

        print(
            f"Learning Rate: "
            f"{current_lr:.7f}"
        )

        # ----------------------------------------------------
        # Save best fine-tuned model
        # ----------------------------------------------------

        if val_loss < best_val_loss:

            best_val_loss = val_loss

            torch.save(
                model.state_dict(),
                FINE_TUNED_MODEL_PATH,
            )

            print(
                "\n✓ New best fine-tuned model saved."
            )

    print("\n" + "=" * 60)
    print("FINE-TUNING COMPLETED")
    print("=" * 60)

    print(
        f"\nBest fine-tuned model:"
        f"\n{FINE_TUNED_MODEL_PATH}"
    )


# ============================================================
# Entry Point
# ============================================================

if __name__ == "__main__":
    main()