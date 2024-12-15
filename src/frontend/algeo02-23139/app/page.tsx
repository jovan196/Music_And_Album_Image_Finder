"use client"; // Enable client-side rendering

// Why doesn't "use client" needed for page routing?
// Because the routing is handled by the server, not the client.

// How about app routing?
// The app routing is handled by the client, so "use client" is needed.

import { useState } from "react";
import axios from "axios";

interface SimilarItem {
  url: string;
  label: string;
  distance?: number;
  similarity?: number;
  associated_midi?: string;
  associated_image?: string;
}

const PCA: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedZip, setSelectedZip] = useState<File | null>(null);
  const [selectedMidi, setSelectedMidi] = useState<File | null>(null);
  const [selectedMidiZip, setSelectedMidiZip] = useState<File | null>(null);
  const [selectedMapper, setSelectedMapper] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadedFileUrl(URL.createObjectURL(file));
    }
  };

  const handleZipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedZip(file);
    }
  };

  const handleMidiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedMidi(file);
    }
  };

  const handleMidiZipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedMidiZip(file);
    }
  };

  const handleMapperChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedMapper(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsLoading(true);
      const response = await axios.post(`/api/upload?endpoint=upload`, formData);
      setSimilarItems(response.data.similar_items);
    } catch (error) {
      console.error("Error uploading file:", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMidiUpload = async () => {
    if (!selectedMidi) {
      alert("Please select a MIDI file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedMidi);

    try {
      setIsLoading(true);
      const response = await axios.post(`/api/upload?endpoint=upload-mid`, formData);
      setSimilarItems(response.data.similar_items);
    } catch (error) {
      console.error("Error uploading MIDI file:", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipUpload = async () => {
    if (!selectedZip) {
      alert("Please select a zip file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedZip);

    try {
      setIsLoading(true);
      await axios.post(`/api/upload?endpoint=upload-zip`, formData);
      alert("Image database updated successfully!");
    } catch (error) {
      console.error("Error uploading zip file:", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMidiZipUpload = async () => {
    if (!selectedMidiZip) {
      alert("Please select a MIDI zip file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedMidiZip);

    try {
      setIsLoading(true);
      await axios.post(`/api/upload?endpoint=upload-mid-zip`, formData);
      alert("MIDI database updated successfully!");
    } catch (error) {
      console.error("Error uploading MIDI zip file:", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapperUpload = async () => {
    if (!selectedMapper) {
      alert("Please select a mapper file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedMapper);

    try {
      setIsLoading(true);
      await axios.post(`/api/upload?endpoint=upload-mapper`, formData);
      alert("Mapper updated successfully!");
    } catch (error) {
      console.error("Error uploading mapper file:", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="max-w-4xl mx-auto py-10 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md space-y-6">
              {/* Upload Single Image */}
              <div className="mb-4">
                <label
                  htmlFor="file-upload"
                  className="block text-2xl font-extrabold text-gray-700 text-center"
                >
                  Unggah Gambar
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 mt-2 
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border
                    file:border-gray-300
                    file:text-sm file:font-medium
                    file:bg-blue-100 file:text-blue-700
                    hover:file:bg-blue-200 focus:outline-none"
                />
              </div>
  
              {uploadedFileUrl && (
                <div className="flex justify-center">
                  <img
                    src={uploadedFileUrl}
                    alt="Uploaded Preview"
                    className="w-64 h-64 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
  
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-bold shadow-lg transform transition-transform ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                }`}
              >
                {isLoading ? "Mengupload..." : "Cari Gambar Mirip"}
              </button>
            </div>
  
            {/* Upload Zip */}
            <div className="w-full max-w-md space-y-6 mt-8">
              <div className="mb-4">
                <label
                  htmlFor="zip-upload"
                  className="block text-2xl font-extrabold text-gray-700 text-center"
                >
                  Unggah Kumpulan Gambar (Zip)
                </label>
                <input
                  id="zip-upload"
                  type="file"
                  onChange={handleZipChange}
                  className="block w-full text-sm text-gray-500 mt-2 
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border
                    file:border-gray-300
                    file:text-sm file:font-medium
                    file:bg-blue-100 file:text-blue-700
                    hover:file:bg-blue-200 focus:outline-none"
                />
              </div>
              <button
                onClick={handleZipUpload}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-bold shadow-lg transform transition-transform ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                }`}
              >
                {isLoading ? "Mengupload..." : "Unggah Kumpulan Gambar"}
              </button>
            </div>
          </div>
  
          {/* MIDI Search */}
          <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4">MIDI Search</h2>
            <input
              type="file"
              accept=".mid"
              onChange={handleMidiChange}
              className="block w-full mb-4"
            />
            <button
              onClick={handleMidiUpload}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg"
            >
              Search Similar MIDI
            </button>
          </div>
  
          {/* Update Databases */}
          <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4">Update Databases</h2>
  
            {/* Update MIDI Database */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Update MIDI Database</h3>
              <input
                type="file"
                accept=".zip"
                onChange={handleMidiZipChange}
                className="block w-full mb-2"
              />
              <button
                onClick={handleMidiZipUpload}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg"
              >
                Upload MIDI ZIP
              </button>
            </div>
  
            {/* Update Mapper */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Update Mapper</h3>
              <input
                type="file"
                accept=".json"
                onChange={handleMapperChange}
                className="block w-full mb-2"
              />
              <button
                onClick={handleMapperUpload}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg"
              >
                Upload Mapper
              </button>
            </div>
          </div>
  
          {/* Similar Items */}
          {similarItems.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                Similar Items
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {similarItems.map((item, index) => (
                  <div
                    key={index}
                    className="relative group bg-white rounded-lg overflow-hidden shadow-lg p-4"
                  >
                    {item.url.endsWith('.mid') ? (
                      <div className="flex items-center justify-center h-48 bg-gray-200">
                        <p className="text-lg font-semibold text-gray-700">MIDI File</p>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="mt-2">
                      <p className="font-semibold">{item.label}</p>
                      {item.distance !== undefined && (
                        <p>Distance: {item.distance.toFixed(2)}</p>
                      )}
                      {item.similarity !== undefined && (
                        <p>Similarity: {item.similarity.toFixed(2)}</p>
                      )}
                      <div className="mt-2 space-x-2">
                        {item.associated_midi && (
                          <a
                            href={item.associated_midi}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download MIDI
                          </a>
                        )}
                        {item.associated_image && (
                          <a
                            href={item.associated_image}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Image
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {similarItems.length === 0 && uploadedFileUrl && !isLoading && (
            <p className="text-center text-gray-600 mt-8 text-lg">
              Tidak ada item mirip yang ditemukan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}  

export default PCA;