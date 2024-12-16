import { useState, useEffect } from "react";
import React from 'react';
import axios from "axios";

interface SimilarItem {
  url: string;
  label: string;
  distance?: number;
  similarity?: number;
  associated_midi?: string;
  associated_image?: string;
}

interface HasilBarProps {
  selectedFile: File | null;
  selectedZip: File | null;
  similarItems: SimilarItem[];
  isLoading: boolean;
  error: string | null;
}

export default function HasilBar({ selectedFile, selectedZip, similarItems, isLoading, error }: HasilBarProps) {
  const hasUploads = selectedFile || selectedZip || similarItems.length > 0;

  return (
    <div className="fixed right-0 top-0 z-50 h-screen w-4/5 bg-transparent flex flex-col justify-start items-left">
        {!hasUploads && (
          <h2 className="text-center text-gray-600 mt-8 text-lg">Belum mengupload</h2>
        )}
        {error && (
          <p className="text-center text-red-600 mt-8 text-lg">{error}</p>
        )}
        {isLoading && (
          <p className="text-center text-gray-600 mt-8 text-lg">Loading...</p>
        )}
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
    </div>
  );
}