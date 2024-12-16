Berikut adalah langkah-langkah untuk menjalankan backend `finder.py`.
```markdown
# Setup

## Aplikasi yang diperlukan

1. **Python**: Python (versi 3.6 atau lebih baru).
2. **pip**: Python Install Package

## Step-by-Step

1. **Clone Repository**:
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Create Virtual Environment** (optional but recommended):
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install Dependencies**:
   Pastikan Anda berada di direktori yang sama dengan file `modules.txt`, lalu jalankan:
   ```sh
   pip install -r modules.txt
   ```

## Running the Backend

1. **Navigate to Backend Directory**:
   ```sh
   cd src/backend
   ```

2. **Run the Flask Application**:
   ```sh
   python finder.py
   ```

3. **Access the Application**:
   Buka browser dan akses `http://localhost:5000` untuk melihat aplikasi berjalan.

## Additional Information

- **Database Paths**:
  - Images: `./database/images`
  - MIDI Dataset: `./database/midi_dataset`
  - Processed Data: `./processed`

- **Logging**:
  - Logging level diatur ke `INFO` untuk menampilkan informasi log.
