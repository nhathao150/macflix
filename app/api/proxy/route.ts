import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Restrict to allowed movie API domains for security (SSRF prevention)
  const allowedDomains = ['phimapi.com', 'ophim1.com', 'phimimg.com'];
  
  // Dynamically append custom API URLs configured in environment variables
  const envApiUrls = [
    process.env.NEXT_PUBLIC_MOVIE_API_URL,
    process.env.MOVIE_API_URL,
    process.env.NEXT_PUBLIC_OPHIM_API_URL,
    process.env.OPHIM_API_URL
  ];
  envApiUrls.forEach(urlStr => {
    if (urlStr) {
      try {
        const hostname = new URL(urlStr).hostname;
        if (hostname && !allowedDomains.includes(hostname)) {
          allowedDomains.push(hostname);
        }
      } catch {}
    }
  });

  try {
    const parsedUrl = new URL(targetUrl);
    if (!allowedDomains.some(domain => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain))) {
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

    const contentType = res.headers.get('Content-Type') || '';
    let response: NextResponse;

    if (contentType.includes('application/json')) {
      try {
        const data = await res.json();
        response = NextResponse.json(data);
      } catch (jsonErr) {
        console.error('Failed parsing upstream JSON:', jsonErr);
        const text = await res.text();
        response = new NextResponse(text);
        response.headers.set('Content-Type', contentType);
      }
    } else {
      const text = await res.text();
      response = new NextResponse(text);
      response.headers.set('Content-Type', contentType || 'text/plain');
    }
    
    // Tối ưu hóa của Senior Dev: Đặt Cache-Control để trình duyệt lưu bộ nhớ đệm (Browser Cache)
    response.headers.set(
      'Cache-Control',
      'public, max-age=1800, s-maxage=86400, stale-while-revalidate=600'
    );
    return response;
  } catch (error) {
    console.error('API Proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
