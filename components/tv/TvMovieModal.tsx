'use client';

import { useEffect, useState, useRef } from 'react';
import { Play, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { getMovieDetails } from '@/lib/api';
import { useRouter } from 'next/navigation';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { Movie, MovieDetails } from '@/types';

interface TvMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

export default function TvMovieModal({ isOpen, onClose, movie }: TvMovieModalProps) {
  const router = useRouter();
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && movie?.slug) {
      setIsLoading(true);
      getMovieDetails(movie.slug)
        .then((data) => setMovieDetails(data))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, movie?.slug]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtnRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !movie) return null;

  const episodes = movieDetails?.episodes?.[0]?.server_data || [];

  const handlePlayEpisode = (episodeSlug?: string) => {
    const epQuery = episodeSlug ? `?ep=${episodeSlug}` : '';
    router.push(`/phim/${movie.slug}${epQuery}`);
    onClose();
  };

  return (
    <div
      data-modal-container
      className="fixed inset-0 z-[200] bg-[#0a0a0c] flex flex-col overflow-y-auto animate-in fade-in duration-150 transform-gpu"
    >
      {/* BACKGROUND POSTER */}
      <div className="relative w-full h-[50vh] min-h-[420px] bg-black shrink-0">
        <Image
          src={movie.imageSrc}
          alt={movie.title}
          fill
          className="object-cover opacity-50"
          referrerPolicy="no-referrer"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-transparent to-transparent w-[50%]" />

        {/* NÚT QUAY LẠI / ĐÓNG (Scaled HD) */}
        <button
          ref={closeBtnRef}
          tabIndex={0}
          onClick={onClose}
          className="absolute top-8 left-12 md:left-16 z-30 flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white px-6 py-3.5 rounded-2xl border border-white/20 focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer font-black text-base shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Quay Lại (ESC)</span>
        </button>

        {/* NỘI DUNG CHÍNH (Scaled HD) */}
        <div className="absolute bottom-8 left-12 md:left-16 right-12 md:right-16 flex flex-col gap-3 z-20">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight line-clamp-1 drop-shadow-md">
            {movie.title}
          </h1>

          <div className="flex items-center gap-4 text-base font-bold text-gray-300">
            {movieDetails?.movie?.quality && (
              <span className="bg-[#7226FF] text-white px-3 py-1 rounded-md text-xs font-black uppercase shadow-md">
                {movieDetails.movie.quality}
              </span>
            )}
            {movieDetails?.movie?.year && <span>Năm: {movieDetails.movie.year}</span>}
            {movieDetails?.movie?.episode_current && (
              <span className="text-[#F042FF] font-black text-lg">
                {movieDetails.movie.episode_current}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* THÔNG TIN CHI TIẾT & DANH SÁCH TẬP */}
      <div className="p-12 md:p-16 flex-1 flex flex-col gap-8 w-full max-w-7xl mx-auto">
        {/* HÀNG NÚT BẤM CHÍNH */}
        <div className="flex items-center gap-5">
          <button
            tabIndex={0}
            onClick={() => handlePlayEpisode(episodes[0]?.slug)}
            className="flex items-center gap-3 bg-[#7226FF] hover:bg-[#853aff] text-white px-10 py-4 rounded-2xl font-black text-lg border-2 border-transparent transition-transform duration-150 focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer shadow-xl"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Phát Xem Ngay</span>
          </button>

          <FavoriteButton movieData={{ slug: movie.slug, name: movie.title, imageSrc: movie.imageSrc }} />
        </div>

        {/* NỘI DUNG NỘI DUNG PHIM */}
        {movieDetails?.movie?.content && (
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <h3 className="text-gray-400 font-black text-sm uppercase tracking-wider mb-2">Nội Dung Phim</h3>
            <p className="text-gray-200 text-base md:text-lg leading-relaxed line-clamp-4 font-medium">
              {movieDetails.movie.content.replace(/<[^>]*>?/gm, '')}
            </p>
          </div>
        )}

        {/* DANH SÁCH TẬP PHIM CHO REMOTE D-PAD (Scaled HD cho TV 4K 55-inch) */}
        <div className="space-y-4 pb-12">
          <h3 className="text-white font-black text-2xl flex items-center gap-3">
            <span>Danh Sách Tập Phim</span>
            {isLoading && <span className="text-sm font-normal text-purple-400">Đang tải...</span>}
          </h3>

          {episodes.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {episodes.map((ep) => (
                <button
                  key={ep.slug}
                  tabIndex={0}
                  onClick={() => handlePlayEpisode(ep.slug)}
                  className="py-4 px-3 bg-white/10 hover:bg-[#7226FF] text-white font-black text-base rounded-2xl border border-white/15 transition-transform duration-150 text-center focus:outline-none focus:scale-105 focus:bg-[#7226FF] focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer truncate shadow-md"
                >
                  {ep.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-base">Chưa có thông tin tập phim</div>
          )}
        </div>
      </div>
    </div>
  );
}
