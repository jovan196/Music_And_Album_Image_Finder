import { useState } from 'react';
import axios from 'axios';

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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Find Similar Images</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>

      {uploadedImageUrl && (
        <div style={{ marginTop: '20px' }}>
          <h2>Uploaded Image:</h2>
          <img
            src={uploadedImageUrl}
            alt="Uploaded"
            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h2>Similar Images:</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {Array.isArray(similarImages) && similarImages.length > 0 ? (
            similarImages.map((image, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <img
                  src={image.url}
                  alt={`Similar image ${index + 1}`}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
                <p>Distance: {image.distance.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <p>No similar images found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
