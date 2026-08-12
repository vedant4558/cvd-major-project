import random
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn

from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader

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
# V4 CONFIGURATION
# ============================================================

TRAIN_CSV = PROJECT_ROOT / "data" / "splits" / "train.csv"
VAL_CSV = PROJECT_ROOT / "data" / "splits" / "val.csv"

BASELINE_MODEL = (
    MODELS_DIR / "finetuned_best_model.pth"
)

V4_MODEL_PATH = (
    MODELS_DIR / "v4_best_model.pth"
)

V4_CHECKPOINT_PATH = (
    MODELS_DIR / "v4_checkpoint.pth"
)

NUM_EPOCHS = 15

LEARNING_RATE = 1e-5

WEIGHT_DECAY = 1e-4

PATIENCE = 5

GRADIENT_CLIP = 1.0

NUM_WORKERS = 0

DROPOUT = 0.30

LABEL_SMOOTHING = 0.03

SEED = 42


IMAGENET_MEAN = [
    0.485,
    0.456,
    0.406
]

IMAGENET_STD = [
    0.229,
    0.224,
    0.225
]


# ============================================================
# REPRODUCIBILITY
# ============================================================

def set_seed(seed=SEED):

    random.seed(seed)

    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():

        torch.cuda.manual_seed_all(seed)


# ============================================================
# DEVICE
# ============================================================

def get_device():

    if torch.cuda.is_available():

        return torch.device("cuda")

    return torch.device("cpu")


# ============================================================
# TRAIN TRANSFORMS
# ============================================================

def get_train_transform():

    return transforms.Compose([

        transforms.RandomHorizontalFlip(
            p=0.5
        ),

        transforms.RandomRotation(
            degrees=8
        ),

        transforms.RandomAffine(
            degrees=0,
            translate=(0.03, 0.03),
            scale=(0.97, 1.03)
        ),

        transforms.ColorJitter(
            brightness=0.10,
            contrast=0.10,
            saturation=0.05,
            hue=0.01
        ),

        transforms.ToTensor(),

        transforms.Normalize(
            IMAGENET_MEAN,
            IMAGENET_STD
        )
    ])


# ============================================================
# VALIDATION TRANSFORMS
# ============================================================

def get_val_transform():

    return transforms.Compose([

        transforms.ToTensor(),

        transforms.Normalize(
            IMAGENET_MEAN,
            IMAGENET_STD
        )
    ])


# ============================================================
# CLASS WEIGHTS
# ============================================================

def calculate_class_weights(csv_file):

    df = pd.read_csv(csv_file)

    class_counts = (
        df["diagnosis"]
        .value_counts()
        .sort_index()
    )

    total = len(df)

    weights = (
        total /
        (NUM_CLASSES * class_counts)
    )

    weights = weights.reindex(
        range(NUM_CLASSES)
    )

    print("\nTraining class distribution:")

    print(class_counts)

    print("\nClass weights:")

    print(weights)

    return torch.tensor(
        weights.values,
        dtype=torch.float32
    )


# ============================================================
# BUILD MODEL
# ============================================================

def build_model(device):

    print(
        "\nLoading EfficientNet-B0..."
    )

    weights = (
        models.EfficientNet_B0_Weights.DEFAULT
    )

    model = models.efficientnet_b0(
        weights=weights
    )

    # --------------------------------------------------------
    # Freeze everything initially
    # --------------------------------------------------------

    for parameter in model.parameters():

        parameter.requires_grad = False

    # --------------------------------------------------------
    # Unfreeze final EfficientNet blocks
    # --------------------------------------------------------

    for parameter in model.features[-2].parameters():

        parameter.requires_grad = True

    for parameter in model.features[-1].parameters():

        parameter.requires_grad = True

    # --------------------------------------------------------
    # Replace classifier
    # --------------------------------------------------------

    in_features = (
        model.classifier[1].in_features
    )

    model.classifier = nn.Sequential(

        nn.Dropout(
            p=DROPOUT
        ),

        nn.Linear(
            in_features,
            NUM_CLASSES
        )
    )

    # --------------------------------------------------------
    # Load successful V2 model
    # --------------------------------------------------------

    if not BASELINE_MODEL.exists():

        raise FileNotFoundError(
            "\nV2 baseline model not found:\n"
            f"{BASELINE_MODEL}\n\n"
            "Make sure your existing "
            "finetuned_best_model.pth "
            "is present before running V4."
        )

    print(
        "\nLoading V2 baseline model:"
    )

    print(BASELINE_MODEL)

    checkpoint = torch.load(
        BASELINE_MODEL,
        map_location=device
    )

    # --------------------------------------------------------
    # Support either state_dict or checkpoint format
    # --------------------------------------------------------

    if isinstance(checkpoint, dict):

        if (
            "model_state_dict"
            in checkpoint
        ):

            state_dict = (
                checkpoint[
                    "model_state_dict"
                ]
            )

        else:

            state_dict = checkpoint

    else:

        state_dict = checkpoint

    model.load_state_dict(
        state_dict,
        strict=True
    )

    print(
        "V2 model loaded successfully."
    )

    model = model.to(device)

    return model


# ============================================================
# PARAMETER COUNTS
# ============================================================

def print_parameter_counts(model):

    total_parameters = sum(

        parameter.numel()

        for parameter
        in model.parameters()
    )

    trainable_parameters = sum(

        parameter.numel()

        for parameter
        in model.parameters()

        if parameter.requires_grad
    )

    print(
        "\nTotal parameters: "
        f"{total_parameters:,}"
    )

    print(
        "Trainable parameters: "
        f"{trainable_parameters:,}"
    )


# ============================================================
# TRAIN ONE EPOCH
# ============================================================

def train_one_epoch(
    model,
    loader,
    criterion,
    optimizer,
    device,
    scaler
):

    model.train()

    running_loss = 0.0

    correct = 0

    total = 0

    use_amp = (
        device.type == "cuda"
    )

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

            scaler.scale(
                loss
            ).backward()

            scaler.unscale_(
                optimizer
            )

            torch.nn.utils.clip_grad_norm_(
                model.parameters(),
                GRADIENT_CLIP
            )

            scaler.step(
                optimizer
            )

            scaler.update()

        else:

            loss.backward()

            torch.nn.utils.clip_grad_norm_(
                model.parameters(),
                GRADIENT_CLIP
            )

            optimizer.step()

        running_loss += (
            loss.item()
            * images.size(0)
        )

        predictions = (
            outputs.argmax(
                dim=1
            )
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    loss_value = (
        running_loss / total
    )

    accuracy = (
        correct / total
    )

    return loss_value, accuracy


# ============================================================
# VALIDATION
# ============================================================

@torch.no_grad()
def validate(
    model,
    loader,
    criterion,
    device
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
            loss.item()
            * images.size(0)
        )

        predictions = (
            outputs.argmax(
                dim=1
            )
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    loss_value = (
        running_loss / total
    )

    accuracy = (
        correct / total
    )

    return loss_value, accuracy


# ============================================================
# CHECKPOINT
# ============================================================

def save_checkpoint(
    model,
    optimizer,
    scheduler,
    epoch,
    best_val_accuracy
):

    checkpoint = {

        "epoch": epoch,

        "model_state_dict":
            model.state_dict(),

        "optimizer_state_dict":
            optimizer.state_dict(),

        "scheduler_state_dict":
            scheduler.state_dict(),

        "best_val_accuracy":
            best_val_accuracy
    }

    torch.save(
        checkpoint,
        V4_CHECKPOINT_PATH
    )


# ============================================================
# MAIN
# ============================================================

def main():

    set_seed()

    print("=" * 60)

    print(
        "EFFICIENTNET-B0 V4 TRAINING"
    )

    print("=" * 60)

    device = get_device()

    print(
        f"\nDevice: {device}"
    )

    # --------------------------------------------------------
    # Check files
    # --------------------------------------------------------

    print(
        "\nChecking dataset files..."
    )

    if not TRAIN_CSV.exists():

        raise FileNotFoundError(
            f"Training CSV not found:\n"
            f"{TRAIN_CSV}"
        )

    if not VAL_CSV.exists():

        raise FileNotFoundError(
            f"Validation CSV not found:\n"
            f"{VAL_CSV}"
        )

    if not TRAIN_IMAGES_DIR.exists():

        raise FileNotFoundError(
            f"Image directory not found:\n"
            f"{TRAIN_IMAGES_DIR}"
        )

    print(
        "Dataset files found successfully."
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

    print(
        "\nLoading datasets..."
    )

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
    # DataLoaders
    # --------------------------------------------------------

    train_loader = DataLoader(

        train_dataset,

        batch_size=BATCH_SIZE,

        shuffle=True,

        num_workers=NUM_WORKERS,

        pin_memory=(
            device.type == "cuda"
        )
    )

    val_loader = DataLoader(

        val_dataset,

        batch_size=BATCH_SIZE,

        shuffle=False,

        num_workers=NUM_WORKERS,

        pin_memory=(
            device.type == "cuda"
        )
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

    print(
        class_weights
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = build_model(
        device
    )

    print_parameter_counts(
        model
    )

    # --------------------------------------------------------
    # Loss
    # --------------------------------------------------------

    criterion = nn.CrossEntropyLoss(

        weight=class_weights,

        label_smoothing=LABEL_SMOOTHING
    )

    # --------------------------------------------------------
    # Optimizer
    # --------------------------------------------------------

    optimizer = AdamW(

        filter(
            lambda parameter:
                parameter.requires_grad,

            model.parameters()
        ),

        lr=LEARNING_RATE,

        weight_decay=WEIGHT_DECAY
    )

    # --------------------------------------------------------
    # Scheduler
    # --------------------------------------------------------

    scheduler = CosineAnnealingLR(

        optimizer,

        T_max=NUM_EPOCHS,

        eta_min=1e-6
    )

    # --------------------------------------------------------
    # AMP
    # --------------------------------------------------------

    scaler = torch.amp.GradScaler(
        "cuda",
        enabled=(
            device.type == "cuda"
        )
    )

    # --------------------------------------------------------
    # Resume V4
    # --------------------------------------------------------

    start_epoch = 0

    best_val_accuracy = 0.0

    if V4_CHECKPOINT_PATH.exists():

        print(
            "\nExisting V4 checkpoint found."
        )

        print(
            "Resume training?"
        )

        print(
            "Delete the checkpoint "
            "if you want a fresh V4 run."
        )

        checkpoint = torch.load(

            V4_CHECKPOINT_PATH,

            map_location=device,

            weights_only=False
        )

        model.load_state_dict(
            checkpoint[
                "model_state_dict"
            ]
        )

        optimizer.load_state_dict(
            checkpoint[
                "optimizer_state_dict"
            ]
        )

        scheduler.load_state_dict(
            checkpoint[
                "scheduler_state_dict"
            ]
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
            f"{start_epoch + 1}"
        )

    # --------------------------------------------------------
    # Training
    # --------------------------------------------------------

    print(
        "\nStarting V4 training..."
    )

    patience_counter = 0

    for epoch in range(
        start_epoch,
        NUM_EPOCHS
    ):

        print(
            "\n" + "-" * 60
        )

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

        scheduler.step()

        current_lr = (
            optimizer.param_groups[
                0
            ]["lr"]
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

                V4_MODEL_PATH
            )

            print(
                "\n✓ New best V4 model saved."
            )

        else:

            patience_counter += 1

            print(
                "\nNo improvement. "
                f"Patience: "
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
            "✓ V4 checkpoint saved."
        )

        # ----------------------------------------------------
        # Early stopping
        # ----------------------------------------------------

        if (
            patience_counter
            >= PATIENCE
        ):

            print(
                "\nEarly stopping triggered."
            )

            break

    # --------------------------------------------------------
    # Final
    # --------------------------------------------------------

    print(
        "\n" + "=" * 60
    )

    print(
        "V4 TRAINING COMPLETED"
    )

    print(
        "=" * 60
    )

    print(
        f"\nBest validation accuracy: "
        f"{best_val_accuracy:.4f}"
    )

    print(
        "\nBest V4 model:"
    )

    print(
        V4_MODEL_PATH
    )

    print(
        "\nV4 checkpoint:"
    )

    print(
        V4_CHECKPOINT_PATH
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()