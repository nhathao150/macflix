import Image from 'next/image';
import { Play } from 'lucide-react';

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    imageSrc: string;
    slug?: string;
  };
  isTrending?: boolean;
}

export default function MovieCard({ movie, isTrending }: MovieCardProps) {
  return (
    <div className={`relative group cursor-pointer aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg ${
      isTrending ? 'w-[280px] md:w-[400px]' : 'w-[240px] md:w-[320px]'
    }`}>
      <Image
        src={movie.imageSrc}
        alt={movie.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      
      {/* Lớp phủ gradient đen ở dưới để hiện chữ cho rõ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Nội dung trên thẻ phim */}
      <div className="absolute bottom-0 left-0 w-full p-4 flex items-end justify-between translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 pr-4 drop-shadow-md">
          {movie.title}
        </h3>
        
        {/* Nút Play nhỏ ở góc */}
        <button className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 group-hover:bg-[#D9251D] group-hover:border-transparent backdrop-blur-md flex items-center justify-center transition-all border border-white/30 shadow-lg">
          <Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" />
        </button>
      </div>
    </div>
  );
}