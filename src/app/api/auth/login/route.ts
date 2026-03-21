import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call the actual backend login endpoint
    // Backend expects a JSON payload matching LoginRequest schema
    const payload = {
      email: body.email,
      password: body.password
    };

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Auth succeeded! Set httpOnly cookies for access and refresh tokens
    const { access_token, refresh_token } = data;

    const res = NextResponse.json({ success: true });

    // Assuming ~30 mins for access token, ~7 days for refresh token
    res.cookies.set({
      name: 'access_token',
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 60, // 30 minutes
    });

    res.cookies.set({
      name: 'refresh_token',
      value: refresh_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh', // Secure refresh token to only be sent to refresh endpoint
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error('Login routing error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
