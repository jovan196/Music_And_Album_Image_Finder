import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

// proxy function
async function proxyToBackend(request: NextRequest, slug: string[], method: string) {
  try {
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
    backendUrl = backendUrl.replace(/\/+$/, ""); // hapus trailing slash

    const endpoint = slug.join("/");
    const pythonBackendUrl = `${backendUrl}/finder/${endpoint}`;

    let response;

    if (method === "GET") {
      response = await axios.get(pythonBackendUrl, {
        params: Object.fromEntries(new URL(request.url).searchParams),
      });
    } else {
      const contentType = request.headers.get("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const pythonFormData = new FormData();

        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            const buffer = Buffer.from(await value.arrayBuffer());
            pythonFormData.append(key, buffer, value.name);
          } else {
            pythonFormData.append(key, value as string);
          }
        }

        response = await axios.post(pythonBackendUrl, pythonFormData, {
          headers: { ...pythonFormData.getHeaders() },
          maxBodyLength: Infinity,
        });
      } else {
        const body = await request.json();
        response = await axios.post(pythonBackendUrl, body, {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // langsung forward payload asli Flask
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }

    // fallback kalau error di sisi bridge
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: "Bridge internal error", detail: message },
      { status: 500 }
    );
}
}

// ✅ Perhatikan: params sekarang diperlakukan async
export async function POST(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  return proxyToBackend(request, slug, "POST");
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  return proxyToBackend(request, slug, "GET");
}