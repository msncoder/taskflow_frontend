import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/invitations/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Auth succeeded! Set httpOnly cookies
    const { access_token, refresh_token } = data;
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

    res.cookies.set({
      name: 'refresh_token',
      value: refresh_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error('Accept invite routing error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
