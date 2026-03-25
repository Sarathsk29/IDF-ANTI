import cv2
import numpy as np
from PIL import Image

def load_image_cv2(image_path: str):
    """Loads an image using OpenCV."""
    return cv2.imread(image_path)

def load_image_pil(image_path: str):
    """Loads an image using PIL."""
    return Image.open(image_path)

def save_image_cv2(image: np.ndarray, save_path: str) -> bool:
    """Saves an image using OpenCV."""
    return cv2.imwrite(save_path, image)
