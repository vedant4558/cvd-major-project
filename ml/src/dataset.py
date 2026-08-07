import pandas as pd
from PIL import Image
from torch.utils.data import Dataset

from config import TRAIN_IMAGES_DIR


class RetinalDataset(Dataset):
    """
    Custom PyTorch Dataset for loading retinal fundus images.
    """

    def __init__(self, csv_file, transform=None):
        """
        Args:
            csv_file (str or Path): Path to train.csv / val.csv / test.csv
            transform: torchvision transforms
        """
        self.data = pd.read_csv(csv_file)
        self.transform = transform

    def __len__(self):
        """Returns total number of samples."""
        return len(self.data)

    def __getitem__(self, idx):
        """
        Returns:
            image (Tensor)
            label (int)
        """

        # Image filename
        image_id = self.data.iloc[idx]["id_code"]

        # Label (0-4)
        label = int(self.data.iloc[idx]["diagnosis"])

        # Full image path
        image_path = TRAIN_IMAGES_DIR / f"{image_id}.png"

        # Load image
        image = Image.open(image_path).convert("RGB")

        # Apply transforms
        if self.transform:
            image = self.transform(image)

        return image, label