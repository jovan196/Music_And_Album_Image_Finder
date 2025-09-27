import logging
import os
import zipfile
from typing import Dict, List

import mido as midi
import numpy as np
from flask import Request, jsonify

from utility import (
    DATABASE_PATH_MIDI,
    PROCESSED_DATA_PATH_MIDI,
    SLIDE_SIZE,
    UPLOADS_PATH,
    WINDOW_SIZE,
    delete_files_in_directory,
    reset_uploads,
)

processed_midi_dataset: List[Dict[str, List[np.ndarray]]] = []
midi_dataset_labels: List[str] = []


def load_midi(file_path: str):
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
        window = melody[i : i + window_size]
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


def preprocess_midi_dataset(folder_path: str):
    logging.info("Processing MIDI dataset...")
    processed_dataset = []
    labels = []

    if not os.path.exists(folder_path):
        logging.error("Folder path does not exist")
        return processed_dataset, labels

    for file_name in os.listdir(folder_path):
        if file_name.endswith(".mid"):
            audio_name = file_name.replace(".mid", "")
            labels.append(audio_name)

            file_path = os.path.join(folder_path, file_name)
            midi_file = load_midi(file_path)
            melody = get_melody(midi_file)
            melody_in_windows = windowing(melody, WINDOW_SIZE, SLIDE_SIZE)

            vectors = {"ATB": [], "RTB": [], "FTB": []}

            for window in melody_in_windows:
                vectors["ATB"].append(get_normalized_ATB(window))
                vectors["RTB"].append(get_normalized_RTB(window))
                vectors["FTB"].append(get_normalized_FTB(window))

            processed_dataset.append(vectors)

    np.savez_compressed(
        f"{PROCESSED_DATA_PATH_MIDI}/processed_midi.npz",
        dataset=processed_dataset,
        labels=labels,
    )
    logging.info("Processed %s MIDI files", len(processed_dataset))
    return processed_dataset, labels


def initialize_midi_components():
    global processed_midi_dataset, midi_dataset_labels

    processed_file = f"{PROCESSED_DATA_PATH_MIDI}/processed_midi.npz"
    if os.path.exists(processed_file):
        logging.info("Loading processed MIDI data...")
        data = np.load(processed_file, allow_pickle=True)
        processed_midi_dataset = data["dataset"].tolist()
        midi_dataset_labels = data["labels"].tolist()
    else:
        logging.info("No processed MIDI data found. Preprocessing MIDI data...")
        processed_midi_dataset, midi_dataset_labels = preprocess_midi_dataset(DATABASE_PATH_MIDI)
        if not processed_midi_dataset:
            logging.warning("MIDI database is empty after preprocessing.")


def calculate_similarity(query_vectors, audio_vectors, weights=None):
    if weights is None:
        weights = {"ATB": 1.0, "RTB": 1.0, "FTB": 1.0}

    similarities = []
    for tone_type in ["ATB", "RTB", "FTB"]:
        query_matrix = np.array(query_vectors[tone_type])
        audio_matrix = np.array(audio_vectors[tone_type])

        if query_matrix.size == 0 or audio_matrix.size == 0:
            similarities.append(0.0)
            continue

        dot_product = np.dot(query_matrix, audio_matrix.T)
        query_norms = np.linalg.norm(query_matrix, axis=1, keepdims=True)
        audio_norms = np.linalg.norm(audio_matrix, axis=1, keepdims=True).T
        cosine_similarities = dot_product / (query_norms * audio_norms + 1e-9)

        max_similarities = np.max(cosine_similarities, axis=1)
        avg_tone_similarity = np.mean(max_similarities)
        similarities.append(weights[tone_type] * avg_tone_similarity)

    total_similarity = sum(similarities) / max(sum(weights.values()), 1e-9)
    return total_similarity


def search_midi(query_vectors, dataset, labels, threshold, weights=None):
    results = []
    for idx, audio_vectors in enumerate(dataset):
        similarity = calculate_similarity(query_vectors, audio_vectors, weights)

        if similarity >= threshold:
            results.append({"index": idx, "similarity": similarity})

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results


def update_midi_database():
    global processed_midi_dataset, midi_dataset_labels

    logging.info("Preprocessing MIDI dataset...")
    processed_midi_dataset, midi_dataset_labels = preprocess_midi_dataset(DATABASE_PATH_MIDI)

    if not processed_midi_dataset:
        logging.warning("No MIDI files found in the database.")


def handle_midi_upload(uploaded_file, mapper: dict, flask_request: Request, threshold: float = 0.5):
    if not processed_midi_dataset or not midi_dataset_labels:
        return jsonify({"similar_items": [], "message": "MIDI database is empty."})

    midi_path = os.path.join(UPLOADS_PATH, uploaded_file.filename)
    uploaded_file.save(midi_path)

    midi_file = load_midi(midi_path)
    melody = get_melody(midi_file)
    melody_in_windows = windowing(melody, WINDOW_SIZE, SLIDE_SIZE)
    query_vectors = {"ATB": [], "RTB": [], "FTB": []}
    for window in melody_in_windows:
        query_vectors["ATB"].append(get_normalized_ATB(window))
        query_vectors["RTB"].append(get_normalized_RTB(window))
        query_vectors["FTB"].append(get_normalized_FTB(window))

    results = search_midi(query_vectors, processed_midi_dataset, midi_dataset_labels, threshold=threshold)

    similar_midis = []
    for result in results[: len(midi_dataset_labels)]:
        idx = result["index"]
        midi_label = midi_dataset_labels[idx]
        midi_file_name = midi_label + ".mid"
        midi_info = {
            "label": midi_label,
            "similarity": result["similarity"],
            "url": f"{flask_request.host_url}midi/{midi_file_name}",
        }
        for image_name, song_info in mapper.items():
            if song_info.get("midi") == midi_file_name:
                midi_info["associated_image"] = f"{flask_request.host_url}images/{image_name}"
                midi_info["title"] = song_info.get("title", "")
                midi_info["artist"] = song_info.get("artist", "")
                midi_info["album"] = song_info.get("album", "")
                midi_info["year"] = song_info.get("year", "")
                break

        similar_midis.append(midi_info)

    reset_uploads()

    return jsonify({"similar_items": similar_midis})


def handle_midi_zip_upload(uploaded_file):
    delete_files_in_directory(DATABASE_PATH_MIDI)
    zip_path = os.path.join(UPLOADS_PATH, uploaded_file.filename)
    uploaded_file.save(zip_path)

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(DATABASE_PATH_MIDI)
    os.remove(zip_path)

    update_midi_database()
    reset_uploads()

    return jsonify({"message": "MIDI ZIP uploaded and database updated successfully"})

