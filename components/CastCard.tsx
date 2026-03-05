'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Kiểu dữ liệu từ ophim peoples API
export interface OphimPerson {
  name: string;
  also_known_as: string[];
  profile_path: string | null;
  character?: string;
  known_for_department?: string;
}

export interface PeoplesData {
  peoples: OphimPerson[];
  photoBaseUrl: string;
}

interface CastCardProps {
  name: string;
  role: 'Đạo diễn' | 'Diễn viên';
  colorIndex: number;
  variant?: 'pill' | 'circle';
  photoUrl?: string;
}

const GRADIENT_COLORS = [
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-purple-500 to-indigo-500',
  'from-yellow-500 to-orange-500',
  'from-green-500 to-teal-500',
  'from-red-500 to-pink-600',
];

export default function CastCard({ name, role, colorIndex, variant = 'pill', photoUrl }: CastCardProps) {
  const [imgError, setImgError] = useState(false);

  const gradient = GRADIENT_COLORS[colorIndex % GRADIENT_COLORS.length];
  const initials = name.split(' ').map((n) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
  const showPhoto = !!photoUrl && !imgError;

  if (variant === 'circle') {
    return (
      <div className="shrink-0 flex flex-col items-center gap-2 w-20 text-center group cursor-pointer">
        <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-transparent group-hover:border-white/30 group-hover:scale-110 transition-all">
          {showPhoto ? (
            <Image src={photoUrl!} alt={name} width={64} height={64}
              className="w-full h-full object-cover object-top"
              onError={() => setImgError(true)} unoptimized />
          ) : (
            <div className={`w-full h-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-bold text-xl`}>
              {initials}
            </div>
          )}
        </div>
        <div>
          <p className="text-[11px] font-bold text-white/90 line-clamp-2 leading-tight">{name}</p>
          <p className="text-[10px] text-white/50">{role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-[#141414] border border-white/5 pr-4 rounded-full hover:bg-white/10 transition-colors cursor-pointer group">
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform">
        {showPhoto ? (
          <Image src={photoUrl!} alt={name} width={40} height={40}
            className="w-full h-full object-cover object-top"
            onError={() => setImgError(true)} unoptimized />
        ) : (
          <div className={`w-full h-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-bold text-sm`}>
            {initials}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-white line-clamp-1">{name}</p>
        <p className="text-[10px] text-white/50">{role}</p>
      </div>
    </div>
  );
}

// ── Hook: fetch toàn bộ danh sách diễn viên từ ophim peoples API ────────────
// Trả về full danh sách (có ảnh TMDB) + map tên → ảnh để fallback match
export function usePeoplesData(slug: string | null | undefined): PeoplesData {
  const [data, setData] = useState<PeoplesData>({ peoples: [], photoBaseUrl: 'https://image.tmdb.org/t/p/w185' });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    fetch(`https://ophim1.com/v1/api/phim/${slug}/peoples`)
      .then((r) => r.json())
      .then((res: {
        success: boolean;
        data?: {
          profile_sizes?: { w185?: string };
          peoples?: OphimPerson[];
        };
      }) => {
        if (cancelled || !res.success || !res.data?.peoples) return;
        setData({
          peoples: res.data.peoples,
          photoBaseUrl: res.data.profile_sizes?.w185 || 'https://image.tmdb.org/t/p/w185',
        });
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [slug]);

  return data;
}

// Compat alias (cho code cũ vẫn dùng useTmdbActorPhotos)
export function useTmdbActorPhotos(slug: string | null | undefined): Map<string, string> {
  const { peoples, photoBaseUrl } = usePeoplesData(slug);
  const map = new Map<string, string>();
  peoples.forEach((p) => {
    if (!p.profile_path) return;
    const url = `${photoBaseUrl}${p.profile_path}`;
    if (p.name) map.set(p.name.toLowerCase(), url);
    p.also_known_as?.forEach((aka) => { if (aka) map.set(aka.toLowerCase(), url); });
  });
  return map;
}

export const CAST_GRADIENT_COLORS = GRADIENT_COLORS;
