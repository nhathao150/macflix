'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import Link from 'next/link';
import { Movie } from '@/types';
import { useTv } from '@/context/TvContext';
import TvMovieRow from '@/components/tv/TvMovieRow';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isTrending?: boolean;
  onMovieClick: (movie: Movie) => void;
  viewMoreLink?: string;
}

export default function MovieRow({ title, movies, isTrending, onMovieClick, viewMoreLink }: MovieRowProps) {
  const { isTvMode } = useTv();
  const rowRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

  if (isTvMode) {
    return (
      <TvMovieRow
        title={title}
        movies={movies}
        isTrending={isTrending}
        onMovieClick={onMovieClick}
        viewMoreLink={viewMoreLink}
      />
    );
  }

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75; 
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const titleContent = (
    <h2 className="font-bold text-white mb-4 px-4 md:px-12 drop-shadow-md flex items-center group/title cursor-pointer w-fit">
      {title}
      {viewMoreLink && (
        <span className="flex items-center text-sm font-normal text-gray-400 opacity-0 group-hover/title:opacity-100 transition-all duration-300 ml-3 group-hover/title:translate-x-2">
          Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      )}
    </h2>
  );

  return (
    <div 
      className="w-full relative py-6"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 280px'
      }}
    >
      {viewMoreLink ? (
        <Link href={viewMoreLink} className="inline-block w-fit">
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

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 pt-2 -mx-4 md:-mx-12 px-4 md:px-12 md:snap-x md:snap-mandatory"
        >
          {movies.map((movie, index) => (
            <div 
              key={movie.id} 
              className="shrink-0 transition-transform duration-300 hover:z-50 focus-within:z-50 md:snap-start md:snap-always"
              onClick={() => onMovieClick(movie)}
            >
              <MovieCard movie={movie} isTrending={isTrending} priority={index < 4} />
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