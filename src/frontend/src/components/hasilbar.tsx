/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    setCurrentPage(1);
  }, [similarItems]);

  // Filter valid items with similarity between 0 and 1 (0-100%)
  const validSimilarItems = similarItems.filter(
    item => item.similarity !== undefined && 
    item.similarity >= 0.55 && 
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
  <div className="flex w-full flex-col items-stretch justify-start bg-transparent px-4 py-6 md:max-h-screen md:overflow-y-auto md:px-8">
      {!hasUploads && (
        <h2 className="mt-6 text-center text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px black' }}>
          Popmie Pencari Gambar dan Audio MIDI
        </h2>
      )}
      {error && (
        <p className="mt-6 text-center text-lg text-red-600">{error}</p>
      )}
      {isLoading && (
        <p className="mt-6 text-center text-lg text-gray-200">Loading...</p>
      )}
      {paginatedItems.length > 0 && (
        <div className="mt-6 w-full">
          <h2 className="mb-6 text-center text-3xl font-bold text-white">
            Similar Items ({validSimilarItems.length})
          </h2>
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedItems.map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg bg-white p-3 shadow-lg transition-shadow duration-300 hover:shadow-xl"
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
          <div className="mt-6 flex justify-center">
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
        <p className="mt-6 text-center text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px black' }}>
          Popmie Pencari Gambar dan Audio MIDI
        </p>
      )}
    </div>
  );
}