"""
V6 Training Pipeline
====================

EfficientNet-B0 transfer learning for diabetic retinopathy grading.

V6 changes from V5:
- Uses combined train_v6.csv
- Adds selected EyePACS training images
- APTOS + DDR images remain supported
- EyePACS JPEG images are loaded from eyepacs_selected
- Starts from the V5 best model
- Saves V6 model/checkpoint separately
- Validation set remains unchanged
- Test set remains unchanged

Classes:
0 = No DR
1 = Mild
2 = Moderate
3 = Severe
4 = Proliferative
"""

from pathlib import Path
import random
import numpy as np
import pandas as pd

import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader
from torchvision import models, transforms

from sklearn.utils.class_weight import compute_class_weight

from config import (
    DATA_DIR,
    TRAIN_IMAGES_DIR,
    MODELS_DIR,
    IMAGE_SIZE,
    BATCH_SIZE,
    NUM_CLASSES,
    RANDOM_SEED,
)


# ============================================================
# CONFIGURATION
# ============================================================

V6_EPOCHS = 20

# ------------------------------------------------------------
# V5 model used as starting point
# ------------------------------------------------------------

V5_MODEL_PATH = MODELS_DIR / "v5_best_model.pth"

# ------------------------------------------------------------
# V6 output files
# ------------------------------------------------------------

V6_BEST_MODEL_PATH = MODELS_DIR / "v6_best_model.pth"
V6_CHECKPOINT_PATH = MODELS_DIR / "v6_checkpoint.pth"

# ------------------------------------------------------------
# Dataset files
# ------------------------------------------------------------

TRAIN_CSV = DATA_DIR / "splits" / "train_v6.csv"
VAL_CSV = DATA_DIR / "splits" / "val.csv"

# ------------------------------------------------------------
# Image directories
# ------------------------------------------------------------

# Existing APTOS + DDR images
APTOS_DDR_IMAGES_DIR = TRAIN_IMAGES_DIR

# New selected EyePACS images
EYEPACS_IMAGES_DIR = (
    DATA_DIR
    / "processed"
    / "eyepacs_selected"
)

# ------------------------------------------------------------
# Training settings
# ------------------------------------------------------------

EARLY_STOPPING_PATIENCE = 6

BACKBONE_LR = 1e-5
CLASSIFIER_LR = 5e-5

WEIGHT_DECAY = 1e-4
LABEL_SMOOTHING = 0.05

GRADIENT_CLIP_VALUE = 1.0

NUM_WORKERS = 0

USE_AMP = True


# ============================================================
# REPRODUCIBILITY
# ============================================================

def set_seed(seed: int = RANDOM_SEED):
    """Set random seeds for reproducible training."""

    random.seed(seed)
    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


# ============================================================
# DEVICE
# ============================================================

def get_device():
    """Return CUDA device if available, otherwise CPU."""

    if torch.cuda.is_available():
        return torch.device("cuda")

    return torch.device("cpu")


# ============================================================
# DATASET
# ============================================================

class RetinalDataset(torch.utils.data.Dataset):
    """
    Dataset supporting:

    APTOS:
        data/processed/train_images/*.png

    DDR:
        data/processed/train_images/*.png

    EyePACS:
        data/processed/eyepacs_selected/*.jpg
    """

    def __init__(self, csv_file, transform=None):

        self.data = pd.read_csv(csv_file)
        self.transform = transform

        required_columns = {
            "id_code",
            "diagnosis",
            "source",
        }

        missing = required_columns - set(
            self.data.columns
        )

        if missing:
            raise ValueError(
                f"Missing required columns in "
                f"{csv_file}: {missing}"
            )

    def __len__(self):

        return len(self.data)

    def __getitem__(self, idx):

        from PIL import Image

        row = self.data.iloc[idx]

        image_id = str(row["id_code"])
        label = int(row["diagnosis"])
        source = str(row["source"]).lower()

        # ----------------------------------------------------
        # Select correct image directory and extension
        # ----------------------------------------------------

        if source == "eyepacs":

            image_path = (
                EYEPACS_IMAGES_DIR
                / f"{image_id}.jpg"
            )

        else:

            # APTOS + DDR
            image_path = (
                APTOS_DDR_IMAGES_DIR
                / f"{image_id}.png"
            )

        # ----------------------------------------------------
        # Check image exists
        # ----------------------------------------------------

        if not image_path.exists():

            raise FileNotFoundError(
                f"Image not found:\n"
                f"{image_path}\n\n"
                f"ID: {image_id}\n"
                f"Source: {source}\n"
                f"Label: {label}"
            )

        # ----------------------------------------------------
        # Load image
        # ----------------------------------------------------

        image = Image.open(
            image_path
        ).convert("RGB")

        # ----------------------------------------------------
        # Apply transform
        # ----------------------------------------------------

        if self.transform:

            image = self.transform(image)

        return image, label


# ============================================================
# TRANSFORMS
# ============================================================

def get_train_transforms():

    image_height, image_width = IMAGE_SIZE

    return transforms.Compose([

        transforms.Resize(
            (image_height, image_width)
        ),

        transforms.RandomHorizontalFlip(
            p=0.5
        ),

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

        transforms.RandomApply(
            [
                transforms.GaussianBlur(
                    kernel_size=3,
                    sigma=(0.1, 1.0)
                )
            ],
            p=0.10
        ),

        transforms.ToTensor(),

        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])


def get_val_transforms():

    image_height, image_width = IMAGE_SIZE

    return transforms.Compose([

        transforms.Resize(
            (image_height, image_width)
        ),

        transforms.ToTensor(),

        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])


# ============================================================
# DATASET SANITY CHECK
# ============================================================

def check_dataset(csv_file):

    print()
    print("Checking dataset paths...")

    df = pd.read_csv(csv_file)

    print(
        f"Total records: {len(df)}"
    )

    print()
    print("Source distribution:")

    print(
        df["source"]
        .value_counts()
        .sort_index()
    )

    print()
    print("Diagnosis distribution:")

    print(
        df["diagnosis"]
        .value_counts()
        .sort_index()
    )

    print()
    print("Checking image files...")

    missing = []

    # Check every record.
    for _, row in df.iterrows():

        image_id = str(row["id_code"])
        source = str(row["source"]).lower()

        if source == "eyepacs":

            path = (
                EYEPACS_IMAGES_DIR
                / f"{image_id}.jpg"
            )

        else:

            path = (
                APTOS_DDR_IMAGES_DIR
                / f"{image_id}.png"
            )

        if not path.exists():

            missing.append(
                str(path)
            )

    if missing:

        print()
        print(
            f"ERROR: {len(missing)} "
            f"missing image files."
        )

        print()
        print("First missing files:")

        for path in missing[:10]:

            print(path)

        raise FileNotFoundError(
            "Dataset sanity check failed."
        )

    print(
        f"✓ All {len(df)} training images found."
    )


# ============================================================
# CLASS WEIGHTS
# ============================================================

def calculate_class_weights(train_csv):

    df = pd.read_csv(train_csv)

    labels = (
        df["diagnosis"]
        .astype(int)
        .values
    )

    classes = np.arange(NUM_CLASSES)

    weights = compute_class_weight(
        class_weight="balanced",
        classes=classes,
        y=labels
    )

    return torch.tensor(
        weights,
        dtype=torch.float32
    )


# ============================================================
# MODEL
# ============================================================

def create_model(device):

    print()
    print("Loading pretrained EfficientNet-B0...")

    model = models.efficientnet_b0(
        weights=(
            models.EfficientNet_B0_Weights
            .IMAGENET1K_V1
        )
    )

    in_features = (
        model.classifier[1].in_features
    )

    model.classifier[1] = nn.Linear(
        in_features,
        NUM_CLASSES
    )

    # Freeze backbone initially.
    for param in model.features.parameters():

        param.requires_grad = False

    # Classifier trainable.
    for param in model.classifier.parameters():

        param.requires_grad = True

    model = model.to(device)

    print(
        "EfficientNet-B0 loaded."
    )

    return model


# ============================================================
# LOAD V5 WEIGHTS
# ============================================================

def load_v5_weights(model, device):

    if not V5_MODEL_PATH.exists():

        raise FileNotFoundError(
            f"\nV5 model not found:\n"
            f"{V5_MODEL_PATH}\n\n"
            f"V6 requires the V5 best model."
        )

    print()
    print("Loading V5 model:")
    print(V5_MODEL_PATH)

    checkpoint = torch.load(
        V5_MODEL_PATH,
        map_location=device
    )

    if isinstance(checkpoint, dict):

        if "model_state_dict" in checkpoint:

            state_dict = (
                checkpoint[
                    "model_state_dict"
                ]
            )

        elif "state_dict" in checkpoint:

            state_dict = (
                checkpoint["state_dict"]
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
        "V5 model loaded successfully."
    )

    return model


# ============================================================
# UNFREEZE FINAL BACKBONE BLOCKS
# ============================================================

def unfreeze_final_blocks(model):

    print()
    print(
        "Unfreezing final EfficientNet blocks..."
    )

    total_blocks = len(
        model.features
    )

    start_index = max(
        0,
        int(total_blocks * 0.60)
    )

    for index in range(
        start_index,
        total_blocks
    ):

        for param in (
            model.features[index]
            .parameters()
        ):

            param.requires_grad = True

    for param in model.classifier.parameters():

        param.requires_grad = True

    trainable = sum(
        p.numel()
        for p in model.parameters()
        if p.requires_grad
    )

    total = sum(
        p.numel()
        for p in model.parameters()
    )

    print(
        f"Total parameters:     {total:,}"
    )

    print(
        f"Trainable parameters: "
        f"{trainable:,}"
    )


# ============================================================
# OPTIMIZER
# ============================================================

def create_optimizer(model):

    backbone_params = []
    classifier_params = []

    for name, param in (
        model.named_parameters()
    ):

        if not param.requires_grad:

            continue

        if name.startswith(
            "classifier"
        ):

            classifier_params.append(
                param
            )

        else:

            backbone_params.append(
                param
            )

    optimizer = AdamW(
        [
            {
                "params": backbone_params,
                "lr": BACKBONE_LR
            },
            {
                "params": classifier_params,
                "lr": CLASSIFIER_LR
            },
        ],
        weight_decay=WEIGHT_DECAY
    )

    return optimizer


# ============================================================
# TRAINING
# ============================================================

def train_one_epoch(
    model,
    loader,
    criterion,
    optimizer,
    scaler,
    device,
    use_amp
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

        if use_amp:

            with torch.autocast(
                device_type="cuda",
                dtype=torch.float16
            ):

                outputs = model(images)

                loss = criterion(
                    outputs,
                    labels
                )

            scaler.scale(
                loss
            ).backward()

            scaler.unscale_(
                optimizer
            )

            torch.nn.utils.clip_grad_norm_(
                model.parameters(),
                GRADIENT_CLIP_VALUE
            )

            scaler.step(
                optimizer
            )

            scaler.update()

        else:

            outputs = model(images)

            loss = criterion(
                outputs,
                labels
            )

            loss.backward()

            torch.nn.utils.clip_grad_norm_(
                model.parameters(),
                GRADIENT_CLIP_VALUE
            )

            optimizer.step()

        running_loss += (
            loss.item()
            * images.size(0)
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
# VALIDATION
# ============================================================

@torch.no_grad()
def validate(
    model,
    loader,
    criterion,
    device,
    use_amp
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

        if use_amp:

            with torch.autocast(
                device_type="cuda",
                dtype=torch.float16
            ):

                outputs = model(images)

                loss = criterion(
                    outputs,
                    labels
                )

        else:

            outputs = model(images)

            loss = criterion(
                outputs,
                labels
            )

        running_loss += (
            loss.item()
            * images.size(0)
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
# CHECKPOINT
# ============================================================

def save_checkpoint(
    model,
    optimizer,
    scheduler,
    scaler,
    epoch,
    best_val_accuracy,
    patience
):

    checkpoint = {

        "epoch": epoch,

        "model_state_dict":
            model.state_dict(),

        "optimizer_state_dict":
            optimizer.state_dict(),

        "scheduler_state_dict":
            scheduler.state_dict(),

        "scaler_state_dict":
            scaler.state_dict(),

        "best_val_accuracy":
            best_val_accuracy,

        "patience":
            patience,
    }

    torch.save(
        checkpoint,
        V6_CHECKPOINT_PATH
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("EFFICIENTNET-B0 V6 TRAINING")
    print("=" * 60)

    set_seed()

    device = get_device()

    print()
    print(
        f"Device: {device}"
    )

    # --------------------------------------------------------
    # Check dataset files
    # --------------------------------------------------------

    print()
    print(
        "Checking dataset files..."
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

    if not APTOS_DDR_IMAGES_DIR.exists():

        raise FileNotFoundError(
            f"APTOS/DDR image directory "
            f"not found:\n"
            f"{APTOS_DDR_IMAGES_DIR}"
        )

    if not EYEPACS_IMAGES_DIR.exists():

        raise FileNotFoundError(
            f"EyePACS directory not found:\n"
            f"{EYEPACS_IMAGES_DIR}"
        )

    print(
        "Dataset files found successfully."
    )

    # --------------------------------------------------------
    # Sanity check training images
    # --------------------------------------------------------

    check_dataset(
        TRAIN_CSV
    )

    # --------------------------------------------------------
    # Datasets
    # --------------------------------------------------------

    print()
    print(
        "Loading datasets..."
    )

    train_dataset = RetinalDataset(
        TRAIN_CSV,
        transform=get_train_transforms()
    )

    val_dataset = RetinalDataset(
        VAL_CSV,
        transform=get_val_transforms()
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
    # Data loaders
    # --------------------------------------------------------

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS,
        pin_memory=torch.cuda.is_available()
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=torch.cuda.is_available()
    )

    # --------------------------------------------------------
    # Class weights
    # --------------------------------------------------------

    print()
    print(
        "Calculating class weights..."
    )

    class_weights = (
        calculate_class_weights(
            TRAIN_CSV
        ).to(device)
    )

    print(
        "Class weights:",
        class_weights
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = create_model(
        device
    )

    model = load_v5_weights(
        model,
        device
    )

    unfreeze_final_blocks(
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

    optimizer = create_optimizer(
        model
    )

    # --------------------------------------------------------
    # Scheduler
    # --------------------------------------------------------

    scheduler = CosineAnnealingLR(
        optimizer,
        T_max=V6_EPOCHS,
        eta_min=1e-7
    )

    # --------------------------------------------------------
    # AMP
    # --------------------------------------------------------

    use_amp = (
        USE_AMP
        and device.type == "cuda"
    )

    if use_amp:

        scaler = torch.amp.GradScaler(
            "cuda"
        )

    else:

        scaler = torch.amp.GradScaler(
            "cuda",
            enabled=False
        )

    print()
    print(
        f"Mixed Precision AMP: "
        f"{use_amp}"
    )

    # --------------------------------------------------------
    # Training state
    # --------------------------------------------------------

    start_epoch = 0

    best_val_accuracy = 0.0

    patience_counter = 0

    # --------------------------------------------------------
    # Do NOT automatically resume
    # --------------------------------------------------------

    if V6_CHECKPOINT_PATH.exists():

        print()
        print(
            "Existing V6 checkpoint detected:"
        )

        print(
            V6_CHECKPOINT_PATH
        )

        print()
        print(
            "This run will start from the "
            "V5 best model."
        )

        print(
            "The existing V6 checkpoint "
            "will NOT be resumed automatically."
        )

    # --------------------------------------------------------
    # Training
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print(
        "STARTING V6 TRAINING"
    )
    print("=" * 60)

    for epoch in range(
        start_epoch,
        V6_EPOCHS
    ):

        print()
        print(
            f"Epoch {epoch + 1}/"
            f"{V6_EPOCHS}"
        )

        train_loss, train_accuracy = (
            train_one_epoch(
                model,
                train_loader,
                criterion,
                optimizer,
                scaler,
                device,
                use_amp
            )
        )

        val_loss, val_accuracy = (
            validate(
                model,
                val_loader,
                criterion,
                device,
                use_amp
            )
        )

        scheduler.step()

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
            f"{current_lr:.8f}"
        )

        # ----------------------------------------------------
        # Best model
        # ----------------------------------------------------

        if (
            val_accuracy
            > best_val_accuracy
        ):

            best_val_accuracy = (
                val_accuracy
            )

            patience_counter = 0

            torch.save(
                model.state_dict(),
                V6_BEST_MODEL_PATH
            )

            print()
            print(
                "✓ New best V6 model saved."
            )

        else:

            patience_counter += 1

            print()
            print(
                f"No improvement. "
                f"Patience: "
                f"{patience_counter}/"
                f"{EARLY_STOPPING_PATIENCE}"
            )

        # ----------------------------------------------------
        # Checkpoint
        # ----------------------------------------------------

        save_checkpoint(
            model,
            optimizer,
            scheduler,
            scaler,
            epoch,
            best_val_accuracy,
            patience_counter
        )

        print(
            "✓ V6 checkpoint saved."
        )

        # ----------------------------------------------------
        # Early stopping
        # ----------------------------------------------------

        if (
            patience_counter
            >= EARLY_STOPPING_PATIENCE
        ):

            print()
            print(
                "Early stopping triggered."
            )

            break

    # --------------------------------------------------------
    # Final output
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print(
        "V6 TRAINING COMPLETED"
    )
    print("=" * 60)

    print()
    print(
        f"Best validation accuracy: "
        f"{best_val_accuracy:.4f}"
    )

    print()
    print(
        "Best V6 model:"
    )

    print(
        V6_BEST_MODEL_PATH
    )

    print()
    print(
        "V6 checkpoint:"
    )

    print(
        V6_CHECKPOINT_PATH
    )

    print()
    print("=" * 60)


if __name__ == "__main__":

    main()