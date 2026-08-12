from pathlib import Path

# ==========================
# Base Paths
# ==========================

# .../MAJOR PROJECT VEDANT
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# .../MAJOR PROJECT VEDANT/ml
ML_ROOT = Path(__file__).resolve().parents[1]

# Data
DATA_DIR = PROJECT_ROOT / "data"
TRAIN_IMAGES_DIR = DATA_DIR / "processed" / "train_images"
LABELS_FILE = DATA_DIR / "combined_labels.csv"

# ML folders
MODELS_DIR = ML_ROOT / "models"
MODELS_DIR.mkdir(exist_ok=True)

OUTPUTS_DIR = ML_ROOT / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)

# Training Parameters
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
NUM_CLASSES = 5
LEARNING_RATE = 1e-4
EPOCHS = 5
RANDOM_SEED = 42