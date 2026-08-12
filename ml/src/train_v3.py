import random
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn

from torch.optim import AdamW
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader, WeightedRandomSampler

from torchvision import models, transforms

from dataset import RetinalDataset
from config import (
    PROJECT_ROOT,
    TRAIN_IMAGES_DIR,
    MODELS_DIR,
    BATCH_SIZE,
    NUM_CLASSES,
)


# ============================================================
# Configuration
# ============================================================

TRAIN_CSV = PROJECT_ROOT / "data" / "splits" / "train.csv"
VAL_CSV = PROJECT_ROOT / "data" / "splits" / "val.csv"

V3_MODEL_PATH = MODELS_DIR / "v3_best_model.pth"
V3_CHECKPOINT_PATH = MODELS_DIR / "v3_checkpoint.pth"

NUM_EPOCHS = 15
LEARNING_RATE = 1e-5
WEIGHT_DECAY = 1e-4

PATIENCE = 4
GRADIENT_CLIP = 1.0

NUM_WORKERS = 0

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

SEED = 42


# ============================================================
# Reproducibility
# ============================================================

def set_seed(seed=SEED):

    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


# ============================================================
# Device
# ============================================================

def get_device():

    if torch.cuda.is_available():
        return torch.device("cuda")

    return torch.device("cpu")


# ============================================================
# Transforms
# ============================================================

def get_train_transform():

    return transforms.Compose([
        transforms.RandomHorizontalFlip(p=0.5),

        transforms.RandomRotation(
            degrees=10
        ),

        transforms.RandomAffine(
            degrees=0,
            translate=(0.05, 0.05),
            scale=(0.95, 1.05)
        ),

        transforms.ColorJitter(
            brightness=0.15,
            contrast=0.15,
            saturation=0.10,
            hue=0.02
        ),

        transforms.ToTensor(),

        transforms.Normalize(
            IMAGENET_MEAN,
            IMAGENET_STD
        ),
    ])


def get_val_transform():

    return transforms.Compose([
        transforms.ToTensor(),

        transforms.Normalize(
            IMAGENET_MEAN,
            IMAGENET_STD
        ),
    ])


# ============================================================
# Class weights
# ============================================================

def calculate_class_weights(csv_file):

    df = pd.read_csv(csv_file)

    class_counts = (
        df["diagnosis"]
        .value_counts()
        .sort_index()
    )

    total = len(df)

    weights = total / (
        NUM_CLASSES * class_counts
    )

    weights = weights.reindex(
        range(NUM_CLASSES),
        fill_value=0
    )

    print("\nTraining class distribution:")
    print(class_counts)

    print("\nCalculated class weights:")
    print(weights)

    return torch.tensor(
        weights.values,
        dtype=torch.float32
    )


# ============================================================
# Weighted sampler
# ============================================================

def create_weighted_sampler(csv_file):

    df = pd.read_csv(csv_file)

    class_counts = (
        df["diagnosis"]
        .value_counts()
        .sort_index()
    )

    class_weights = {
        class_id: len(df) / count
        for class_id, count in class_counts.items()
    }

    sample_weights = [
        class_weights[int(label)]
        for label in df["diagnosis"]
    ]

    sample_weights = torch.tensor(
        sample_weights,
        dtype=torch.double
    )

    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True
    )

    return sampler


# ============================================================
# Model
# ============================================================

def build_model():

    print("\nLoading pretrained EfficientNet-B0...")

    weights = (
        models.EfficientNet_B0_Weights.DEFAULT
    )

    model = models.efficientnet_b0(
        weights=weights
    )

    # Freeze the majority of the network first.
    for parameter in model.features.parameters():
        parameter.requires_grad = False

    # Unfreeze the final feature block.
    for parameter in model.features[-1].parameters():
        parameter.requires_grad = True

    # Replace classifier.
    in_features = (
        model.classifier[1].in_features
    )

    model.classifier = nn.Sequential(
        nn.Dropout(p=0.30),
        nn.Linear(
            in_features,
            NUM_CLASSES
        )
    )

    return model


# ============================================================
# Trainable parameter count
# ============================================================

def print_parameter_counts(model):

    total = sum(
        parameter.numel()
        for parameter in model.parameters()
    )

    trainable = sum(
        parameter.numel()
        for parameter in model.parameters()
        if parameter.requires_grad
    )

    print(
        f"\nTotal parameters:     {total:,}"
    )

    print(
        f"Trainable parameters: {trainable:,}"
    )


# ============================================================
# Training epoch
# ============================================================

def train_one_epoch(
    model,
    loader,
    criterion,
    optimizer,
    device,
    scaler,
):

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:

        images = images.to(
            device,
            non_blocking=True
        )

        labels = labels.to(
            device,
            non_blocking=True
        )

        optimizer.zero_grad(
            set_to_none=True
        )

        use_amp = device.type == "cuda"

        with torch.autocast(
            device_type=device.type,
            dtype=torch.float16,
            enabled=use_amp
        ):

            outputs = model(images)

            loss = criterion(
                outputs,
                labels
            )

        if use_amp:

            scaler.scale(loss).backward()

            scaler.unscale_(optimizer)

            torch.nn.utils.clip_grad_norm_(
                model.parameters(),
                GRADIENT_CLIP
            )

            scaler.step(optimizer)
            scaler.update()

        else:

            loss.backward()

            torch.nn.utils.clip_grad_norm_(
                model.parameters(),
                GRADIENT_CLIP
            )

            optimizer.step()

        running_loss += (
            loss.item() * images.size(0)
        )

        predictions = outputs.argmax(
            dim=1
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    epoch_loss = (
        running_loss / total
    )

    epoch_accuracy = (
        correct / total
    )

    return epoch_loss, epoch_accuracy


# ============================================================
# Validation epoch
# ============================================================

@torch.no_grad()
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

    for images, labels in loader:

        images = images.to(
            device,
            non_blocking=True
        )

        labels = labels.to(
            device,
            non_blocking=True
        )

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        running_loss += (
            loss.item() * images.size(0)
        )

        predictions = outputs.argmax(
            dim=1
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    epoch_loss = (
        running_loss / total
    )

    epoch_accuracy = (
        correct / total
    )

    return epoch_loss, epoch_accuracy


# ============================================================
# Save checkpoint
# ============================================================

def save_checkpoint(
    model,
    optimizer,
    scheduler,
    epoch,
    best_val_accuracy,
):

    checkpoint = {
        "epoch": epoch,
        "model_state_dict": model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
        "scheduler_state_dict": scheduler.state_dict(),
        "best_val_accuracy": best_val_accuracy,
    }

    torch.save(
        checkpoint,
        V3_CHECKPOINT_PATH
    )


# ============================================================
# Main
# ============================================================

def main():

    set_seed()

    print("=" * 60)
    print("EFFICIENTNET-B0 V3 TRAINING")
    print("=" * 60)

    device = get_device()

    print(f"\nDevice: {device}")

    # --------------------------------------------------------
    # Dataset checks
    # --------------------------------------------------------

    if not TRAIN_CSV.exists():
        raise FileNotFoundError(
            f"Training CSV not found:\n{TRAIN_CSV}"
        )

    if not VAL_CSV.exists():
        raise FileNotFoundError(
            f"Validation CSV not found:\n{VAL_CSV}"
        )

    if not TRAIN_IMAGES_DIR.exists():
        raise FileNotFoundError(
            f"Image directory not found:\n"
            f"{TRAIN_IMAGES_DIR}"
        )

    # --------------------------------------------------------
    # Transforms
    # --------------------------------------------------------

    train_transform = (
        get_train_transform()
    )

    val_transform = (
        get_val_transform()
    )

    # --------------------------------------------------------
    # Datasets
    # --------------------------------------------------------

    print("\nLoading datasets...")

    train_dataset = RetinalDataset(
        TRAIN_CSV,
        transform=train_transform
    )

    val_dataset = RetinalDataset(
        VAL_CSV,
        transform=val_transform
    )

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

    class_weights = (
        calculate_class_weights(
            TRAIN_CSV
        )
    )

    class_weights = (
        class_weights.to(device)
    )

    print(
        "\nClass weights tensor:"
    )

    print(class_weights)

    # --------------------------------------------------------
    # Weighted sampler
    # --------------------------------------------------------

    sampler = create_weighted_sampler(
        TRAIN_CSV
    )

    # --------------------------------------------------------
    # Data loaders
    # --------------------------------------------------------

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        sampler=sampler,
        num_workers=NUM_WORKERS,
        pin_memory=(
            device.type == "cuda"
        ),
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=(
            device.type == "cuda"
        ),
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = build_model()

    model = model.to(device)

    print_parameter_counts(model)

    # --------------------------------------------------------
    # Loss
    # --------------------------------------------------------

    criterion = nn.CrossEntropyLoss(
        weight=class_weights,
        label_smoothing=0.05
    )

    # --------------------------------------------------------
    # Optimizer
    # --------------------------------------------------------

    optimizer = AdamW(
        filter(
            lambda p: p.requires_grad,
            model.parameters()
        ),
        lr=LEARNING_RATE,
        weight_decay=WEIGHT_DECAY
    )

    # --------------------------------------------------------
    # Scheduler
    # --------------------------------------------------------

    scheduler = ReduceLROnPlateau(
        optimizer,
        mode="max",
        factor=0.5,
        patience=2
    )

    # --------------------------------------------------------
    # AMP
    # --------------------------------------------------------

    scaler = torch.cuda.amp.GradScaler(
        enabled=device.type == "cuda"
    )

    # --------------------------------------------------------
    # Resume
    # --------------------------------------------------------

    start_epoch = 0
    best_val_accuracy = 0.0

    if V3_CHECKPOINT_PATH.exists():

        print(
            "\nExisting V3 checkpoint found."
        )

        print(
            "Resuming previous V3 training..."
        )

        checkpoint = torch.load(
            V3_CHECKPOINT_PATH,
            map_location=device
        )

        model.load_state_dict(
            checkpoint["model_state_dict"]
        )

        optimizer.load_state_dict(
            checkpoint["optimizer_state_dict"]
        )

        scheduler.load_state_dict(
            checkpoint["scheduler_state_dict"]
        )

        start_epoch = (
            checkpoint["epoch"] + 1
        )

        best_val_accuracy = (
            checkpoint[
                "best_val_accuracy"
            ]
        )

        print(
            f"Resuming from epoch "
            f"{start_epoch}"
        )

    # --------------------------------------------------------
    # Training
    # --------------------------------------------------------

    print("\nStarting V3 training...")

    patience_counter = 0

    for epoch in range(
        start_epoch,
        NUM_EPOCHS
    ):

        print("\n" + "-" * 60)

        print(
            f"Epoch {epoch + 1}/"
            f"{NUM_EPOCHS}"
        )

        train_loss, train_accuracy = (
            train_one_epoch(
                model,
                train_loader,
                criterion,
                optimizer,
                device,
                scaler
            )
        )

        val_loss, val_accuracy = (
            validate(
                model,
                val_loader,
                criterion,
                device
            )
        )

        scheduler.step(
            val_accuracy
        )

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
        # Best model
        # ----------------------------------------------------

        if val_accuracy > best_val_accuracy:

            best_val_accuracy = (
                val_accuracy
            )

            patience_counter = 0

            torch.save(
                model.state_dict(),
                V3_MODEL_PATH
            )

            print(
                "\n✓ New best V3 model saved."
            )

        else:

            patience_counter += 1

            print(
                f"\nNo improvement."
                f" Patience: "
                f"{patience_counter}/"
                f"{PATIENCE}"
            )

        # ----------------------------------------------------
        # Checkpoint
        # ----------------------------------------------------

        save_checkpoint(
            model,
            optimizer,
            scheduler,
            epoch,
            best_val_accuracy
        )

        print(
            "✓ Training checkpoint saved."
        )

        # ----------------------------------------------------
        # Early stopping
        # ----------------------------------------------------

        if patience_counter >= PATIENCE:

            print(
                "\nEarly stopping triggered."
            )

            break

    # --------------------------------------------------------
    # Complete
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("V3 TRAINING COMPLETED")
    print("=" * 60)

    print(
        f"\nBest validation accuracy: "
        f"{best_val_accuracy:.4f}"
    )

    print(
        f"\nBest V3 model:"
        f"\n{V3_MODEL_PATH}"
    )

    print(
        f"\nV3 checkpoint:"
        f"\n{V3_CHECKPOINT_PATH}"
    )


# ============================================================
# Entry Point
# ============================================================

if __name__ == "__main__":
    main()