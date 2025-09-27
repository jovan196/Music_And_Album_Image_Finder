"use client";

import { useState } from "react";
import SideBar from "../components/sidebar";
import HasilBar from "../components/hasilbar";
import axios from "axios";
import React from 'react';

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

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedZip, setSelectedZip] = useState<File | null>(null);
  const [selectedMidi, setSelectedMidi] = useState<File | null>(null);
  const [selectedMidiZip, setSelectedMidiZip] = useState<File | null>(null);
  const [selectedMapper, setSelectedMapper] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File, endpoint: string) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      const response = await axios.post(`/api/${endpoint}`, formData);
      setSimilarItems(response.data.similar_items || []);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err instanceof Error ? err.message : "Error uploading file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SideBar
        onFileSelect={setSelectedFile}
        onZipSelect={setSelectedZip}
        onMidiSelect={setSelectedMidi}
        onMidiZipSelect={setSelectedMidiZip}
        onMapperSelect={setSelectedMapper}
        onUpload={(file) => handleUpload(file, 'upload')}
        onMidiUpload={(file) => handleUpload(file, 'upload-mid')}
        isLoading={isLoading}
        uploadedFileUrl={uploadedFileUrl}
        setUploadedFileUrl={setUploadedFileUrl}
      />
      <div className="relative flex-1">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: 'url(/tubesalgeo2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="relative flex min-h-screen flex-col">
          <HasilBar
            selectedFile={selectedFile}
            selectedZip={selectedZip}
            similarItems={similarItems}
            isLoading={isLoading}
            error={error}
          />
          <main className="flex-1"></main>
        </div>
      </div>
    </div>
  );
}