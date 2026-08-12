import sys
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms


# ============================================================
# PATHS
# ============================================================

CURRENT_FILE = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE.parents[2]

MODELS_DIR = PROJECT_ROOT / "ml" / "models"
OUTPUTS_DIR = PROJECT_ROOT / "ml" / "outputs" / "gradcam"

MODEL_PATH = MODELS_DIR / "v4_best_model.pth"

OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# CONFIGURATION
# ============================================================

NUM_CLASSES = 5

IMAGE_SIZE = 224

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

GRADE_NAMES = {
    0: "No Diabetic Retinopathy",
    1: "Mild Diabetic Retinopathy",
    2: "Moderate Diabetic Retinopathy",
    3: "Severe Diabetic Retinopathy",
    4: "Proliferative Diabetic Retinopathy",
}


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# IMAGE TRANSFORM
# ============================================================

inference_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=IMAGENET_MEAN,
        std=IMAGENET_STD
    ),
])


# ============================================================
# BUILD MODEL
# ============================================================

def build_model():
    """
    Create EfficientNet-B0 with five output classes.
    """

    model = models.efficientnet_b0(weights=None)

    in_features = model.classifier[1].in_features

    model.classifier[1] = torch.nn.Linear(
        in_features,
        NUM_CLASSES
    )

    return model


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():
    """
    Load the trained V4 EfficientNet-B0 model.
    """

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found:\n{MODEL_PATH}"
        )

    model = build_model()

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )

    if (
        isinstance(checkpoint, dict)
        and "model_state_dict" in checkpoint
    ):
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    model.load_state_dict(state_dict)

    model.to(DEVICE)

    model.eval()

    return model


# ============================================================
# GRAD-CAM CLASS
# ============================================================

class GradCAM:
    """
    Grad-CAM implementation for EfficientNet-B0.
    """

    def __init__(self, model, target_layer):

        self.model = model
        self.target_layer = target_layer

        self.activations = None
        self.gradients = None

        self.forward_hook = target_layer.register_forward_hook(
            self._save_activations
        )

        self.backward_hook = target_layer.register_full_backward_hook(
            self._save_gradients
        )

    def _save_activations(
        self,
        module,
        input,
        output
    ):
        self.activations = output.detach()

    def _save_gradients(
        self,
        module,
        grad_input,
        grad_output
    ):
        self.gradients = grad_output[0].detach()

    def generate(
        self,
        image_tensor,
        target_class=None
    ):
        """
        Generate Grad-CAM heatmap.
        """

        self.model.zero_grad()

        output = self.model(image_tensor)

        probabilities = F.softmax(
            output,
            dim=1
        )

        predicted_class = torch.argmax(
            probabilities,
            dim=1
        ).item()

        if target_class is None:
            target_class = predicted_class

        score = output[:, target_class]

        score.backward()

        gradients = self.gradients
        activations = self.activations

        # Global average pooling of gradients
        weights = gradients.mean(
            dim=(2, 3),
            keepdim=True
        )

        # Weighted feature maps
        cam = (
            weights * activations
        ).sum(dim=1)

        # Remove negative values
        cam = F.relu(cam)

        # Convert to numpy
        cam = cam.squeeze().cpu().numpy()

        # Normalize
        cam -= cam.min()

        if cam.max() > 0:
            cam /= cam.max()

        return cam, predicted_class, probabilities

    def close(self):

        self.forward_hook.remove()
        self.backward_hook.remove()


# ============================================================
# PREPROCESS IMAGE
# ============================================================

def load_image(image_path):
    """
    Load image and create model input tensor.
    """

    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found:\n{image_path}"
        )

    original_image = Image.open(
        image_path
    ).convert("RGB")

    tensor = inference_transform(
        original_image
    )

    tensor = tensor.unsqueeze(0)

    tensor = tensor.to(DEVICE)

    return original_image, tensor


# ============================================================
# CREATE HEATMAP
# ============================================================

def create_heatmap(
    cam,
    original_image
):
    """
    Convert Grad-CAM values into an OpenCV heatmap.
    """

    original = np.array(
        original_image
    )

    height, width = original.shape[:2]

    cam_resized = cv2.resize(
        cam,
        (width, height)
    )

    heatmap = np.uint8(
        255 * cam_resized
    )

    heatmap = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET
    )

    return original, heatmap


# ============================================================
# CREATE OVERLAY
# ============================================================

def create_overlay(
    original,
    heatmap,
    alpha=0.40
):
    """
    Overlay Grad-CAM heatmap on the original image.
    """

    original_bgr = cv2.cvtColor(
        original,
        cv2.COLOR_RGB2BGR
    )

    overlay = cv2.addWeighted(
        original_bgr,
        1 - alpha,
        heatmap,
        alpha,
        0
    )

    return overlay


# ============================================================
# SAVE RESULT
# ============================================================

def save_gradcam(
    overlay,
    image_path
):
    """
    Save Grad-CAM overlay.
    """

    image_path = Path(image_path)

    output_name = (
        image_path.stem
        + "_gradcam.png"
    )

    output_path = (
        OUTPUTS_DIR
        / output_name
    )

    cv2.imwrite(
        str(output_path),
        overlay
    )

    return output_path


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("RETINAL GRAD-CAM ANALYSIS")
    print("=" * 60)

    print(f"\nDevice: {DEVICE}")

    # --------------------------------------------------------
    # Check image argument
    # --------------------------------------------------------

    if len(sys.argv) < 2:

        print("\nUsage:")
        print(
            "python ml/src/gradcam.py "
            "<path_to_retinal_image>"
        )

        print("\nExample:")
        print(
            "python ml/src/gradcam.py "
            "data/processed/train_images/"
            "aptos_000c1434d8d7.png"
        )

        return

    image_path = Path(
        sys.argv[1]
    )

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    print("\nLoading EfficientNet-B0...")

    model = load_model()

    print("Model loaded successfully.")

    # --------------------------------------------------------
    # Load image
    # --------------------------------------------------------

    print(
        f"\nLoading image:\n"
        f"{image_path}"
    )

    original_image, image_tensor = load_image(
        image_path
    )

    print("Image loaded successfully.")

    # --------------------------------------------------------
    # EfficientNet target layer
    # --------------------------------------------------------

    target_layer = (
        model.features[-1]
    )

    # --------------------------------------------------------
    # Create Grad-CAM
    # --------------------------------------------------------

    gradcam = GradCAM(
        model,
        target_layer
    )

    print("\nGenerating Grad-CAM...")

    cam, predicted_class, probabilities = (
        gradcam.generate(
            image_tensor
        )
    )

    # --------------------------------------------------------
    # Prediction information
    # --------------------------------------------------------

    confidence = probabilities[
        0,
        predicted_class
    ].item()

    print("\n" + "=" * 60)
    print("MODEL PREDICTION")
    print("=" * 60)

    print(
        f"\nDR Grade: {predicted_class}"
    )

    print(
        f"Classification: "
        f"{GRADE_NAMES[predicted_class]}"
    )

    print(
        f"Confidence: "
        f"{confidence * 100:.2f}%"
    )

    # --------------------------------------------------------
    # Heatmap
    # --------------------------------------------------------

    original, heatmap = create_heatmap(
        cam,
        original_image
    )

    overlay = create_overlay(
        original,
        heatmap
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output_path = save_gradcam(
        overlay,
        image_path
    )

    gradcam.close()

    print("\n" + "=" * 60)
    print("GRAD-CAM COMPLETED")
    print("=" * 60)

    print(
        f"\nOutput saved to:\n"
        f"{output_path}"
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()