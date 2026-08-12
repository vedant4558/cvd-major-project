import sys
from pathlib import Path

import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms

# ============================================================
# Project paths
# ============================================================

CURRENT_FILE = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE.parents[2]

MODELS_DIR = PROJECT_ROOT / "ml" / "models"

MODEL_PATH = MODELS_DIR / "v4_best_model.pth"

# ============================================================
# Configuration
# ============================================================

NUM_CLASSES = 5

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

GRADE_NAMES = {
    0: "No Diabetic Retinopathy",
    1: "Mild Diabetic Retinopathy",
    2: "Moderate Diabetic Retinopathy",
    3: "Severe Diabetic Retinopathy",
    4: "Proliferative Diabetic Retinopathy",
}

CVD_RISK = {
    0: "Low",
    1: "Low",
    2: "Moderate",
    3: "High",
    4: "High",
}

RECOMMENDATIONS = {
    0: "Low estimated risk based on the retinal DR proxy. Continue routine eye and health check-ups.",
    1: "Low estimated risk based on the retinal DR proxy. Regular monitoring is recommended.",
    2: "Moderate estimated risk based on the retinal DR proxy. Medical evaluation and cardiovascular risk-factor assessment are recommended.",
    3: "High estimated risk based on the retinal DR proxy. Prompt medical evaluation is recommended.",
    4: "High estimated risk based on the retinal DR proxy. Prompt ophthalmic and cardiovascular evaluation is recommended.",
}

# ============================================================
# Device
# ============================================================

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ============================================================
# Image transform
# ============================================================

inference_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=IMAGENET_MEAN,
        std=IMAGENET_STD
    ),
])


# ============================================================
# Build model
# ============================================================

def build_model():
    """
    Create EfficientNet-B0 with a 5-class classifier.
    """

    model = models.efficientnet_b0(weights=None)

    in_features = model.classifier[1].in_features

    model.classifier[1] = torch.nn.Linear(
        in_features,
        NUM_CLASSES
    )

    return model


# ============================================================
# Load model
# ============================================================

def load_model():
    """
    Load the trained V4 EfficientNet-B0 model.
    """

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found:\n{MODEL_PATH}"
        )

    model = build_model()

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )

    # Support both raw state_dict and checkpoint dictionaries
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    model.load_state_dict(state_dict)

    model.to(DEVICE)
    model.eval()

    return model


# ============================================================
# Preprocess image
# ============================================================

def preprocess_image(image_path):
    """
    Load and transform a retinal image.
    """

    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found:\n{image_path}"
        )

    image = Image.open(image_path).convert("RGB")

    tensor = inference_transform(image)

    tensor = tensor.unsqueeze(0)

    return tensor.to(DEVICE)


# ============================================================
# Prediction
# ============================================================

def predict(model, image_tensor):
    """
    Run model inference and return prediction information.
    """

    with torch.no_grad():

        outputs = model(image_tensor)

        probabilities = F.softmax(outputs, dim=1)

        confidence, predicted_class = torch.max(
            probabilities,
            dim=1
        )

    grade = predicted_class.item()
    confidence = confidence.item()

    return {
        "grade": grade,
        "grade_name": GRADE_NAMES[grade],
        "confidence": confidence,
        "cvd_risk": CVD_RISK[grade],
        "recommendation": RECOMMENDATIONS[grade],
        "probabilities": probabilities[0].cpu().tolist(),
    }


# ============================================================
# Main
# ============================================================

def main():

    print("=" * 60)
    print("RETINAL IMAGE PREDICTION")
    print("=" * 60)

    print(f"\nDevice: {DEVICE}")

    print("\nLoading EfficientNet-B0...")

    model = load_model()

    print("Model loaded successfully.")

    # --------------------------------------------------------
    # Get image path
    # --------------------------------------------------------

    if len(sys.argv) < 2:

        print("\nUsage:")
        print(
            "python ml/src/predict.py "
            "<path_to_retinal_image>"
        )

        print("\nExample:")
        print(
            "python ml/src/predict.py "
            "data/processed/train_images/aptos_000c1434d8d7.png"
        )

        return

    image_path = Path(sys.argv[1])

    print(f"\nTesting image:")
    print(image_path.name)

    # --------------------------------------------------------
    # Preprocess
    # --------------------------------------------------------

    image_tensor = preprocess_image(image_path)

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    result = predict(
        model,
        image_tensor
    )

    # --------------------------------------------------------
    # Display result
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("PREDICTION RESULT")
    print("=" * 60)

    print(f"\nDR Grade: {result['grade']}")

    print(
        f"DR Classification: "
        f"{result['grade_name']}"
    )

    print(
        f"Confidence: "
        f"{result['confidence'] * 100:.2f}%"
    )

    print(
        f"CVD Risk Tier: "
        f"{result['cvd_risk']}"
    )

    print(
        f"\nRecommendation:\n"
        f"{result['recommendation']}"
    )

    print("\nClass probabilities:")

    for grade, probability in enumerate(
        result["probabilities"]
    ):
        print(
            f"Grade {grade}: "
            f"{probability * 100:.2f}%"
        )

    print("\n" + "=" * 60)
    print("PREDICTION COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    main()