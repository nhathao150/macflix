import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Restrict to allowed movie API domains for security (SSRF prevention)
  const allowedDomains = ['phimapi.com', 'ophim1.com', 'phimimg.com'];
  try {
    const parsedUrl = new URL(targetUrl);
    if (!allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain))) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      next: { revalidate: 86400 } // Cache for 24 hours on Next.js server
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.statusText}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
