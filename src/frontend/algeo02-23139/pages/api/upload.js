import multer from 'multer';
import nextConnect from 'next-connect';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data'; // Ensure this is installed
import path from 'path';

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

const apiRoute = nextConnect();

apiRoute.use(upload.single('image')); // Use multer middleware

apiRoute.post(async (req, res) => {
  const pythonBackendUrl = 'http://127.0.0.1:5000/upload'; // Replace with your Python backend URL
  const filePath = req.file.path;

  try {
    // Send the uploaded file to the Python backend
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post(pythonBackendUrl, formData, {
      headers: formData.getHeaders(),
    });

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Send the response from the Python backend to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error communicating with Python backend:', error.message);
    res.status(500).json({ error: 'Error communicating with backend' });
  }
});

apiRoute.use(upload.single('zip')); // Use multer middleware for zip files

apiRoute.post('/upload-zip', async (req, res) => {
  const pythonBackendUrl = 'http://127.0.0.1:5000/upload-zip'; // Replace with your Python backend URL
  const filePath = req.file.path;

  try {
    // Send the uploaded zip file to the Python backend
    const formData = new FormData();
    formData.append('zip', fs.createReadStream(filePath));

    await axios.post(pythonBackendUrl, formData, {
      headers: formData.getHeaders(),
    });

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Send success response to the client
    res.status(200).json({ message: 'Zip file uploaded and processed successfully' });
  } catch (error) {
    console.error('Error communicating with Python backend:', error.message);
    res.status(500).json({ error: 'Error communicating with backend' });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing for file uploads
  },
};