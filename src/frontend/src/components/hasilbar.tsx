import { useState, useEffect } from "react";
import React from 'react';
import axios from "axios";

// Update the SimilarItem interface to match the backend response
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

interface HasilBarProps {
  selectedFile: File | null;
  selectedZip: File | null;
  similarItems?: SimilarItem[]; // Make it optional
  isLoading: boolean;
  error: string | null;
}

export default function HasilBar({ 
  selectedFile, 
  selectedZip, 
  similarItems = [], // Add default empty array
  isLoading, 
  error 
}: HasilBarProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter valid items with similarity between 0 and 1 (0-100%)
  const validSimilarItems = similarItems.filter(
    item => item.similarity !== undefined && 
    item.similarity >= 0 && 
    item.similarity <= 1
  );

  const hasUploads = selectedFile || selectedZip || validSimilarItems.length > 0;

  const totalPages = Math.ceil(validSimilarItems.length / itemsPerPage);

  const paginatedItems = validSimilarItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="fixed right-0 top-0 z-50 h-screen w-4/5 bg-transparent flex flex-col justify-start items-left overflow-y-auto">
      {!hasUploads && (
        <h2 className="text-center text-gray-600 mt-8 text-lg">Belum mengupload</h2>
      )}
      {error && (
        <p className="text-center text-red-600 mt-8 text-lg">{error}</p>
      )}
      {isLoading && (
        <p className="text-center text-gray-600 mt-8 text-lg">Loading...</p>
      )}
      {paginatedItems.length > 0 && (
        <div className="mt-12 px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Similar Items ({validSimilarItems.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedItems.map((item, index) => (
              <div
                key={index}
                className="relative group bg-white rounded-lg overflow-hidden shadow-lg p-3 hover:shadow-xl transition-shadow duration-300"
              >
                {item.url.endsWith('.mid') ? (
                  item.associated_image ? (
                    <img
                      src={item.associated_image}
                      alt={item.label}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gray-200 rounded-lg">
                      <p className="text-gray-700 font-semibold">MIDI File</p>
                    </div>
                  )
                ) : (
                  <img
                    src={item.url}
                    alt={item.label}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}
                <div className="mt-2">
                  <p className="font-semibold text-base">{item.title || item.label}</p>
                  {item.artist && <p className="text-gray-600 text-sm">Artist: {item.artist}</p>}
                  {item.album && <p className="text-gray-600 text-sm">Album: {item.album}</p>}
                  {item.year && <p className="text-gray-600 text-sm">Year: {item.year}</p>}
                  <p className="text-blue-600 font-medium mt-1 text-sm">
                    Similarity: {(item.similarity! * 100).toFixed(2)}%
                  </p>
                  {item.distance !== undefined && (
                    <p className="text-blue-600 font-medium text-sm">
                      Distance: {item.distance.toFixed(2)}
                    </p>
                  )}
                  <div className="mt-2 space-x-2">
                    {item.associated_midi && (
                      <a
                        href={item.associated_midi}
                        className="inline-block px-2 py-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download MIDI
                      </a>
                    )}
                    {item.associated_image && (
                      <a
                        href={item.url}
                        className="inline-block px-2 py-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download MIDI
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`mx-1 px-3 py-1 rounded-full ${
                  currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      {validSimilarItems.length === 0 && !isLoading && hasUploads && (
        <p className="text-center text-gray-600 mt-8 text-lg">
          No similar items found within valid similarity range.
        </p>
      )}
    </div>
  );
}