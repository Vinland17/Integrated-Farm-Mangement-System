import io
import os
from PIL import Image
import torch
import torchvision.transforms as transforms

# Exact EfficientNet-B0 inference preprocessing:
# 1. Resize to 224x224
# 2. ToTensor
# 3. ImageNet normalization (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
INFERENCE_TRANSFORMS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def load_and_preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """
    Safely opens image bytes, converts to RGB, applies EfficientNet-B0 preprocessing,
    and returns a 4D tensor [1, 3, 224, 224].
    """
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB")
    tensor = INFERENCE_TRANSFORMS(image)
    return tensor.unsqueeze(0)  # Add batch dimension: [1, 3, 224, 224]

def find_model_file(models_dir: str = "models") -> str:
    """
    Locates the active trained PyTorch model checkpoint (.pth) file.
    """
    search_paths = [models_dir, ".", ".."]
    for search_dir in search_paths:
        if not os.path.exists(search_dir):
            continue
        for file in os.listdir(search_dir):
            if file.endswith(".pth") or file.endswith(".pt"):
                full_path = os.path.join(search_dir, file)
                if os.path.isfile(full_path):
                    return os.path.abspath(full_path)
    return ""
