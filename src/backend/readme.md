Berikut adalah langkah-langkah untuk menjalankan backend `finder.py`.

# Persiapan

## Aplikasi yang diperlukan

1. **Python**: Python (versi 3.6 atau lebih baru).
2. **pip**: Python Install Package

## Langkah-langkah

1. **Clone Repository**:
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Buat Virtual Environment** (opsional tapi direkomendasikan):
   ```sh
   python -m venv venv
   source venv/bin/activate  # Pada Windows gunakan `venv\Scripts\activate`
   ```

3. **Instal Dependensi**:
   Pastikan Anda berada di direktori yang sama dengan file `requirements.txt`, lalu jalankan:
   ```sh
   pip install -r requirements.txt
   ```

## Menjalankan Backend

1. **Masuk ke Direktori Backend**:
   ```sh
   cd src/backend
   ```

2. **Jalankan Aplikasi Flask**:
   ```sh
   python finder.py
   ```

3. **Akses Aplikasi**:
   Buka browser dan akses `http://localhost:5000` untuk melihat aplikasi berjalan.

## Informasi Tambahan

- **Path Database**:
  - Gambar: `./database/images`
  - Dataset MIDI: `./database/midi_dataset`
  - Data yang Diproses: `./processed`

- **Logging**:
  - Level logging diatur ke `INFO` untuk menampilkan informasi log.
