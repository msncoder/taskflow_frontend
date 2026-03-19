import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ detail: 'No refresh token provided' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Clear cookies if refresh failed
      const res = NextResponse.json(data, { status: response.status });
      res.cookies.delete('access_token');
      res.cookies.delete('refresh_token');
      return res;
    }

    const { access_token, refresh_token: new_refresh_token } = data;

    const res = NextResponse.json({ success: true });

    res.cookies.set({
      name: 'access_token',
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 60,
    });

    if (new_refresh_token) {
      res.cookies.set({
        name: 'refresh_token',
        value: new_refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return res;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
