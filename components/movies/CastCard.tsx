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
      <div className="shrink-0 flex flex-col items-center gap-3 w-28 md:w-32 text-center group cursor-pointer">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-xl border-2 border-transparent group-hover:border-[#F042FF] group-hover:scale-105 transition-all">
          {showPhoto ? (
            <Image src={photoUrl!} alt={name} width={96} height={96}
              className="w-full h-full object-cover object-top"
              onError={() => setImgError(true)} loading="lazy" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-black text-2xl md:text-3xl`}>
              {initials}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm md:text-base font-bold text-white/95 line-clamp-2 leading-tight group-hover:text-[#F042FF] transition-colors">{name}</p>
          <p className="text-xs md:text-sm text-white/60 font-medium mt-0.5">{role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-[#141414] border border-white/10 pr-5 rounded-full hover:bg-white/10 transition-colors cursor-pointer group">
      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform">
        {showPhoto ? (
          <Image src={photoUrl!} alt={name} width={48} height={48}
            className="w-full h-full object-cover object-top"
            onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-black text-base`}>
            {initials}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm md:text-base font-bold text-white line-clamp-1">{name}</p>
        <p className="text-xs text-white/60 font-medium">{role}</p>
      </div>
    </div>
  );
}

// ── Hook: fetch toàn bộ danh sách diễn viên từ ophim peoples API ────────────
export function usePeoplesData(slug: string | null | undefined): PeoplesData {
  const [data, setData] = useState<PeoplesData>({ peoples: [], photoBaseUrl: 'https://image.tmdb.org/t/p/w185' });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const OPHIM_API_URL = process.env.NEXT_PUBLIC_OPHIM_API_URL || 'https://ophim1.com';
    fetch(`/api/proxy?url=${encodeURIComponent(`${OPHIM_API_URL}/v1/api/phim/${slug}/peoples`)}`)
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
