/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(request: NextRequest) {
  try {
    // Ambil form-data dari request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Tentukan endpoint ke Python backend
    const endpoint = new URL(request.url).searchParams.get('endpoint') || 'upload';
    let backendUrl = process.env.PYTHON_BACKEND_URL || 'http://backend:8000';
    backendUrl = backendUrl.replace(/\/+$/, ''); // remove trailing slash
    const pythonBackendUrl = `${backendUrl}/${endpoint}`;

    // Convert File ke Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Buat form-data untuk dikirim ke Flask
    const pythonFormData = new FormData();
    pythonFormData.append('file', buffer, file.name);

    // Request ke Python backend
    const response = await axios.post(pythonBackendUrl, pythonFormData, {
      headers: {
        ...pythonFormData.getHeaders(),
      },
      maxBodyLength: Infinity, // supaya aman untuk file besar
    });

    return NextResponse.json(response.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error processing upload:', message, error);
    return NextResponse.json(
      { error: 'Error processing upload', detail: message },
      { status: 500 }
    );
  }
}
