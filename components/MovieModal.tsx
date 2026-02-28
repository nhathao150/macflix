'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Film, ArrowLeft, ChevronRight, ChevronLeft, MonitorPlay } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { getMovieDetails, getMoviesByGenre } from '@/lib/api';
import { useRouter } from 'next/navigation';
// 1. IMPORT NÚT TRÁI TIM YÊU THÍCH VÀO ĐÂY
import FavoriteButton from '@/components/FavoriteButton';
import { Movie, MovieDetails } from '@/types';

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

const getYoutubeEmbedId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function MovieModal({ isOpen, onClose, movie }: MovieModalProps) {
  const router = useRouter();
  
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaMode, setMediaMode] = useState<'banner' | 'trailer'>('banner');
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  
  const similarMoviesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (isOpen && movie?.slug) {
        setIsLoading(true);
        setMediaMode('banner');
        setSimilarMovies([]);

        try {
          const data = await getMovieDetails(movie.slug);
          setMovieDetails(data);

          const firstCategorySlug = data?.movie?.category?.[0]?.slug;
          if (firstCategorySlug) {
            const similarData = await getMoviesByGenre(firstCategorySlug);
            const filteredSimilar = similarData
              .filter((m: Movie) => m.slug !== movie.slug)
              .slice(0, 8);
            setSimilarMovies(filteredSimilar);
          }
          
        } catch (error) {
          console.error("Lỗi lấy chi tiết phim:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setMovieDetails(null);
        setMediaMode('banner');
        setSimilarMovies([]);
      }
    };

    fetchMovieData();
  }, [isOpen, movie]);

  const handleWatchMovie = () => {
    const slug = movieDetails?.movie?.slug || movie?.slug;
    if (slug) {
      onClose();
      router.push(`/phim/${slug}`);
    }
  };

  const handleWatchSimilar = (similarSlug: string) => {
    onClose();
    router.push(`/phim/${similarSlug}`);
  };

  const scrollSimilar = (direction: 'left' | 'right') => {
    if (similarMoviesRef.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      similarMoviesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  const movieData = movieDetails?.movie;
  const backdropUrl = movieData?.poster_url 
    ? (movieData.poster_url.startsWith('http') ? movieData.poster_url : `https://phimimg.com/${movieData.poster_url}`)
    : movie?.imageSrc;

  const trailerId = getYoutubeEmbedId(movieData?.trailer_url || "");
  const episodesList = movieDetails?.episodes?.[0]?.server_data || [];
  const hasLinkMovie = episodesList.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md" onClick={onClose} />
          
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl h-[90vh] bg-[#141414] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-50 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
                
                {/* --- 1. MEDIA PLAYER (Banner/Trailer) --- */}
                <div className="relative w-full aspect-[21/9] md:aspect-[16/6] bg-black">
                  {mediaMode === 'banner' && (
                    <div className="relative w-full h-full">
                      {backdropUrl && (
                        <Image src={backdropUrl} alt={movieData?.name || ''} fill className="object-cover opacity-70 mask-image-gradient" referrerPolicy="no-referrer" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                      
                      {/* 2. CHÈN NÚT TRÁI TIM YÊU THÍCH NGAY TRÊN POSTER */}
                      {movieData && (
                         <div className="absolute bottom-16 right-6 md:bottom-20 md:right-12 z-20">
                            <FavoriteButton 
                                movieData={{
                                    slug: movieData.slug,
                                    name: movieData.name,
                                    imageSrc: backdropUrl || ""
                                }} 
                            />
                         </div>
                      )}

                      {trailerId && (
                         <div className="absolute inset-0 flex items-center justify-center">
                          <button onClick={() => setMediaMode('trailer')} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 md:px-5 md:py-2.5 flex items-center gap-2 backdrop-blur-sm border border-white/30 transition-all group shadow-xl">
                            <Film className="w-5 h-5 fill-current" />
                            <span className="text-sm font-bold hidden md:block">Xem Trailer</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {mediaMode === 'trailer' && trailerId && (
                    <div className="w-full h-full relative bg-black">
                      <button onClick={() => setMediaMode('banner')} className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm backdrop-blur-md border border-white/10 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Đóng Trailer
                      </button>
                      <iframe src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0`} title="Trailer" allowFullScreen className="w-full h-full"></iframe>
                    </div>
                  )}
                </div>

                <div className="px-6 md:px-12 -mt-10 md:-mt-16 relative z-10 space-y-12">
                    
                    {/* Tiêu đề Phim */}
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-xl uppercase w-4/5">
                            {movieData?.name || movie?.title}
                        </h1>
                        <p className="text-white/70 text-sm font-medium">Tên gốc: {movieData?.origin_name}</p>
                    </div>

                    {/* --- 2. CÓ LIÊN QUAN (Similar Movies - Nút trượt chuẩn Hero) --- */}
                    {similarMovies.length > 0 && (
                      <div className="space-y-4">
                          <div className="flex items-center gap-1 text-white/90 font-bold text-lg md:text-xl">
                              Có Liên Quan
                          </div>

                          <div className="relative group/list">
                              <button onClick={() => scrollSimilar('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 items-center justify-center transition-all opacity-0 group-hover/list:opacity-100 hidden md:flex"><ChevronLeft className="w-6 h-6 text-white" /></button>
                              
                              <div ref={similarMoviesRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x">
                                  {similarMovies.map((sim, idx) => (
                                      <div key={idx} onClick={() => handleWatchSimilar(sim.slug)} className="shrink-0 w-32 md:w-40 cursor-pointer group snap-start">
                                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 border border-white/10">
                                              <Image src={sim.imageSrc} alt={sim.title} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                                          </div>
                                          <p className="text-xs md:text-sm font-semibold text-white/80 group-hover:text-white line-clamp-1">{sim.title}</p>
                                      </div>
                                  ))}
                              </div>

                              <button onClick={() => scrollSimilar('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 items-center justify-center transition-all opacity-0 group-hover/list:opacity-100 hidden md:flex"><ChevronRight className="w-6 h-6 text-white" /></button>
                          </div>
                      </div>
                    )}

                    {/* --- 3. CÁCH XEM --- */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-1 text-white/90 font-bold text-lg md:text-xl">
                            Cách xem
                        </div>
                        <div 
                            onClick={hasLinkMovie ? handleWatchMovie : undefined}
                            className={`flex items-center gap-4 bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/10 p-4 rounded-2xl w-fit transition-colors ${hasLinkMovie ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                        >
                            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                                <MonitorPlay className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-white mb-0.5">{hasLinkMovie ? 'Phát Ngay' : 'Chưa có link'}</p>
                                <p className="text-xs text-white/50">Miễn phí trên Macflix</p>
                            </div>
                        </div>
                    </div>

                    {/* --- 4. DIỄN VIÊN & ĐOÀN LÀM PHIM --- */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-1 text-white/90 font-bold text-lg md:text-xl">
                            Diễn Viên & Đoàn Làm Phim
                        </div>
                        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                            {[...(movieData?.director || []), ...(movieData?.actor || [])]
                                .filter(name => name && name !== 'Đang cập nhật')
                                .map((name, idx) => {
                                    const colors = ['from-pink-500 to-rose-500', 'from-cyan-500 to-blue-500', 'from-purple-500 to-indigo-500', 'from-yellow-500 to-orange-500', 'from-emerald-400 to-teal-500'];
                                    const randomColor = colors[idx % colors.length];
                                    const initials = name.split(' ').map((n:string) => n[0]).join('').slice(0,2).toUpperCase();

                                    return (
                                        <div key={idx} className="shrink-0 flex flex-col items-center gap-2 w-20 text-center group cursor-pointer">
                                            <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${randomColor} flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform border-2 border-transparent group-hover:border-white/20`}>
                                                {initials}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-white/90 line-clamp-1">{name}</p>
                                                <p className="text-[10px] text-white/50">{movieData?.director?.includes(name) ? 'Đạo diễn' : 'Diễn viên'}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            {(!movieData?.actor || movieData?.actor[0] === 'Đang cập nhật') && (
                                <p className="text-sm text-white/50">Đang cập nhật dữ liệu diễn viên...</p>
                            )}
                        </div>
                    </div>

                    {/* --- 5. GIỚI THIỆU --- */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-1 text-white/90 font-bold text-lg md:text-xl">
                            Giới thiệu
                        </div>
                        <div className="bg-[#1c1c1e] border border-white/5 p-6 rounded-2xl">
                            <h4 className="text-base font-bold text-white mb-1 uppercase">{movieData?.name}</h4>
                            <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-4">
                                {movieData?.category?.map((c: { name: string }) => c.name).join(', ')}
                            </p>
                            <div 
                                className="text-white/80 text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: movieData?.content || 'Đang cập nhật nội dung...' }} 
                            />
                        </div>
                    </div>

                    {/* --- 6. THÔNG TIN (LƯỚI 3 CỘT) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-white">Thông tin</h3>
                            <ul className="space-y-4 text-sm">
                                <li>
                                    <span className="text-white/50 block text-xs font-semibold uppercase mb-1">Năm phát hành</span>
                                    <span className="text-white/90 font-medium">{movieData?.year || '2024'}</span>
                                </li>
                                <li>
                                    <span className="text-white/50 block text-xs font-semibold uppercase mb-1">Thời lượng</span>
                                    <span className="text-white/90 font-medium">{movieData?.time || 'Đang cập nhật'}</span>
                                </li>
                                <li>
                                    <span className="text-white/50 block text-xs font-semibold uppercase mb-1">Được xếp hạng</span>
                                    <span className="border border-white/20 px-1.5 py-0.5 rounded text-xs text-white/90 font-bold">{movieData?.quality || 'FHD'}</span>
                                </li>
                                <li>
                                    <span className="text-white/50 block text-xs font-semibold uppercase mb-1">Nơi sản xuất</span>
                                    <span className="text-white/90 font-medium">{movieData?.country?.[0]?.name || 'Đang cập nhật'}</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4 text-white">Ngôn ngữ</h3>
                            <ul className="space-y-4 text-sm">
                                <li>
                                    <span className="text-white/50 block text-xs font-semibold uppercase mb-1">Âm thanh gốc</span>
                                    <span className="text-white/90 font-medium">Tiếng {movieData?.country?.[0]?.name || 'Bản địa'} (Stereo, Dolby Atmos)</span>
                                </li>
                                <li>
                                    <span className="text-white/50 block text-xs font-semibold uppercase mb-1">Phụ đề & Lồng tiếng</span>
                                    <span className="text-white/90 font-medium line-clamp-2">Tiếng Việt (Vietsub), {movieData?.lang || 'Đang cập nhật'}</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4 text-white">Trợ năng</h3>
                            <div className="flex gap-3 items-start">
                                <span className="border border-white/20 rounded px-1.5 py-0.5 text-xs font-bold text-white shrink-0 mt-0.5">CC</span>
                                <p className="text-xs text-white/50 leading-relaxed">
                                    Phụ đề cho người khiếm thính (SDH) là phụ đề bằng ngôn ngữ gốc, được bổ sung các thông tin liên quan không phải lời thoại.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}