'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import Link from 'next/link';
import { Movie } from '@/types';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isTrending?: boolean;
  onMovieClick: (movie: Movie) => void;
  viewMoreLink?: string;
}

export default function MovieRow({ title, movies, isTrending, onMovieClick, viewMoreLink }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75; 
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const titleContent = (
    <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-12 drop-shadow-md flex items-center group/title cursor-pointer w-fit">
      {title}
      {viewMoreLink && (
        <span className="flex items-center text-sm md:text-base font-normal text-gray-400 opacity-0 group-hover/title:opacity-100 transition-all duration-300 ml-3 group-hover/title:translate-x-2">
          Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      )}
    </h2>
  );

  return (
    <div className="w-full relative py-6">
      {viewMoreLink ? (
        <Link href={viewMoreLink}>
          {titleContent}
        </Link>
      ) : (
        titleContent
      )}
      
      <div className="relative group/row px-4 md:px-12">
        {/* Nút lướt Trái - Dạng nút tròn, kính mờ */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-2 md:left-4 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-lg scale-90 hover:scale-100 hidden md:flex"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        {/* Khung chứa danh sách phim */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-6 pt-2 -mx-4 md:-mx-12 px-4 md:px-12 touch-pan-x snap-x snap-mandatory"
        >
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="shrink-0 transition-transform duration-300 hover:z-50 snap-start snap-always"
              onClick={() => onMovieClick(movie)}
            >
              <MovieCard movie={movie} isTrending={isTrending} />
            </div>
          ))}
        </div>

        {/* Nút lướt Phải - Dạng nút tròn, kính mờ */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-2 md:right-4 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-lg scale-90 hover:scale-100 hidden md:flex"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}