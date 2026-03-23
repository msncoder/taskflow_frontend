import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1';

// Proxy all requests starting with /api/proxy to the backend API
// And securely attach the access_token in the Authorization header
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

async function proxyRequest(request: NextRequest, pathArray: string[]) {
  try {
    const path = pathArray ? pathArray.join('/') : '';
    const searchParams = request.nextUrl.searchParams.toString();
    
    // 🔥 CACHE BUSTER: Add a timestamp to the URL to bypass any intermediate caching
    const timestamp = Date.now();
    const connector = searchParams ? '&' : '?';
    const targetUrl = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}${connector}_cb=${timestamp}`;
    
    // Extract access_token from httpOnly cookies securely
    const accessToken = request.cookies.get('access_token')?.value;

    const headers = new Headers();
    // Copy headers from incoming request (except host, cookies, etc.)
    request.headers.forEach((value, key) => {
      if (!['host', 'cookie', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      cache: 'no-store', // never cache proxy responses — always fetch fresh from backend
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } else if (contentType.includes('multipart/form-data')) {
         const formData = await request.formData();
         fetchOptions.body = formData;
         // let undici generate custom boundary
         headers.delete('content-type');
      } else {
        const bodyText = await request.text();
        if (bodyText) fetchOptions.body = bodyText;
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Forward the response back to Next.js
    const responseHeaders = new Headers(response.headers);
    
    // 🔥 CRITICAL: Prevent ANY caching of API data in the browser or intermediate layers
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');
    
    // Status 204 and 304 MUST NOT have a body
    if (response.status === 204 || response.status === 304) {
      return new NextResponse(null, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    const result = await response.text();
    
    return new NextResponse(result, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ detail: 'Internal Server Proxy Error' }, { status: 500 });
  }
}
