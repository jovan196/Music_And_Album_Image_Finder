/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState } from "react";
import localFont from "next/font/local";
import SideBar from "../components/sidebar";
import HasilBar from "../components/hasilbar";
import Page from "../app/page";
import "./globals.css";
import axios from "axios";
import React from 'react';
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const futura = localFont({
  src: "./fonts/Futura Light font.ttf",
  variable: "--font-futura",
  weight: "100 900",
});
const archivoblack = localFont({
  src: "./fonts/ArchivoBlack-Regular.ttf",
  variable: "--font-futura",
  weight: "100 900",
});
const livvic = localFont({
  src: "./fonts/Livvic-ExtraLight.ttf",
  variable: "--font-livvic",
  weight: "100 900",
});
const livvicreg = localFont({
  src: "./fonts/Livvic-Regular.ttf",
  variable: "--font-livvicreg",
  weight: "100 900",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      const response = await axios.post(`/api/upload?endpoint=${endpoint}`, formData);
      setSimilarItems(response.data.similar_items || []);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err instanceof Error ? err.message : "Error uploading file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${futura.variable} ${archivoblack.variable} ${livvic.variable} ${livvicreg.variable} antialiased`}>
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
            <div className="absolute inset-0 -z-10">
              <Page />
            </div>
            <div className="relative flex min-h-screen flex-col">
              <HasilBar
                selectedFile={selectedFile}
                selectedZip={selectedZip}
                similarItems={similarItems}
                isLoading={isLoading}
                error={error}
              />
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}