/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import axios from 'axios';

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
    <aside className="w-full bg-black bg-opacity-100 text-white shadow-lg md:w-[300px] md:flex-shrink-0">
      <div className="flex flex-col md:sticky md:top-0 md:h-screen">
        {/* Logo/Header */}
        <div className="flex-shrink-0 p-4 flex justify-center">
          <h1 className="text-white text-4xl font-[family-name:var(--font-futura)] flex items-center">
            <img src="/SkyGliders3.jpg" alt="Logo" width={200} height={50} className="mr-2" />
          </h1>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="mx-auto flex w-full max-w-sm flex-col items-center space-y-4">
            {/* Upload Single Image */}
            <div className="mb-2 mt-2 w-full">
              {uploadedFileUrl && (
                <div className="flex justify-center">
                  <img
                    src={uploadedFileUrl}
                    alt="Uploaded Preview"
                    className="h-20 w-20 rounded-xl object-cover shadow-lg"
                  />
                </div>
              )}
              <label
                htmlFor="file-upload"
                className="mt-2 block text-center text-xs font-extrabold text-gray-300"
              >
                {selectedFile ? selectedFile.name : "Upload Picture"}
              </label>
              <div className="relative">
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="mt-1 block w-full rounded-full border border-white bg-black py-1 px-2 text-center text-xs font-bold text-white">
                  Upload Picture
                </div>
              </div>
              <button
                onClick={handleUploadClick}
                disabled={isLoadingState}
                className={`mt-1 w-full transform rounded-lg px-3 py-2 text-white shadow-lg transition-transform ${
                  isLoadingState
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-black hover:scale-105 hover:bg-gray-900"
                }`}
              >
                {isLoadingState ? "Mengupload..." : "Search"}
              </button>
            </div>

            {/* Upload Single Audio */}
            <div className="mb-2 mt-2 w-full">
              <label
                htmlFor="midi-upload"
                className="block text-center text-xs font-extrabold text-gray-300"
              >
                {selectedMidi ? selectedMidi.name : "Unggah File Audio"}
              </label>
              <div className="relative">
                <input
                  id="midi-upload"
                  type="file"
                  onChange={handleMidiChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="mt-1 block w-full rounded-full border border-white bg-black py-1 px-2 text-center text-xs font-bold text-white">
                  Upload Audio
                </div>
              </div>
              <button
                onClick={handleMidiUploadClick}
                disabled={isLoadingState}
                className={`mt-1 w-full transform rounded-lg px-3 py-2 text-white shadow-lg transition-transform ${
                  isLoadingState
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-black hover:scale-105 hover:bg-gray-900"
                }`}
              >
                {isLoadingState ? "Mengupload..." : "Search"}
              </button>
            </div>

            {/* Upload Zip File */}
            <div className="mb-2 mt-2 w-full">
              <label
                htmlFor="zip-upload"
                className="block text-center text-xs font-extrabold text-white"
              >
                {selectedZip ? selectedZip.name : "Upload Image Database"}
              </label>
              <div className="relative">
                <input
                  id="zip-upload"
                  type="file"
                  accept=".zip"
                  onChange={handleZipChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="mt-1 block w-full rounded-full border border-white bg-black py-1 px-2 text-center text-xs font-bold text-white">
                  Choose ZIP File
                </div>
              </div>
              <button
                onClick={handleZipUploadClick}
                disabled={isLoadingState}
                className={`mt-1 w-full transform rounded-lg px-3 py-2 text-white shadow-lg transition-transform ${
                  isLoadingState
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-purple-950 hover:scale-105 hover:bg-purple-900"
                }`}
              >
                {isLoadingState ? "Uploading..." : "Update Image Database"}
              </button>
            </div>

            {/* Upload Zip Audio */}
            <div className="mb-2 mt-2 w-full">
              <label
                htmlFor="midi-zip-upload"
                className="block text-center text-xs font-extrabold text-white"
              >
                {selectedMidiZip ? selectedMidiZip.name : "Upload Audio Database"}
              </label>
              <div className="relative">
                <input
                  id="midi-zip-upload"
                  type="file"
                  accept=".zip"
                  onChange={handleMidiZipChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="mt-1 block w-full rounded-full border border-white bg-black py-1 px-2 text-center text-xs font-bold text-white">
                  Choose ZIP File
                </div>
              </div>
              <button
                onClick={handleMidiZipUploadClick}
                disabled={isLoadingState}
                className={`mt-1 w-full transform rounded-lg px-3 py-2 text-white shadow-lg transition-transform ${
                  isLoadingState
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-purple-950 hover:scale-105 hover:bg-purple-900"
                }`}
              >
                {isLoadingState ? "Uploading..." : "Update Audio Database"}
              </button>
            </div>

            {/* Upload Mapper File */}
            <div className="mb-2 mt-2 w-full">
              <label
                htmlFor="mapper-upload"
                className="block text-center text-xs font-extrabold text-white"
              >
                {selectedMapper ? selectedMapper.name : "Upload Mapper File"}
              </label>
              <div className="relative">
                <input
                  id="mapper-upload"
                  type="file"
                  accept=".json"
                  onChange={handleMapperChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="mt-1 block w-full rounded-full border border-white bg-black py-1 px-2 text-center text-xs font-bold text-white">
                  Choose JSON File
                </div>
              </div>
              <button
                onClick={handleMapperUploadClick}
                disabled={isLoadingState}
                className={`mt-1 w-full transform rounded-lg px-3 py-2 text-white shadow-lg transition-transform ${
                  isLoadingState
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-purple-950 hover:scale-105 hover:bg-purple-900"
                }`}
              >
                {isLoadingState ? "Uploading..." : "Update Mapper"}
              </button>
            </div>

            <div className="mt-2 w-full rounded-lg bg-black/40 p-3 text-center text-sm">
              <p className="font-bold">File Gambar : {uploadedZipName || "No File"}</p>
              <p className="font-bold">File Audio : {uploadedMidiZipName || "No File"}</p>
              <p className="font-bold">File Mapper : {uploadedMapperName || "No File"}</p>
            </div>
            {error && (
              <div className="w-full rounded-lg bg-red-600/80 p-2 text-center text-xs font-semibold text-white shadow">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}