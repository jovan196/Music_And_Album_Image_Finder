import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { promisify } from 'util';

// Configure multer
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
const uploadMiddleware = promisify(upload.single('file'));

export async function POST(request: NextRequest) {
  try {
    // Get the FormData from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const endpoint = new URL(request.url).searchParams.get('endpoint') || 'upload';
    
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    // Save file temporarily
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `./uploads/${file.name}`;
    
    // Ensure uploads directory exists
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(filePath, buffer);

    // Create form data for Python backend
    const pythonFormData = new FormData();
    pythonFormData.append('file', fs.createReadStream(filePath));

    // Send to Python backend
    const pythonBackendUrl = `http://127.0.0.1:5000/${endpoint}`;
    const response = await axios.post(pythonBackendUrl, pythonFormData, {
      headers: {
        ...pythonFormData.getHeaders(),
      },
    });

    // Clean up
    fs.unlinkSync(filePath);

    // Return response
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: 'Error processing upload' },
      { status: 500 }
    );
  }
}