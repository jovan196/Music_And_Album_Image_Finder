import React, { useState } from 'react';
import axios from 'axios';
import HasilBar from './hasilbar';

interface SimilarItem {
  url: string;
  label: string;
  distance?: number;
  similarity?: number;
  associated_midi?: string;
  associated_image?: string;
}

interface SideBarProps {
  onFileSelect: (file: File | null) => void;
  onZipSelect: (file: File | null) => void;
  onMidiSelect: (file: File | null) => void;
  onMidiZipSelect: (file: File | null) => void;
  onMapperSelect: (file: File | null) => void;
  onUpload: (file: File) => void;
  onMidiUpload: (file: File) => void;
  isLoading: boolean;
  uploadedFileUrl: string;
  setUploadedFileUrl: (url: string) => void;
}

export default function SideBar({
  onFileSelect,
  onZipSelect,
  onMidiSelect,
  onMidiZipSelect,
  onMapperSelect,
  onUpload,
  onMidiUpload,
  isLoading,
  uploadedFileUrl,
  setUploadedFileUrl,
}: SideBarProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedZip, setSelectedZip] = useState<File | null>(null);
  const [selectedMidi, setSelectedMidi] = useState<File | null>(null);
  const [selectedMidiZip, setSelectedMidiZip] = useState<File | null>(null);
  const [selectedMapper, setSelectedMapper] = useState<File | null>(null);
  const [uploadedZipName, setUploadedZipName] = useState<string | null>(null);
  const [uploadedMidiZipName, setUploadedMidiZipName] = useState<string | null>(null);
  const [uploadedMapperName, setUploadedMapperName] = useState<string | null>(null);
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadedFileUrl(file ? URL.createObjectURL(file) : "");
    onFileSelect(file);
  };

  const handleZipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedZip(file);
    setUploadedZipName(file ? file.name : null);
    onZipSelect(file);
  };

  const handleMidiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedMidi(file);
    onMidiSelect(file);
  };

  const handleMidiZipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedMidiZip(file);
    setUploadedMidiZipName(file ? file.name : null);
    onMidiZipSelect(file);
  };

  const handleMapperChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedMapper(file);
    setUploadedMapperName(file ? file.name : null);
    onMapperSelect(file);
  };

  const handleUploadClick = async () => {
    if (selectedFile) {
      setIsLoadingState(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setSimilarItems(response.data.similarItems);
      } catch (error) {
        console.error("Error fetching similar items:", error);
        setError("Error fetching similar items. Please try again.");
      } finally {
        setIsLoadingState(false);
      }
    } else {
      alert("Please select a file first!");
    }
  };

  const handleMidiUploadClick = async () => {
    if (selectedMidi) {
      setIsLoadingState(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('midi', selectedMidi);

        const response = await axios.post('/api/upload-midi', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setSimilarItems(response.data.similarItems);
      } catch (error) {
        console.error("Error fetching similar items:", error);
        setError("Error fetching similar items. Please try again.");
      } finally {
        setIsLoadingState(false);
      }
    } else {
      alert("Please select a MIDI file first!");
    }
  };

  return (
    <div className="flex">
      <nav className="fixed left-0 top-0 z-50 h-screen w-[300px] bg-black bg-opacity-100 flex flex-col justify-start items-center">
        <h1 className="text-white text-4xl font-[family-name:var(--font-futura)] flex items-center">
          <img src="/SkyGliders3.jpg" alt="Logo" width={200} height={50} className="mr-2" />
          {/* Audio Searcher */}
        </h1>
        <div className="min-h-screen bg-cover bg-center bg-black bg-no-repeat bg-fixed">
          <div className="max-w-4xl mx-auto py-8 sm:px-4 lg:px-6">
            <div className="px-2 py-4 sm:px-0">
              <div className="flex flex-col items-center">
                <div className="w-full max-w-sm space-y-4">
                  
                  {/* Upload Single Image */}
                  <div className="mb-2 mt-2">
                    {uploadedFileUrl && (
                      <div className="flex justify-center">
                        <img
                          src={uploadedFileUrl}
                          alt="Uploaded Preview"
                          className="w-20 h-20 object-cover rounded-xl shadow-lg"
                        />
                      </div>
                    )}
                    <label
                      htmlFor="file-upload"
                      className="block text-xs font-extrabold text-gray-700 text-center"
                    >
                      {selectedFile ? selectedFile.name : "Upload Picture"}
                    </label>
                    <div className="relative">
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="block w-full font-bold text-xs text-white mt-1 bg-black py-1 px-2 rounded-full border border-white text-center">
                        Upload Picture
                      </div>
                    </div>
                    <button
                      onClick={handleUploadClick}
                      disabled={isLoadingState}
                      className={`w-full py-2 px-3 rounded-lg text-white mt-1 font-bold shadow-lg transform transition-transform ${
                        isLoadingState
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-black hover:bg-gray-900 hover:scale-105"
                      }`}
                    >
                      {isLoadingState ? "Mengupload..." : "Search"}
                    </button>
                  </div>

                  {/* Upload Single Audio */}
                  <div className="mb-2 mt-2">
                    <label
                      htmlFor="midi-upload"
                      className="block text-xs font-extrabold text-gray-700 text-center"
                    >
                      {selectedMidi ? selectedMidi.name : "Unggah File Audio"}
                    </label>
                    <div className="relative">
                      <input
                        id="midi-upload"
                        type="file"
                        onChange={handleMidiChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="block w-full font-bold text-xs text-white mt-1 bg-black py-1 px-2 rounded-full border border-white text-center">
                        Upload Audio
                      </div>
                    </div>
                    <button
                      onClick={handleMidiUploadClick}
                      disabled={isLoadingState}
                      className={`w-full py-2 px-3 rounded-lg text-white mt-1 font-bold shadow-lg transform transition-transform ${
                        isLoadingState
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-black hover:bg-gray-900 hover:scale-105"
                      }`}
                    >
                      {isLoadingState ? "Mengupload..." : "Search"}
                    </button>
                  </div>
                  {/* Upload Zip File */}
                  <div className="mb-10 mt-10">
                    <label
                      htmlFor="zip-upload"
                      className="block text-xl font-extrabold text-gray-700 text-center"
                    >
                      {/* Unggah Zip Gambar */}
                    </label>
                    <button
                      className={`w-full py-2 px-3 rounded-lg text-white font-bold shadow-lg transform transition-transform ${
                        isLoadingState
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-purple-950 hover:bg-purple-900 hover:scale-105"
                      }`}
                    >
                      <input
                        id="zip-upload"
                        type="file"
                        onChange={handleZipChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      Picture
                    </button>
                  </div>
                  
                  {/* Upload Zip Audio */}
                  <div className="mb-2 mt-2">
                    <label
                      htmlFor="midi-zip-upload"
                      className="block text-xl font-extrabold text-gray-700 text-center"
                    >
                      {/* Unggah Zip Audio */}
                    </label>
                    <button
                      className={`w-full py-2 px-3 rounded-lg text-white font-bold shadow-lg transform transition-transform ${
                        isLoadingState
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-purple-950 hover:bg-purple-900 hover:scale-105"
                      }`}
                    >
                      <input
                        id="midi-zip-upload"
                        type="file"
                        onChange={handleMidiZipChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      Audio
                    </button>
                  </div>

                  {/* Upload Mapper File */}
                  <div className="mb-2 mt-2">
                    <label
                      htmlFor="mapper-upload"
                      className="block text-xl font-extrabold text-gray-700 text-center"
                    >
                      {/* Unggah File Mapper */}
                    </label>
                    <button
                      className={`w-full py-2 px-3 rounded-lg text-white font-bold shadow-lg transform transition-transform ${
                        isLoadingState
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-purple-950 hover:bg-purple-900 hover:scale-105"
                      }`}
                    >
                      <input
                        id="mapper-upload"
                        type="file"
                        onChange={handleMapperChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      Mapper
                    </button>
                  </div>
                  
                  <div className="mt-2 font-bold text-base text-white text-center">
                    File Gambar : {uploadedZipName || "No File"}
                  </div>
                  <div className="mt-2 font-bold text-base text-white text-center">
                    File Audio : {uploadedMidiZipName || "No File"}
                  </div>
                  <div className="mt-2 font-bold text-base text-white text-center">
                    File Mapper : {uploadedMapperName || "No File"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <HasilBar
        selectedFile={selectedFile}
        selectedZip={selectedZip}
        similarItems={similarItems}
        isLoading={isLoadingState}
        error={error}
      />
    </div>
  );
}