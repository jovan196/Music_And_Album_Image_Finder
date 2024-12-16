/* eslint-disable @typescript-eslint/no-unused-vars */

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
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
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
        await onUpload(selectedFile); // Use the onUpload function
      } catch (error) {
        console.error("Error uploading file:", error);
        setError(error instanceof Error ? error.message : "Error uploading file");
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
        await onMidiUpload(selectedMidi); // Use the onMidiUpload function
      } catch (error) {
        console.error("Error uploading MIDI:", error);
        setError(error instanceof Error ? error.message : "Error uploading MIDI file");
      } finally {
        setIsLoadingState(false);
      }
    } else {
      alert("Please select a MIDI file first!");
    }
  };

  const handleZipUploadClick = async () => {
    if (selectedZip) {
      setIsLoadingState(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('file', selectedZip);
        await axios.post('/api/upload?endpoint=upload-zip', formData);
        alert('Image database updated successfully!');
      } catch (error) {
        console.error("Error uploading ZIP:", error);
        setError(error instanceof Error ? error.message : "Error uploading ZIP");
      } finally {
        setIsLoadingState(false);
      }
    } else {
      alert("Please select a ZIP file first!");
    }
  };

  const handleMidiZipUploadClick = async () => {
    if (selectedMidiZip) {
      setIsLoadingState(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('file', selectedMidiZip);
        await axios.post('/api/upload?endpoint=upload-mid-zip', formData);
        alert('MIDI database updated successfully!');
      } catch (error) {
        console.error("Error uploading MIDI ZIP:", error);
        setError(error instanceof Error ? error.message : "Error uploading MIDI ZIP");
      } finally {
        setIsLoadingState(false);
      }
    } else {
      alert("Please select a MIDI ZIP file first!");
    }
  };

  const handleMapperUploadClick = async () => {
    if (selectedMapper) {
      setIsLoadingState(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('file', selectedMapper);
        await axios.post('/api/upload?endpoint=upload-mapper', formData);
        alert('Mapper updated successfully!');
      } catch (error) {
        console.error("Error uploading mapper:", error);
        setError(error instanceof Error ? error.message : "Error uploading mapper");
      } finally {
        setIsLoadingState(false);
      }
    } else {
      alert("Please select a mapper file first!");
    }
  };

  return (
    <div className="flex">
      <nav className="fixed left-0 top-0 z-50 h-screen w-[300px] bg-black bg-opacity-100 flex flex-col overflow-hidden">
        {/* Logo/Header - stays fixed */}
        <div className="flex-shrink-0 p-4">
          <h1 className="text-white text-4xl font-[family-name:var(--font-futura)] flex items-center">
            <img src="/SkyGliders3.jpg" alt="Logo" width={200} height={50} className="mr-2" />
          </h1>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
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
                <div className="mb-2 mt-2">
                  <label
                    htmlFor="zip-upload"
                    className="block text-xs font-extrabold text-white text-center"
                  >
                    {selectedZip ? selectedZip.name : "Upload Image Database"}
                  </label>
                  <div className="relative">
                    <input
                      id="zip-upload"
                      type="file"
                      accept=".zip"
                      onChange={handleZipChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="block w-full font-bold text-xs text-white mt-1 bg-black py-1 px-2 rounded-full border border-white text-center">
                      Choose ZIP File
                    </div>
                  </div>
                  <button
                    onClick={handleZipUploadClick}
                    disabled={isLoadingState}
                    className={`w-full py-2 px-3 rounded-lg text-white mt-1 font-bold shadow-lg transform transition-transform ${
                      isLoadingState
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-950 hover:bg-purple-900 hover:scale-105"
                    }`}
                  >
                    {isLoadingState ? "Uploading..." : "Update Image Database"}
                  </button>
                </div>

                {/* Upload Zip Audio */}
                <div className="mb-2 mt-2">
                  <label
                    htmlFor="midi-zip-upload"
                    className="block text-xs font-extrabold text-white text-center"
                  >
                    {selectedMidiZip ? selectedMidiZip.name : "Upload Audio Database"}
                  </label>
                  <div className="relative">
                    <input
                      id="midi-zip-upload"
                      type="file"
                      accept=".zip"
                      onChange={handleMidiZipChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="block w-full font-bold text-xs text-white mt-1 bg-black py-1 px-2 rounded-full border border-white text-center">
                      Choose ZIP File
                    </div>
                  </div>
                  <button
                    onClick={handleMidiZipUploadClick}
                    disabled={isLoadingState}
                    className={`w-full py-2 px-3 rounded-lg text-white mt-1 font-bold shadow-lg transform transition-transform ${
                      isLoadingState
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-950 hover:bg-purple-900 hover:scale-105"
                    }`}
                  >
                    {isLoadingState ? "Uploading..." : "Update Audio Database"}
                  </button>
                </div>

                {/* Upload Mapper File */}
                <div className="mb-2 mt-2">
                  <label
                    htmlFor="mapper-upload"
                    className="block text-xs font-extrabold text-white text-center"
                  >
                    {selectedMapper ? selectedMapper.name : "Upload Mapper File"}
                  </label>
                  <div className="relative">
                    <input
                      id="mapper-upload"
                      type="file"
                      accept=".json"
                      onChange={handleMapperChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="block w-full font-bold text-xs text-white mt-1 bg-black py-1 px-2 rounded-full border border-white text-center">
                      Choose JSON File
                    </div>
                  </div>
                  <button
                    onClick={handleMapperUploadClick}
                    disabled={isLoadingState}
                    className={`w-full py-2 px-3 rounded-lg text-white mt-1 font-bold shadow-lg transform transition-transform ${
                      isLoadingState
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-950 hover:bg-purple-900 hover:scale-105"
                    }`}
                  >
                    {isLoadingState ? "Uploading..." : "Update Mapper"}
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