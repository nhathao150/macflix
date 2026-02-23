'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: any[];
  isTrending?: boolean;
  onMovieClick: (movie: any) => void;
}

export default function MovieRow({ title, movies, isTrending, onMovieClick }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75; 
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative py-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-12 drop-shadow-md">
        {title}
      </h2>
      
      <div className="relative group/row px-4 md:px-12">
        {/* Nút lướt Trái - Dạng nút tròn, kính mờ */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-2 md:left-4 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-lg scale-90 hover:scale-100 hidden md:flex"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        {/* Khung chứa danh sách phim */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-6 pt-2 -mx-4 md:-mx-12 px-4 md:px-12"
        >
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="shrink-0 transition-transform duration-300 hover:z-50"
              onClick={() => onMovieClick(movie)}
            >
              <MovieCard movie={movie} isTrending={isTrending} />
            </div>
          ))}
        </div>

        {/* Nút lướt Phải - Dạng nút tròn, kính mờ */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-2 md:right-4 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-lg scale-90 hover:scale-100 hidden md:flex"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}