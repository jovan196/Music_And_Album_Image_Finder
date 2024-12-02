import { useState } from 'react';
import axios from 'axios';
import ImageCard from './components/ImageCard';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [similarImages, setSimilarImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadedImageUrl(URL.createObjectURL(event.target.files[0]));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setIsLoading(true);
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSimilarImages(response.data.similar_images);
    } catch (error) {
      console.error('Error uploading file:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Find Similar Images
        </h1>
        <div className="flex flex-col items-center mb-8">
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-4 w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className={`w-full max-w-md py-2 px-4 rounded-md text-white font-semibold ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {uploadedImageUrl && (
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Uploaded Image:</h2>
            <img
              src={uploadedImageUrl}
              alt="Uploaded"
              className="w-64 h-64 object-cover mx-auto rounded-lg shadow-md"
            />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Similar Images
          </h2>
          {similarImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {similarImages.map((image, index) => (
                <ImageCard
                  key={index}
                  image={image.url}
                  distance={image.distance}
                />
              ))}
            </div>
          ) : (
            uploadedImageUrl && (
              <p className="text-center text-gray-600">No similar images found.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
