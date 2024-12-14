import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import nextConnect from 'next-connect';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data'; // Ensure this is installed

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

// Use nextConnect without additional sub-routes
const apiRoute = nextConnect<NextApiRequest, NextApiResponse>();

// Apply the multer middleware
apiRoute.use(upload.single('file')); // Use 'file' as the field name for all uploads

// Helper function to handle uploads
const handleUpload = async (
  req: NextApiRequest & { file: Express.Multer.File }, 
  res: NextApiResponse
) => {
  const endpoint = req.query.endpoint as string || 'upload';
  const pythonBackendUrl = `http://127.0.0.1:5000/${endpoint}`;
  const filePath = req.file.path;

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post(pythonBackendUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Send the response from the Python backend to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error(`Error communicating with Python backend:`, (error as any).message);
    res.status(500).json({ error: 'Error communicating with backend' });
  }
};

// Handle all POST requests
apiRoute.post((req, res) => {
  handleUpload(req as NextApiRequest & { file: Express.Multer.File }, res);
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing for file uploads
  },
};