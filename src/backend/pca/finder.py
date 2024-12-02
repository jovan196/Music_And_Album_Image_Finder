import os
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import logging

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

DATABASE_PATH = "./images"
PROCESSED_DATA_PATH = "./processed"
UPLOADS_PATH = "./uploads"
IMAGE_SIZE = (100, 100)  # Resize all images to a fixed size
NUM_PCA_COMPONENTS = 50  # Number of PCA components

# Helper function: ensure directory exists
def ensure_dir(path):
    if not os.path.exists(path):
        os.mkdir(path)

ensure_dir(UPLOADS_PATH)
ensure_dir(PROCESSED_DATA_PATH)

# Function to load and preprocess images
def preprocess_images_from_directory(path):
    images = []
    labels = []
    file_paths = []
    for file_name in os.listdir(path):
        if file_name.lower().endswith(('.png', '.jpg', '.jpeg')):
            file_path = os.path.join(path, file_name)
            img = Image.open(file_path).convert('L').resize(IMAGE_SIZE)
            img_array = np.array(img).flatten().astype(np.float32)
            images.append(img_array)
            labels.append(file_name)
            file_paths.append(file_path)
    return np.array(images), labels, file_paths

# Function to compute PCA using SVD
def compute_pca(X, num_components):
    X_mean = np.mean(X, axis=0)
    X_centered = X - X_mean
    U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)
    principal_components = Vt[:num_components].T
    X_reduced = np.dot(X_centered, principal_components)
    return X_reduced, X_mean, principal_components

# Load or preprocess database
if os.path.exists(f"{PROCESSED_DATA_PATH}/database_pca.npz"):
    logging.info("Loading preprocessed PCA data...")
    data = np.load(f"{PROCESSED_DATA_PATH}/database_pca.npz")
    database_features = data['features']
    database_labels = data['labels']
    database_paths = data['paths']
    data_mean = data['mean']
    eigenvectors = data['eigenvectors']
else:
    logging.info("Preprocessing images and computing PCA...")
    database_images, database_labels, database_paths = preprocess_images_from_directory(DATABASE_PATH)
    database_features, data_mean, eigenvectors = compute_pca(database_images, NUM_PCA_COMPONENTS)
    np.savez_compressed(
        f"{PROCESSED_DATA_PATH}/database_pca.npz",
        features=database_features,
        labels=database_labels,
        paths=database_paths,
        mean=data_mean,
        eigenvectors=eigenvectors
    )

@app.route('/upload', methods=['POST'])
def find_similar_images():
    uploaded_file = request.files['file']
    img_path = os.path.join(UPLOADS_PATH, uploaded_file.filename)
    uploaded_file.save(img_path)

    # Preprocess uploaded image
    img = Image.open(img_path).convert('L').resize(IMAGE_SIZE)
    img_array = np.array(img).flatten().astype(np.float32)
    img_centered = img_array - data_mean
    img_pca = np.dot(img_centered, eigenvectors)

    # Compute distances
    distances = np.linalg.norm(database_features - img_pca, axis=1)
    sorted_indices = np.argsort(distances)

    # Pagination
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    start = (page - 1) * limit
    end = start + limit

    similar_images = []
    for i in sorted_indices[start:end]:
        rel_path = os.path.relpath(database_paths[i], DATABASE_PATH)
        similar_images.append({
            "url": f"http://127.0.0.1:5000/images/{rel_path}".replace("\\", "/"),
            "label": database_labels[i],
            "distance": float(distances[i])
        })

    return jsonify({
        "page": page,
        "limit": limit,
        "total_results": len(database_paths),
        "similar_images": similar_images
    })

@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(DATABASE_PATH, filename)

if __name__ == '__main__':
    app.run(debug=True)
