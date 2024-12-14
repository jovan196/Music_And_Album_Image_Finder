import numpy as np
import os
import mido as midi
import logging

logging.basicConfig(level=logging.INFO)

# Constants
DATABASE_PATH = "./database/midi_dataset"
PROCESSED_PATH = "./processed_rbh"
WINDOW_SIZE = 40
SLIDE_SIZE = 6

# Create processed directory if it doesn't exist
if not os.path.exists(PROCESSED_PATH):
    os.makedirs(PROCESSED_PATH)

# 1. PEMROSESAN AUDIO
# 1) Fungsi load file
def load_midi(file_path):
    return midi.MidiFile(file_path)

# 2) Fungsi retrieve melody dari midi_file
def get_melody(midi_file):
    melody = []
    for tracks in midi_file.tracks:
        for msg in tracks:
            if msg.type == "note_on":
                melody.append(msg.note)
    return melody

# 3) Fungsi windowing
def windowing(melody, window_size, slide_size):
    melody_in_windows = []
    for i in range (0, len(melody) - window_size + 1, slide_size):
        window = melody [i:i + window_size]
        melody_in_windows.append(window)
    return melody_in_windows

# 4) Fungsi memisahkan nama audio dengan format ".mid" nya
def get_audio_name(file_name):
    get_rid = file_name.rfind('.mid')
    return file_name[:get_rid]

# 2. EKSTRAKSI FITUR
# 1) Fungsi get normalized ATB
def get_normalized_ATB(window):
    hist,_ = np.histogram(window, bins=128, range=(0, 127))
    if len(window) == 0:
        return np.zeros_like(hist, dtype=np.float32)
    return hist/np.sum(hist)

# 2) Fungsi get normalized RTB
def get_normalized_RTB(window):
    if len(window) < 2:
        return np.zeros(255, dtype=np.float32)
    rtb = np.diff(window)
    hist,_ = np.histogram(rtb, bins=255, range=(-127, 127))
    return hist

# 3) Fungsi get normalized FTB
def get_normalized_FTB(window):
    if len(window) == 0:
        return np.zeros(255, dtype=np.float32)
    ftone = window[0]
    ftb = np.array(window) - ftone
    hist,_ = np.histogram(ftb, bins=255, range=(-127, 127))
    return hist


# Fungsi pre-process database midi
def preprocess_midi_dataset(folder_path):
    logging.info("Processing MIDI dataset...")
    processed_dataset = []
    
    if not os.path.exists(folder_path):
        logging.error("Folder path does not exist")
        return processed_dataset
        
    for file_name in os.listdir(folder_path):
        if file_name.endswith(".mid"):
            midi_audio = []
            audio_name = file_name.replace('.mid', '')
            midi_audio.append(audio_name)
            
            file_path = os.path.join(folder_path, file_name)
            midi_file = midi.MidiFile(file_path)
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
                
            midi_audio.append(vectors)
            processed_dataset.append(midi_audio)
            
    # Save processed data
    np.savez_compressed(
        f"{PROCESSED_PATH}/processed_midi.npz",
        dataset=processed_dataset
    )
    logging.info(f"Processed {len(processed_dataset)} MIDI files")
    return processed_dataset

# 3. SEARCH
# 1) Fungsi process query
def process_query(query_folder, window_size=WINDOW_SIZE, slide_size=SLIDE_SIZE):
    if not os.path.exists(query_folder):
        print("Query tidak ditemukan")
        return 
    for query in os.listdir(query_folder):
        if query.endswith(".mid"):
            query_path = os.path.join(query_folder, query)
            midi_query = load_midi(query_path)
            query_melody = get_melody(midi_query)
            query_melody_in_windows = windowing(query_melody, window_size, slide_size)
            query_vectors = {
                'ATB': [],
                'RTB': [],
                'FTB': []
            }
            for window in query_melody_in_windows:
                query_vectors['ATB'].append(get_normalized_ATB(window))
                query_vectors['RTB'].append(get_normalized_RTB(window))
                query_vectors['FTB'].append(get_normalized_FTB(window))
    return query_vectors

# 2) Fungsi menghitung similaritas
def calculate_similarity(query_vectors, audio_vectors, weights=None):
    if weights is None:
        weights = {'ATB': 1.0, 'RTB': 1.0, 'FTB': 1.0}

    similarities = []
    for tone_type in ['ATB', 'RTB', 'FTB']:
        query_matrix = np.array(query_vectors[tone_type])  # Matriks query (window x fitur)
        audio_matrix = np.array(audio_vectors[tone_type])  # Matriks audio (window x fitur)
        
        # Cosine Similarity: Dot product dibagi dengan norm
        dot_product = np.dot(query_matrix, audio_matrix.T)  # Semua pasangan
        query_norms = np.linalg.norm(query_matrix, axis=1, keepdims=True)
        audio_norms = np.linalg.norm(audio_matrix, axis=1, keepdims=True).T
        cosine_similarities = dot_product / (query_norms * audio_norms + 1e-9)  # Avoid division by zero

        # Ambil similaritas maksimum untuk setiap query window
        max_similarities = np.max(cosine_similarities, axis=1)
        avg_tone_similarity = np.mean(max_similarities)  # Rata-rata
        similarities.append(weights[tone_type] * avg_tone_similarity)

    # Total similarity
    total_similarity = sum(similarities) / sum(weights.values())
    return total_similarity


# 4) Fungsi search
def search(query_vectors, dataset, threshold, weights=None):
    results = []
    for audio in dataset:
        audio_name = audio[0]
        audio_vectors = audio[1]

        # menghitung similarity
        similarity = calculate_similarity(query_vectors, audio_vectors, weights)

        if similarity >= threshold:
            results.append((audio_name, similarity))
        
    results.sort(key=lambda x: x[1], reverse=True)
    return results
    

# query path
query_path = r"C:\Users\Mahesa\OneDrive\ITB\Coding\College\IF\Smt-3\Aljabar Linear dan Geometri\Tubes 2\Algeo02-23139\test"

# main
def main():
    # Check if preprocessed data exists
    if os.path.exists(f"{PROCESSED_PATH}/processed_midi.npz"):
        logging.info("Loading preprocessed MIDI data...")
        data = np.load(f"{PROCESSED_PATH}/processed_midi.npz", allow_pickle=True)
        dataset = data['dataset']
        logging.info(f"Loaded {len(dataset)} preprocessed MIDI files")
    else:
        logging.info("No preprocessed data found. Processing MIDI files...")
        dataset = preprocess_midi_dataset(DATABASE_PATH)
        if not dataset:
            logging.error("No MIDI files processed. Exiting program.")
            return

    # Process query
    logging.info("Processing query...")
    query_vectors = process_query(query_path)
    if not query_vectors:
        logging.error("Query processing failed. Exiting program.")
        return
    
    # Search for matches
    logging.info("Searching for matches...")
    threshold = 0.9
    results = search(query_vectors, dataset, threshold)
    
    # Display results
    if results:
        print("\nSearch Results:")
        for rank, (song_name, similarity) in enumerate(results, start=1):
            print(f"{rank}. {song_name}: {similarity * 100:.2f}% similarity")
    else:
        print("\nNo matches found above the threshold.")

if __name__ == "__main__":
    main()