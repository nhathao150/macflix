// app/api/actor-photos/route.ts
// Proxy route: lấy danh sách diễn viên + ảnh từ TMDB dựa vào tmdb_id
// Yêu cầu: TMDB_API_KEY trong .env.local

import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w185';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tmdbId   = searchParams.get('tmdb_id');
  const tmdbType = searchParams.get('type') || 'movie'; // 'movie' | 'tv'

  if (!tmdbId) {
    return NextResponse.json({ error: 'missing tmdb_id' }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    // Trả về rỗng thay vì lỗi — UI sẽ fallback về gradient initials
    return NextResponse.json({ cast: [] });
  }

  try {
    const endpoint = tmdbType === 'tv'
      ? `${TMDB_BASE}/tv/${tmdbId}/credits?api_key=${apiKey}&language=vi-VN`
      : `${TMDB_BASE}/movie/${tmdbId}/credits?api_key=${apiKey}&language=vi-VN`;

    const res = await fetch(endpoint, { next: { revalidate: 86400 } }); // Cache 24h
    if (!res.ok) return NextResponse.json({ cast: [] });

    const data = await res.json();

    // Kết hợp cast + crew (đạo diễn), chỉ lấy những người có ảnh
    const cast = (data.cast || [])
      .filter((p: { profile_path: string | null }) => p.profile_path)
      .slice(0, 20)
      .map((p: { name: string; profile_path: string; character: string }) => ({
        name: p.name,
        photo: `${TMDB_IMG}${p.profile_path}`,
        role: p.character || 'Diễn viên',
      }));

    const crew = (data.crew || [])
      .filter((p: { job: string; profile_path: string | null }) => 
        p.job === 'Director' && p.profile_path
      )
      .map((p: { name: string; profile_path: string }) => ({
        name: p.name,
        photo: `${TMDB_IMG}${p.profile_path}`,
        role: 'Đạo diễn',
      }));

    return NextResponse.json({ cast: [...crew, ...cast] });
  } catch {
    return NextResponse.json({ cast: [] });
  }
}
