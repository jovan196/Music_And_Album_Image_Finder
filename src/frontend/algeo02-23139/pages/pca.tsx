import { useState } from "react";
import axios from "axios";

interface SimilarImage {
  url: string;
  distance: number;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [similarImages, setSimilarImages] = useState<SimilarImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadedImageUrl(URL.createObjectURL(file));
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
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const filteredImages = response.data.similar_images.filter(
        (image: SimilarImage) => image.distance <= 10000
      );
      setSimilarImages(filteredImages);
    } catch (error) {
      console.error("Error uploading file:", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center">
            Pencarian Gambar Mirip dengan PCA
          </h1>
        </div>
      </header>

      <main>
        <div className="max-w-4xl mx-auto py-10 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md space-y-6">
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
                {uploadedImageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={uploadedImageUrl}
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
            </div>
            {similarImages.length > 0 && (
              <div className="mt-12">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                  Similar Images
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {similarImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer bg-white rounded-lg overflow-hidden shadow-lg"
                      onClick={() => window.open(image.url, "_blank")}
                    >
                      <img
                        src={image.url}
                        alt={`Similar image ${index + 1}`}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent text-white text-sm text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Distance: {image.distance.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {similarImages.length === 0 && uploadedImageUrl && !isLoading && (
              <p className="text-center text-gray-600 mt-8 text-lg">
                Tidak ada gambar mirip yang ditemukan.
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-10 bg-white shadow-inner py-4">
        <div className="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} - Kelompok 52 - Tubes 2 Algeo
        </div>
      </footer>
    </div>
  );
}
