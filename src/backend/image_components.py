import logging
import os
import zipfile
from typing import Tuple

import numpy as np
from flask import Request, jsonify
from PIL import Image

from utility import (
    DATABASE_PATH_IMAGES,
    IMAGE_SIZE,
    NUM_PCA_COMPONENTS,
    PROCESSED_DATA_PATH_IMAGES,
    UPLOADS_PATH,
    delete_files_in_directory,
    reset_uploads,
)

database_images = None
database_labels = []
database_paths = []
database_features = None
data_mean = None
eigenvectors = None


def preprocess_images_from_directory(path: str) -> Tuple[np.ndarray, list, list]:
    images = []
    labels = []
    file_paths = []
    for file_name in os.listdir(path):
        if file_name.lower().endswith((".png", ".jpg", ".jpeg")):
            file_path = os.path.join(path, file_name)
            img = Image.open(file_path).convert("L").resize(IMAGE_SIZE)
            img_array = np.array(img).flatten().astype(np.float32)
            images.append(img_array)
            labels.append(file_name)
            file_paths.append(file_path)
    return np.array(images), labels, file_paths


def compute_pca(X: np.ndarray, num_components: int):
    X_mean = np.mean(X, axis=0)
    X_centered = X - X_mean
    _, _, Vt = np.linalg.svd(X_centered, full_matrices=False)
    principal_components = Vt[:num_components].T
    X_reduced = np.dot(X_centered, principal_components)
    return X_reduced, X_mean, principal_components


def update_image_database():
    global database_images, database_labels, database_paths
    global database_features, data_mean, eigenvectors

    logging.info("Preprocessing images and computing PCA...")
    database_images, database_labels, database_paths = preprocess_images_from_directory(DATABASE_PATH_IMAGES)

    if database_images.size == 0:
        logging.warning("No images found in the database.")
        database_features = None
        data_mean = None
        eigenvectors = None
        return

    database_features, data_mean, eigenvectors = compute_pca(database_images, NUM_PCA_COMPONENTS)
    np.savez_compressed(
        f"{PROCESSED_DATA_PATH_IMAGES}/database_pca.npz",
        features=database_features,
        labels=database_labels,
        paths=database_paths,
        mean=data_mean,
        eigenvectors=eigenvectors,
    )


def initialize_image_components():
    global database_features, database_labels, database_paths
    global data_mean, eigenvectors

    pca_file = f"{PROCESSED_DATA_PATH_IMAGES}/database_pca.npz"
    if os.path.exists(pca_file):
        logging.info("Loading preprocessed PCA data...")
        data = np.load(pca_file, allow_pickle=True)
        database_features = data["features"]
        database_labels = data["labels"].tolist()
        database_paths = data["paths"].tolist()
        data_mean = data["mean"]
        eigenvectors = data["eigenvectors"]
    else:
        logging.info("No preprocessed PCA data found. Preprocessing image data...")
        update_image_database()
        if database_features is None or database_features.size == 0:
            logging.warning("Image database is empty after preprocessing.")


def handle_image_upload(uploaded_file, mapper: dict, flask_request: Request):
    if database_features is None or database_features.size == 0:
        return jsonify({"similar_items": [], "message": "Image database is empty."})

    img_path = os.path.join(UPLOADS_PATH, uploaded_file.filename)
    uploaded_file.save(img_path)

    img = Image.open(img_path).convert("L").resize(IMAGE_SIZE)
    img_array = np.array(img).flatten().astype(np.float32)
    img_centered = img_array - data_mean
    img_pca = np.dot(img_centered, eigenvectors)

    similarities = np.dot(database_features, img_pca) / (
        np.linalg.norm(database_features, axis=1) * np.linalg.norm(img_pca) + 1e-9
    )
    sorted_indices = np.argsort(similarities)[::-1]

    similar_images = []
    for idx in sorted_indices[: len(database_labels)]:
        rel_path = os.path.relpath(database_paths[idx], DATABASE_PATH_IMAGES)
        image_label = database_labels[idx]
        similar_image = {
            "url": f"{flask_request.host_url}images/{rel_path}".replace("\\", "/"),
            "label": image_label,
            "similarity": float(similarities[idx]),
        }

        song_info = mapper.get(image_label)
        if song_info:
            similar_image["associated_midi"] = f"{flask_request.host_url}midi/{song_info['midi']}"
            similar_image["title"] = song_info.get("title", "")
            similar_image["artist"] = song_info.get("artist", "")
            similar_image["album"] = song_info.get("album", "")
            similar_image["year"] = song_info.get("year", "")
        similar_images.append(similar_image)

    reset_uploads()

    return jsonify({"similar_items": similar_images})


def handle_image_zip_upload(uploaded_file):
    delete_files_in_directory(DATABASE_PATH_IMAGES)
    zip_path = os.path.join(UPLOADS_PATH, uploaded_file.filename)
    uploaded_file.save(zip_path)

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(DATABASE_PATH_IMAGES)
    os.remove(zip_path)

    update_image_database()
    reset_uploads()

    return jsonify({"message": "Image ZIP uploaded and database updated successfully"})