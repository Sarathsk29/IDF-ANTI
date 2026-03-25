import os
import shutil
from fastapi import UploadFile

def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    """Saves an uploaded file to a destination path."""
    try:
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()
    return destination

def ensure_directory(path: str) -> None:
    """Ensures that a directory exists, creates it if not."""
    os.makedirs(path, exist_ok=True)
