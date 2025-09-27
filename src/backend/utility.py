import json
import logging
import os

# Shared paths and constants
DATABASE_PATH_IMAGES = "./database/images"
DATABASE_PATH_MIDI = "./database/midi_dataset"
PROCESSED_DATA_PATH = "./processed"
PROCESSED_DATA_PATH_IMAGES = os.path.join(PROCESSED_DATA_PATH, "images")
PROCESSED_DATA_PATH_MIDI = os.path.join(PROCESSED_DATA_PATH, "midi")
UPLOADS_PATH = "./uploads"
MAPPER_PATH = "./mapper"

IMAGE_SIZE = (128, 128)
NUM_PCA_COMPONENTS = 100
WINDOW_SIZE = 40
SLIDE_SIZE = 6


def ensure_directories():
    """Create all required directories if they do not exist."""
    for path in [
        DATABASE_PATH_IMAGES,
        DATABASE_PATH_MIDI,
        PROCESSED_DATA_PATH,
        PROCESSED_DATA_PATH_IMAGES,
        PROCESSED_DATA_PATH_MIDI,
        UPLOADS_PATH,
        MAPPER_PATH,
    ]:
        os.makedirs(path, exist_ok=True)


def delete_files_in_directory(directory: str):
    for file_name in os.listdir(directory):
        file_path = os.path.join(directory, file_name)
        if os.path.isfile(file_path):
            os.remove(file_path)


def reset_uploads():
    """Deletes all files in the uploads directory after query processing, except .gitkeep."""
    for file_name in os.listdir(UPLOADS_PATH):
        if file_name != ".gitkeep":
            os.remove(os.path.join(UPLOADS_PATH, file_name))


def load_mapper() -> dict:
    mapper_file = os.path.join(MAPPER_PATH, "mapper.json")
    if os.path.exists(mapper_file):
        with open(mapper_file, "r", encoding="utf-8") as mapper_fp:
            mapper = json.load(mapper_fp)
        logging.info("Mapper loaded successfully.")
        return mapper

    logging.warning("Mapper file not found.")
    return {}
