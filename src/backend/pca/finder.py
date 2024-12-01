import os
import cv2
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sklearn.decomposition import PCA

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

DATABASE_PATH = "./images"
IMAGE_SIZE = (100, 100)  # Resize all images to a fixed size
NUM_PCA_COMPONENTS = 50  # Number of PCA components

# Function to load and preprocess images from subfolders
def preprocess_images_from_folders(path):
    images = []
    image_labels = []
    image_paths = []

    for label_folder in os.listdir(path):
        folder_path = os.path.join(path, label_folder)
        if os.path.isdir(folder_path):
            for file_name in os.listdir(folder_path):
                file_path = os.path.join(folder_path, file_name)
                if file_name.endswith(('.png', '.jpg', '.jpeg')):
                    img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
                    img = cv2.resize(img, IMAGE_SIZE).flatten().astype(np.float32)
                    images.append(img)
                    image_labels.append(label_folder)
                    image_paths.append(file_path)
    return np.array(images), image_labels, image_paths

# Load images and apply PCA
print("Loading and preprocessing images...")
database_images, database_labels, database_paths = preprocess_images_from_folders(DATABASE_PATH)
print(f"Total images loaded: {len(database_paths)}")

# Apply PCA
pca = PCA(n_components=NUM_PCA_COMPONENTS)
database_features = pca.fit_transform(database_images)

@app.route('/upload', methods=['POST'])
def find_similar_images():
    # Get uploaded image
    uploaded_file = request.files['file']
    img_path = "./uploads/" + uploaded_file.filename
    uploaded_file.save(img_path)

    # Preprocess the uploaded image
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, IMAGE_SIZE).flatten().astype(np.float32)
    img_pca = pca.transform([img])

    # Compute similarities
    distances = np.linalg.norm(database_features - img_pca, axis=1)
    sorted_indices = np.argsort(distances)  # Sort by similarity (ascending)

    # Pagination support
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    start = (page - 1) * limit
    end = start + limit

    # Prepare response
    similar_images = []
    for i in sorted_indices[start:end]:
        image_url = f"http://127.0.0.1:5000/images/{os.path.basename(database_paths[i])}"
        similar_images.append({
            "url": image_url,
            "label": database_labels[i],
            "distance": float(distances[i]),
        })

    return jsonify({
        "page": page,
        "limit": limit,
        "total_results": len(database_paths),
        "similar_images": similar_images,
    })

@app.route('/images/<filename>')
def serve_image(filename):
    for root, dirs, files in os.walk(DATABASE_PATH):
        if filename in files:
            return send_from_directory(root, filename)
    return "File not found", 404

@app.route('/get_image_url', methods=['GET'])
def get_image_url():
    for root, dirs, files in os.walk(DATABASE_PATH):
        for file in files:
            if file.endswith(('.png', '.jpg', '.jpeg')):
                folder_name = os.path.basename(root)
                file_url = f"http://127.0.0.1:5000/images/{folder_name}/{file}"
                return jsonify({"url": file_url})
    return jsonify({"error": "No image found"}), 404

if __name__ == '__main__':
    if not os.path.exists('./uploads'):
        os.mkdir('./uploads')  # Create uploads directory if not exists
    app.run(debug=True)
