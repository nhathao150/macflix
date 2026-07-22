'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Play, ArrowLeft } from 'lucide-react';
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
  const movieInfo = movieDetails?.movie || movie;

  const handlePlayEpisode = (episodeSlug?: string) => {
    const epQuery = episodeSlug ? `?ep=${episodeSlug}` : '';
    router.push(`/phim/${movie.slug}${epQuery}`);
    onClose();
  };

  return (
    <div
      data-modal-container
      className="fixed inset-0 z-[200] bg-[#0a0a0c] flex flex-col overflow-y-auto animate-in fade-in duration-200"
    >
      {/* BACKGROUND POSTER */}
      <div className="relative w-full h-[45vh] bg-black shrink-0">
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

        {/* NÚT QUAY LẠI / ĐÓNG */}
        <button
          ref={closeBtnRef}
          tabIndex={0}
          onClick={onClose}
          className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl border border-white/20 focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay Lại (ESC)</span>
        </button>

        {/* NỘI DUNG CHÍNH */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2 z-20">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight line-clamp-1 drop-shadow-md">
            {movie.title}
          </h1>

          <div className="flex items-center gap-3 text-sm font-semibold text-gray-300">
            {movieDetails?.movie?.quality && (
              <span className="bg-[#7226FF] text-white px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                {movieDetails.movie.quality}
              </span>
            )}
            {movieDetails?.movie?.year && <span>Năm: {movieDetails.movie.year}</span>}
            {movieDetails?.movie?.episode_current && (
              <span className="text-[#F042FF] font-bold">
                {movieDetails.movie.episode_current}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* THÔNG TIN CHI TIẾT & DANH SÁCH TẬP */}
      <div className="p-6 flex-1 flex flex-col gap-6 max-w-6xl w-full mx-auto">
        {/* HÀNG NÚT BẤM CHÍNH */}
        <div className="flex items-center gap-4">
          <button
            tabIndex={0}
            onClick={() => handlePlayEpisode(episodes[0]?.slug)}
            className="flex items-center gap-2 bg-[#7226FF] hover:bg-[#853aff] text-white px-8 py-3.5 rounded-xl font-extrabold text-base border-2 border-transparent transition-transform duration-150 focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Phát Xem Ngay</span>
          </button>

          <FavoriteButton movieData={{ slug: movie.slug, name: movie.title, imageSrc: movie.imageSrc }} />
        </div>

        {/* NỘI DUNG NỘI DUNG PHIM */}
        {movieDetails?.movie?.content && (
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">Nội Dung Phim</h3>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed line-clamp-4">
              {movieDetails.movie.content.replace(/<[^>]*>?/gm, '')}
            </p>
          </div>
        )}

        {/* DANH SÁCH TẬP PHIM CHO REMOTE D-PAD */}
        <div className="space-y-3 pb-8">
          <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
            <span>Danh Sách Tập Phim</span>
            {isLoading && <span className="text-xs font-normal text-purple-400">Đang tải...</span>}
          </h3>

          {episodes.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {episodes.map((ep) => (
                <button
                  key={ep.slug}
                  tabIndex={0}
                  onClick={() => handlePlayEpisode(ep.slug)}
                  className="py-3 px-2 bg-white/10 hover:bg-[#7226FF] text-white font-bold text-sm rounded-xl border border-white/15 transition-transform duration-150 text-center focus:outline-none focus:scale-105 focus:bg-[#7226FF] focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer truncate"
                >
                  {ep.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Chưa có thông tin tập phim</div>
          )}
        </div>
      </div>
    </div>
  );
}
