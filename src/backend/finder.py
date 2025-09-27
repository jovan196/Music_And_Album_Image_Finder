import logging
import os

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from image_components import (
    handle_image_upload,
    handle_image_zip_upload,
    initialize_image_components,
)
from midi_components import (
    handle_midi_upload,
    handle_midi_zip_upload,
    initialize_midi_components,
)
from utility import (
    DATABASE_PATH_IMAGES,
    DATABASE_PATH_MIDI,
    MAPPER_PATH,
    delete_files_in_directory,
    ensure_directories,
    load_mapper,
)

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

ALLOW_DB_UPDATE = os.getenv("ALLOW_DB_UPDATE", "false").lower() in ("true", "1", "yes")

ensure_directories()
mapper = load_mapper()
initialize_image_components()
initialize_midi_components()


@app.route("/finder/upload", methods=["POST"])
def upload_image():
    uploaded_file = request.files.get("file")
    if not uploaded_file:
        return jsonify({"message": "No file uploaded"}), 400

    return handle_image_upload(uploaded_file, mapper, request)


@app.route("/finder/upload-zip", methods=["POST"])
def upload_image_zip():
    if not ALLOW_DB_UPDATE:
        return jsonify({"message": "Image database updates are disabled."}), 403
    uploaded_file = request.files.get("file")
    if not uploaded_file:
        return jsonify({"message": "No file uploaded"}), 400

    return handle_image_zip_upload(uploaded_file)


@app.route("/finder/upload-mid", methods=["POST"])
def upload_midi():
    uploaded_file = request.files.get("file")
    if not uploaded_file:
        return jsonify({"message": "No file uploaded"}), 400

    return handle_midi_upload(uploaded_file, mapper, request)


@app.route("/finder/upload-mid-zip", methods=["POST"])
def upload_midi_zip():
    if not ALLOW_DB_UPDATE:
        return jsonify({"message": "MIDI database updates are disabled."}), 403
    uploaded_file = request.files.get("file")
    if not uploaded_file:
        return jsonify({"message": "No file uploaded"}), 400

    return handle_midi_zip_upload(uploaded_file)


@app.route("/finder/upload-mapper", methods=["POST"])
def upload_mapper():
    global mapper

    if not ALLOW_DB_UPDATE:
        return jsonify({"message": "Mapper updates are disabled."}), 403

    uploaded_file = request.files.get("file")
    if not uploaded_file:
        return jsonify({"message": "No mapper file uploaded"}), 400

    delete_files_in_directory(MAPPER_PATH)
    mapper_path = os.path.join(MAPPER_PATH, "mapper.json")
    uploaded_file.save(mapper_path)
    mapper = load_mapper()

    return jsonify({"message": "Mapper uploaded successfully."})


@app.route("/finder/images/<path:filename>")
def serve_image(filename):
    return send_from_directory(DATABASE_PATH_IMAGES, filename)


@app.route("/finder/midi/<path:filename>")
def serve_midi(filename):
    return send_from_directory(DATABASE_PATH_MIDI, filename)


if __name__ == "__main__":
    app.run(debug=True)