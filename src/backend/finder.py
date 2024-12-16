from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import numpy as np
from PIL import Image
import mido as midi
import logging
import zipfile
import json

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

# Paths and constants
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

TOP_N = 12

# Ensure directories exist
for path in [DATABASE_PATH_IMAGES, DATABASE_PATH_MIDI, PROCESSED_DATA_PATH, UPLOADS_PATH, MAPPER_PATH, PROCESSED_DATA_PATH_IMAGES, PROCESSED_DATA_PATH_MIDI]:
    if not os.path.exists(path):
        os.makedirs(path)

# Global variables
mapper = {}
database_images = None
database_labels = None
database_paths = None
database_features = None
data_mean = None
eigenvectors = None
processed_midi_dataset = None
midi_dataset_labels = None

# Load or update mapper
def load_mapper():
    global mapper
    mapper_file = os.path.join(MAPPER_PATH, 'mapper.json')
    if os.path.exists(mapper_file):
        with open(mapper_file, 'r') as f:
            mapper = json.load(f)
        logging.info("Mapper loaded successfully.")
    else:
        logging.warning("Mapper file not found.")

# Image processing functions
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

def compute_pca(X, num_components):
    X_mean = np.mean(X, axis=0)
    X_centered = X - X_mean
    U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)
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
        return
    
    database_features, data_mean, eigenvectors = compute_pca(database_images, NUM_PCA_COMPONENTS)
    np.savez_compressed(
        f"{PROCESSED_DATA_PATH_IMAGES}/database_pca.npz",
        features=database_features,
        labels=database_labels,
        paths=database_paths,
        mean=data_mean,
        eigenvectors=eigenvectors
    )

# MIDI processing functions
def load_midi(file_path):
    return midi.MidiFile(file_path)

def get_melody(midi_file):
    melody = []
    for track in midi_file.tracks:
        for msg in track:
            if msg.type == "note_on" and msg.velocity > 0:
                melody.append(msg.note)
    return melody

def windowing(melody, window_size, slide_size):
    melody_in_windows = []
    for i in range(0, len(melody) - window_size + 1, slide_size):
        window = melody[i:i + window_size]
        melody_in_windows.append(window)
    return melody_in_windows

def get_normalized_ATB(window):
    hist, _ = np.histogram(window, bins=128, range=(0, 127))
    if len(window) == 0:
        return np.zeros_like(hist, dtype=np.float32)
    return hist / np.sum(hist)

def get_normalized_RTB(window):
    if len(window) < 2:
        return np.zeros(255, dtype=np.float32)
    rtb = np.diff(window)
    hist, _ = np.histogram(rtb, bins=255, range=(-127, 127))
    if np.sum(hist) == 0:
        return hist
    return hist / np.sum(hist)

def get_normalized_FTB(window):
    if len(window) == 0:
        return np.zeros(255, dtype=np.float32)
    ftone = window[0]
    ftb = np.array(window) - ftone
    hist, _ = np.histogram(ftb, bins=255, range=(-127, 127))
    if np.sum(hist) == 0:
        return hist
    return hist / np.sum(hist)

def preprocess_midi_dataset(folder_path):
    logging.info("Processing MIDI dataset...")
    processed_dataset = []
    labels = []
    
    if not os.path.exists(folder_path):
        logging.error("Folder path does not exist")
        return processed_dataset, labels
        
    for file_name in os.listdir(folder_path):
        if file_name.endswith(".mid"):
            audio_name = file_name.replace('.mid', '')
            labels.append(audio_name)
            
            file_path = os.path.join(folder_path, file_name)
            midi_file = load_midi(file_path)
            melody = get_melody(midi_file)
            melody_in_windows = windowing(melody, WINDOW_SIZE, SLIDE_SIZE)
            
            vectors = {
                'ATB': [],
                'RTB': [],
                'FTB': []
            }
            
            for window in melody_in_windows:
                vectors['ATB'].append(get_normalized_ATB(window))
                vectors['RTB'].append(get_normalized_RTB(window))
                vectors['FTB'].append(get_normalized_FTB(window))
                
            processed_dataset.append(vectors)
            
    # Save processed data
    np.savez_compressed(
        f"{PROCESSED_DATA_PATH_MIDI}/processed_midi.npz",
        dataset=processed_dataset,
        labels=labels
    )
    logging.info(f"Processed {len(processed_dataset)} MIDI files")
    return processed_dataset, labels

def update_midi_database():
    global processed_midi_dataset, midi_dataset_labels

    logging.info("Preprocessing MIDI dataset...")
    processed_midi_dataset, midi_dataset_labels = preprocess_midi_dataset(DATABASE_PATH_MIDI)
    
    if len(processed_midi_dataset) == 0:
        logging.warning("No MIDI files found in the database.")
        return

# Initialize databases
def initialize_databases():
    global database_features, database_labels, database_paths
    global data_mean, eigenvectors
    global processed_midi_dataset, midi_dataset_labels

    # Load or preprocess image data
    if os.path.exists(f"{PROCESSED_DATA_PATH_IMAGES}/database_pca.npz"):
        logging.info("Loading preprocessed PCA data...")
        data = np.load(f"{PROCESSED_DATA_PATH_IMAGES}/database_pca.npz", allow_pickle=True)
        database_features = data['features']
        database_labels = data['labels']
        database_paths = data['paths']
        data_mean = data['mean']
        eigenvectors = data['eigenvectors']
    else:
        logging.info("No preprocessed PCA data found. Preprocessing image data...")
        update_image_database()
        if database_features is None or database_features.size == 0:
            logging.warning("Image database is empty after preprocessing.")

    # Load or preprocess MIDI data
    if os.path.exists(f"{PROCESSED_DATA_PATH_MIDI}/processed_midi.npz"):
        logging.info("Loading processed MIDI data...")
        data = np.load(f"{PROCESSED_DATA_PATH_MIDI}/processed_midi.npz", allow_pickle=True)
        processed_midi_dataset = data['dataset']
        midi_dataset_labels = data['labels']
    else:
        logging.info("No processed MIDI data found. Preprocessing MIDI data...")
        update_midi_database()
        if processed_midi_dataset is None or len(processed_midi_dataset) == 0:
            logging.warning("MIDI database is empty after preprocessing.")

    # Load mapper
    load_mapper()

initialize_databases()

# Endpoint to upload images
@app.route('/upload', methods=['POST'])
def upload_image():
    return handle_image_upload(request.files['file'])

# Endpoint to upload image ZIP archive
@app.route('/upload-zip', methods=['POST'])
def upload_image_zip():
    return handle_image_zip_upload(request.files['file'])

# Endpoint to upload MIDI files
@app.route('/upload-mid', methods=['POST'])
def upload_midi():
    return handle_midi_upload(request.files['file'])

# Endpoint to upload MIDI ZIP archive
@app.route('/upload-mid-zip', methods=['POST'])
def upload_midi_zip():
    return handle_midi_zip_upload(request.files['file'])

# Endpoint to upload mapper.json
@app.route('/upload-mapper', methods=['POST'])
def upload_mapper():
    return handle_mapper_upload(request.files['file'])

def handle_image_upload(uploaded_file):
    global mapper
    if database_features is None or database_features.size == 0:
        return jsonify({"similar_items": [], "message": "Image database is empty."})

    img_path = os.path.join(UPLOADS_PATH, uploaded_file.filename)
    uploaded_file.save(img_path)

    # Preprocess uploaded image
    img = Image.open(img_path).convert('L').resize(IMAGE_SIZE)
    img_array = np.array(img).flatten().astype(np.float32)
    img_centered = img_array - data_mean
    img_pca = np.dot(img_centered, eigenvectors)

    # Compute similarities
    similarities = np.dot(database_features, img_pca) / (np.linalg.norm(database_features, axis=1) * np.linalg.norm(img_pca) + 1e-9)
    sorted_indices = np.argsort(similarities)[::-1]

    # Get top N similar images
    similar_images = []
    for idx in sorted_indices[:TOP_N]:
        rel_path = os.path.relpath(database_paths[idx], DATABASE_PATH_IMAGES)
        image_label = database_labels[idx]
        similar_image = {
            "url": f"{request.host_url}images/{rel_path}".replace("\\", "/"),
            "label": image_label,
            "similarity": float(similarities[idx])
        }

        # Get associated song details from mapper
        song_info = mapper.get(image_label)
        if song_info:
            similar_image["associated_midi"] = f"{request.host_url}midi/{song_info['midi']}"
            similar_image["title"] = song_info.get("title", "")
            similar_image["artist"] = song_info.get("artist", "")
            similar_image["album"] = song_info.get("album", "")
            similar_image["year"] = song_info.get("year", "")
        similar_images.append(similar_image)

    return jsonify({
        "similar_items": similar_images
    })

def handle_image_zip_upload(uploaded_file):
    zip_path = os.path.join(UPLOADS_PATH, uploaded_file.filename)
    uploaded_file.save(zip_path)

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(DATABASE_PATH_IMAGES)
    os.remove(zip_path)

    # Update image database
    update_image_database()

    return jsonify({"message": "Image ZIP uploaded and database updated successfully"})

def handle_midi_upload(uploaded_file):
    global mapper
    if processed_midi_dataset is None or len(processed_midi_dataset) == 0:
        return jsonify({"similar_items": [], "message": "MIDI database is empty."})

    midi_path = os.path.join(UPLOADS_PATH, uploaded_file.filename)
    uploaded_file.save(midi_path)

    # Process uploaded MIDI file
    midi_file = load_midi(midi_path)
    melody = get_melody(midi_file)
    melody_in_windows = windowing(melody, WINDOW_SIZE, SLIDE_SIZE)
    query_vectors = {
        'ATB': [],
        'RTB': [],
        'FTB': []
    }
    for window in melody_in_windows:
        query_vectors['ATB'].append(get_normalized_ATB(window))
        query_vectors['RTB'].append(get_normalized_RTB(window))
        query_vectors['FTB'].append(get_normalized_FTB(window))

    # Search for similar MIDI files
    results = search_midi(query_vectors, processed_midi_dataset, midi_dataset_labels, threshold=0.5)

    # Prepare response
    similar_midis = []
    for result in results[:TOP_N]:  # Get top 5 results
        idx = result['index']
        midi_label = midi_dataset_labels[idx]
        midi_file_name = midi_label + '.mid'
        midi_info = {
            "label": midi_label,
            "similarity": result['similarity'],
            "url": f"{request.host_url}midi/{midi_file_name}"
        }
        # Get associated image and song details from mapper
        for image_name, song_info in mapper.items():
            if song_info['midi'] == midi_file_name:
                midi_info["associated_image"] = f"{request.host_url}images/{image_name}"
                midi_info["title"] = song_info.get("title", "")
                midi_info["artist"] = song_info.get("artist", "")
                midi_info["album"] = song_info.get("album", "")
                midi_info["year"] = song_info.get("year", "")
                break

        similar_midis.append(midi_info)

    return jsonify({
        "similar_items": similar_midis
    })

def handle_midi_zip_upload(uploaded_file):
    zip_path = os.path.join(UPLOADS_PATH, uploaded_file.filename)
    uploaded_file.save(zip_path)

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(DATABASE_PATH_MIDI)
    os.remove(zip_path)

    # Update MIDI database
    update_midi_database()

    return jsonify({"message": "MIDI ZIP uploaded and database updated successfully"})

def handle_mapper_upload(uploaded_file):
    mapper_path = os.path.join(MAPPER_PATH, 'mapper.json')
    uploaded_file.save(mapper_path)
    load_mapper()
    return jsonify({"message": "Mapper uploaded successfully."})

# Helper function for MIDI search
def calculate_similarity(query_vectors, audio_vectors, weights=None):
    if weights is None:
        weights = {'ATB': 1.0, 'RTB': 1.0, 'FTB': 1.0}

    similarities = []
    for tone_type in ['ATB', 'RTB', 'FTB']:
        query_matrix = np.array(query_vectors[tone_type])  # Query windows x features
        audio_matrix = np.array(audio_vectors[tone_type])  # Audio windows x features

        # Cosine Similarity
        dot_product = np.dot(query_matrix, audio_matrix.T)  # All pairs
        query_norms = np.linalg.norm(query_matrix, axis=1, keepdims=True)
        audio_norms = np.linalg.norm(audio_matrix, axis=1, keepdims=True).T
        cosine_similarities = dot_product / (query_norms * audio_norms + 1e-9)  # Avoid division by zero

        # Take maximum similarity for each query window
        max_similarities = np.max(cosine_similarities, axis=1)
        avg_tone_similarity = np.mean(max_similarities)  # Average
        similarities.append(weights[tone_type] * avg_tone_similarity)

    # Total similarity
    total_similarity = sum(similarities) / sum(weights.values())
    return total_similarity

def search_midi(query_vectors, dataset, labels, threshold, weights=None):
    results = []
    for idx, audio_vectors in enumerate(dataset):
        # Calculate similarity
        similarity = calculate_similarity(query_vectors, audio_vectors, weights)

        if similarity >= threshold:
            results.append({"index": idx, "similarity": similarity})

    # Sort results by similarity
    results.sort(key=lambda x: x['similarity'], reverse=True)
    return results

# Serve images
@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(DATABASE_PATH_IMAGES, filename)

# Serve MIDI files
@app.route('/midi/<path:filename>')
def serve_midi(filename):
    return send_from_directory(DATABASE_PATH_MIDI, filename)

if __name__ == '__main__':
    app.run(debug=True)