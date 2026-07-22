'use client';

import { useRef } from 'react';
import TvMovieCard from './TvMovieCard';
import { Movie } from '@/types';

interface TvMovieRowProps {
  title: string;
  movies: Movie[];
  isTrending?: boolean;
  onMovieClick: (movie: Movie) => void;
}

export default function TvMovieRow({ title, movies, isTrending, onMovieClick }: TvMovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

  return (
    <div className="w-full relative py-4">
      {/* Tiêu đề hàng chữ to rõ nét */}
      <h2 className="font-extrabold text-white text-lg md:text-xl mb-3 px-6 tracking-wide drop-shadow-sm">
        {title}
      </h2>

      {/* Danh sách phim cuộn ngang mượt mà */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-4 pt-1 scroll-smooth snap-x snap-mandatory"
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="shrink-0 snap-start transition-transform duration-150 focus-within:z-40"
            onClick={() => onMovieClick(movie)}
          >
            <TvMovieCard movie={movie} isTrending={isTrending} />
          </div>
        ))}
      </div>
    </div>
  );
}
