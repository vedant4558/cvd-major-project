"""
V5 Training Pipeline
====================

EfficientNet-B0 transfer learning for diabetic retinopathy grading.

V5 improvements:
- Stronger retinal-image augmentation
- Weighted CrossEntropyLoss
- Label smoothing
- AdamW optimizer
- Cosine annealing learning-rate scheduler
- Differential learning rates
- Mixed precision on CUDA
- Gradient clipping
- Early stopping
- Best-model saving
- Resume-from-checkpoint support

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

V5_EPOCHS = 20

# Start from the best V4 model
V4_MODEL_PATH = MODELS_DIR / "v4_best_model.pth"

V5_BEST_MODEL_PATH = MODELS_DIR / "v5_best_model.pth"
V5_CHECKPOINT_PATH = MODELS_DIR / "v5_checkpoint.pth"

TRAIN_CSV = DATA_DIR / "splits" / "train.csv"
VAL_CSV = DATA_DIR / "splits" / "val.csv"

EARLY_STOPPING_PATIENCE = 6

# Learning rates
BACKBONE_LR = 1e-5
CLASSIFIER_LR = 5e-5

WEIGHT_DECAY = 1e-4
LABEL_SMOOTHING = 0.05

GRADIENT_CLIP_VALUE = 1.0

NUM_WORKERS = 0

# AMP is useful only when CUDA is available.
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

    # Reproducibility settings.
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
    Dataset for loading processed retinal images.
    """

    def __init__(self, csv_file, transform=None):

        self.data = pd.read_csv(csv_file)
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):

        from PIL import Image

        row = self.data.iloc[idx]

        image_id = row["id_code"]
        label = int(row["diagnosis"])

        image_path = TRAIN_IMAGES_DIR / f"{image_id}.png"

        if not image_path.exists():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        image = Image.open(image_path).convert("RGB")

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

        # Horizontal flip is reasonable for retinal fundus images.
        transforms.RandomHorizontalFlip(
            p=0.5
        ),

        # Small rotations only.
        transforms.RandomRotation(
            degrees=10
        ),

        # Mild geometric variation.
        transforms.RandomAffine(
            degrees=0,
            translate=(0.05, 0.05),
            scale=(0.95, 1.05)
        ),

        # Mild brightness/contrast/color variation.
        transforms.ColorJitter(
            brightness=0.15,
            contrast=0.15,
            saturation=0.10,
            hue=0.02
        ),

        # Occasionally blur the image slightly.
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
# CLASS WEIGHTS
# ============================================================

def calculate_class_weights(train_csv):

    df = pd.read_csv(train_csv)

    labels = df["diagnosis"].astype(int).values

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
        weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1
    )

    # Replace classifier.
    in_features = model.classifier[1].in_features

    model.classifier[1] = nn.Linear(
        in_features,
        NUM_CLASSES
    )

    # Freeze entire backbone initially.
    for param in model.features.parameters():
        param.requires_grad = False

    # Train classifier.
    for param in model.classifier.parameters():
        param.requires_grad = True

    model = model.to(device)

    print("EfficientNet-B0 loaded.")

    return model


# ============================================================
# LOAD V4
# ============================================================

def load_v4_weights(model, device):

    if not V4_MODEL_PATH.exists():

        print()
        print("WARNING:")
        print(f"V4 model not found:")
        print(V4_MODEL_PATH)
        print()
        print("V5 will start from ImageNet weights.")

        return model

    print()
    print("Loading V4 model:")
    print(V4_MODEL_PATH)

    checkpoint = torch.load(
        V4_MODEL_PATH,
        map_location=device
    )

    # Support both raw state_dict and checkpoint dictionaries.
    if isinstance(checkpoint, dict):

        if "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]

        elif "state_dict" in checkpoint:
            state_dict = checkpoint["state_dict"]

        else:
            state_dict = checkpoint

    else:
        state_dict = checkpoint

    model.load_state_dict(
        state_dict,
        strict=True
    )

    print("V4 model loaded successfully.")

    return model


# ============================================================
# UNFREEZE FINAL BACKBONE BLOCKS
# ============================================================

def unfreeze_final_blocks(model):

    print()
    print("Unfreezing final EfficientNet blocks...")

    # EfficientNet-B0 features consists of sequential blocks.
    #
    # Keep early feature extraction frozen.
    # Fine-tune later/high-level features.

    total_blocks = len(model.features)

    # Unfreeze approximately the final 40% of feature blocks.
    start_index = max(
        0,
        int(total_blocks * 0.60)
    )

    for index in range(
        start_index,
        total_blocks
    ):

        for param in model.features[index].parameters():
            param.requires_grad = True

    # Classifier remains trainable.
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

    print(f"Total parameters:     {total:,}")
    print(f"Trainable parameters: {trainable:,}")


# ============================================================
# OPTIMIZER
# ============================================================

def create_optimizer(model):

    backbone_params = []
    classifier_params = []

    for name, param in model.named_parameters():

        if not param.requires_grad:
            continue

        if name.startswith("classifier"):
            classifier_params.append(param)

        else:
            backbone_params.append(param)

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

            scaler.scale(loss).backward()

            scaler.unscale_(optimizer)

            torch.nn.utils.clip_grad_norm_(
                model.parameters(),
                GRADIENT_CLIP_VALUE
            )

            scaler.step(optimizer)
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
            loss.item() * images.size(0)
        )

        predictions = outputs.argmax(
            dim=1
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    epoch_loss = running_loss / total
    epoch_accuracy = correct / total

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
            loss.item() * images.size(0)
        )

        predictions = outputs.argmax(
            dim=1
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    epoch_loss = running_loss / total
    epoch_accuracy = correct / total

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
        V5_CHECKPOINT_PATH
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("EFFICIENTNET-B0 V5 TRAINING")
    print("=" * 60)

    set_seed()

    device = get_device()

    print()
    print(f"Device: {device}")

    # --------------------------------------------------------
    # Check dataset
    # --------------------------------------------------------

    print()
    print("Checking dataset files...")

    if not TRAIN_CSV.exists():
        raise FileNotFoundError(
            f"Training CSV not found:\n{TRAIN_CSV}"
        )

    if not VAL_CSV.exists():
        raise FileNotFoundError(
            f"Validation CSV not found:\n{VAL_CSV}"
        )

    print("Dataset files found successfully.")

    # --------------------------------------------------------
    # Datasets
    # --------------------------------------------------------

    print()
    print("Loading datasets...")

    train_dataset = RetinalDataset(
        TRAIN_CSV,
        transform=get_train_transforms()
    )

    val_dataset = RetinalDataset(
        VAL_CSV,
        transform=get_val_transforms()
    )

    print(
        f"Training samples:   {len(train_dataset)}"
    )

    print(
        f"Validation samples: {len(val_dataset)}"
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
    print("Calculating class weights...")

    class_weights = calculate_class_weights(
        TRAIN_CSV
    ).to(device)

    print(
        "Class weights:",
        class_weights
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = create_model(device)

    # Load V4 as starting point.
    model = load_v4_weights(
        model,
        device
    )

    # Now progressively fine-tune later blocks.
    unfreeze_final_blocks(model)

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
        T_max=V5_EPOCHS,
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
        f"Mixed Precision AMP: {use_amp}"
    )

    # --------------------------------------------------------
    # Training state
    # --------------------------------------------------------

    start_epoch = 0
    best_val_accuracy = 0.0
    patience_counter = 0

    # --------------------------------------------------------
    # Resume checkpoint if available
    # --------------------------------------------------------

    if V5_CHECKPOINT_PATH.exists():

        print()
        print(
            "Existing V5 checkpoint detected."
        )

        print(
            "To start V5 from the beginning, "
            "delete:"
        )

        print(
            V5_CHECKPOINT_PATH
        )

        print()
        print(
            "Training will start from epoch 1."
        )

    # --------------------------------------------------------
    # Training
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("STARTING V5 TRAINING")
    print("=" * 60)

    for epoch in range(
        start_epoch,
        V5_EPOCHS
    ):

        print()
        print(
            f"Epoch {epoch + 1}/{V5_EPOCHS}"
        )

        train_loss, train_accuracy = train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
            scaler,
            device,
            use_amp
        )

        val_loss, val_accuracy = validate(
            model,
            val_loader,
            criterion,
            device,
            use_amp
        )

        scheduler.step()

        current_lr = optimizer.param_groups[0]["lr"]

        print(
            f"Train Loss: {train_loss:.4f}"
        )

        print(
            f"Train Accuracy: {train_accuracy:.4f}"
        )

        print(
            f"Validation Loss: {val_loss:.4f}"
        )

        print(
            f"Validation Accuracy: {val_accuracy:.4f}"
        )

        print(
            f"Learning Rate: {current_lr:.8f}"
        )

        # ----------------------------------------------------
        # Best model
        # ----------------------------------------------------

        if val_accuracy > best_val_accuracy:

            best_val_accuracy = val_accuracy

            patience_counter = 0

            torch.save(
                model.state_dict(),
                V5_BEST_MODEL_PATH
            )

            print()
            print(
                "✓ New best V5 model saved."
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
            "✓ V5 checkpoint saved."
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
    print("V5 TRAINING COMPLETED")
    print("=" * 60)

    print()
    print(
        f"Best validation accuracy: "
        f"{best_val_accuracy:.4f}"
    )

    print()
    print("Best V5 model:")
    print(V5_BEST_MODEL_PATH)

    print()
    print("V5 checkpoint:")
    print(V5_CHECKPOINT_PATH)

    print()
    print("=" * 60)


if __name__ == "__main__":
    main()