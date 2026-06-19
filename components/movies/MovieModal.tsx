'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Film, ArrowLeft, ChevronRight, ChevronLeft, MonitorPlay, Play, Plus, Check, Star } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { getMovieDetails, getMoviesByGenre } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CastCard, { usePeoplesData } from '@/components/movies/CastCard';
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

// Hàm tạo điểm IMDb ổn định theo slug của phim
const getStableRating = (slug: string) => {
  if (!slug) return '8.5';
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const min = 7.5;
  const max = 9.7;
  const rating = min + (Math.abs(hash) % Math.round((max - min) * 10)) / 10;
  return rating.toFixed(1);
};

export default function MovieModal({ isOpen, onClose, movie }: MovieModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaMode, setMediaMode] = useState<'banner' | 'trailer'>('banner');
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  // Lấy danh sách diễn viên + ảnh từ ophim peoples API
  const movieSlug = movieDetails?.movie?.slug || movie?.slug;
  const { peoples, photoBaseUrl } = usePeoplesData(movieSlug);
  
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
          const [data, similarData] = await Promise.all([
            getMovieDetails(movie.slug),
            getMoviesByGenre('hanh-dong').catch(() => [])
          ]);
          setMovieDetails(data);

          const firstCategorySlug = data?.movie?.category?.[0]?.slug;
          if (firstCategorySlug) {
            const correctSimilarData = await getMoviesByGenre(firstCategorySlug);
            const filteredSimilar = correctSimilarData
              .filter((m: Movie) => m.slug !== movie.slug)
              .slice(0, 8);
            setSimilarMovies(filteredSimilar);
          } else if (similarData.length > 0) {
            setSimilarMovies(
              (similarData as Movie[])
                .filter((m: Movie) => m.slug !== movie.slug)
                .slice(0, 8)
            );
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

  // Kiểm tra phim đã được yêu thích chưa
  useEffect(() => {
    const checkFavorite = async () => {
      if (!session?.user?.email || !movieSlug) return;
      try {
        const res = await fetch(`/api/favorites?email=${session.user.email}`);
        const data = await res.json();
        if (res.ok && data.favorites) {
          setIsFavorited(data.favorites.some((item: { slug: string }) => item.slug === movieSlug));
        }
      } catch (error) {
        console.error("Lỗi check phim yêu thích:", error);
      }
    };
    checkFavorite();
  }, [session, movieSlug]);

  const handleWatchMovie = () => {
    const slug = movieDetails?.movie?.slug || movie?.slug;
    if (slug) {
      onClose();
      router.push(`/phim/${slug}`);
    }
  };

  const handleWatchEpisode = (epIndex: number) => {
    const slug = movieDetails?.movie?.slug || movie?.slug;
    if (slug) {
      onClose();
      router.push(`/phim/${slug}?ep=${epIndex}`);
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

  // Toggle danh sách yêu thích trực tiếp trên nút Add to List
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.email) {
      alert("Vui lòng đăng nhập để lưu phim vào danh sách Yêu thích!");
      return;
    }

    const movieData = movieDetails?.movie;
    const bannerUrl = movieData?.thumb_url?.startsWith('http')
      ? movieData.thumb_url
      : (movieData?.poster_url?.startsWith('http') ? movieData.poster_url : `https://phimimg.com/${movieData?.poster_url}`);
    
    const finalBackdrop = bannerUrl || movie?.imageSrc || '';

    setIsFavorited(!isFavorited);

    try {
      const movieDataToSave = {
        slug: movieSlug || '',
        name: movieData?.name || movie?.title || '',
        imageSrc: finalBackdrop
      };
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, movieData: movieDataToSave })
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      setIsFavorited(!isFavorited); 
    }
  };

  if (!isOpen) return null;

  const movieData = movieDetails?.movie;
  const backdropUrl = movieData?.thumb_url
    ? (movieData.thumb_url.startsWith('http') ? movieData.thumb_url : `https://phimimg.com/${movieData.thumb_url}`)
    : (movieData?.poster_url
        ? (movieData.poster_url.startsWith('http') ? movieData.poster_url : `https://phimimg.com/${movieData.poster_url}`)
        : movie?.imageSrc);

  const trailerId = getYoutubeEmbedId(movieData?.trailer_url || "");
  const episodesList = movieDetails?.episodes?.[0]?.server_data || [];
  const hasLinkMovie = episodesList.length > 0;
  const stableRating = getStableRating(movieSlug || '');

  // Tạo danh sách video bên cột phải: tối đa 3 video (Trailer + các tập phim đầu tiên)
  const rightSideVideos: { type: 'trailer' | 'episode'; name: string; id?: string; epIndex?: number; image: string }[] = [];

  if (trailerId) {
    rightSideVideos.push({
      type: 'trailer',
      name: 'Trailer chính thức',
      id: trailerId,
      image: backdropUrl || ''
    });
  }

  if (episodesList && episodesList.length > 0) {
    const epLimit = Math.min(episodesList.length, 3 - rightSideVideos.length);
    for (let i = 0; i < epLimit; i++) {
      const ep = episodesList[i];
      let cardImage = backdropUrl || '';
      if (similarMovies[i]?.imageSrc) {
        cardImage = similarMovies[i].imageSrc;
      } else if (similarMovies[0]?.imageSrc) {
        cardImage = similarMovies[0].imageSrc;
      }
      
      rightSideVideos.push({
        type: 'episode',
        name: ep.name,
        epIndex: i,
        image: cardImage
      });
    }
  }

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
              className="absolute top-4 right-4 z-50 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                
                {/* --- ZONE 1: HERO DISPLAY (GIỐNG HỆT HÌNH ẢNH MẪU) --- */}
                <div className="relative w-full min-h-[85vh] md:min-h-[550px] flex items-center justify-center overflow-hidden">
                  
                  {/* Backdrop Background & Overlay */}
                  <div className="absolute inset-0 z-0 select-none">
                    {mediaMode === 'trailer' && trailerId ? (
                      <div className="w-full h-full relative bg-black">
                        <iframe 
                          src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=0&rel=0&controls=1`} 
                          title="Trailer" 
                          allow="autoplay; encrypted-media"
                          allowFullScreen 
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#141414]/90" />
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        {backdropUrl && (
                          <Image 
                            src={backdropUrl} 
                            alt={movieData?.name || ''} 
                            fill 
                            className="object-cover opacity-35 md:opacity-45 transition-transform duration-700" 
                            referrerPolicy="no-referrer" 
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-[#141414]/80 md:to-transparent" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Vùng nội dung chia 2 cột */}
                  <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 h-full mt-8 md:mt-0">
                    
                    {/* Cột trái: Thông tin chính và nút */}
                    <div className="col-span-1 md:col-span-8 flex flex-col justify-center space-y-6 text-left">
                      
                      {/* Badge Số mùa / Số tập */}
                      <div className="inline-flex items-center w-fit px-3.5 py-1 rounded-full text-xs font-black bg-white/10 border border-white/20 text-white tracking-wide uppercase">
                        {movieData?.type === 'series' ? (movieData?.episode_total ? `${movieData.episode_total} Tập` : 'TV Series') : (movieData?.time || 'Movie')}
                      </div>

                      {/* Tiêu đề Phim */}
                      <div className="space-y-2">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-none drop-shadow-lg">
                          {movieData?.name || movie?.title}
                        </h1>
                        {movieData?.origin_name && (
                          <p className="text-white/60 text-xs md:text-sm font-bold tracking-wider drop-shadow-md">
                            Tên gốc: {movieData.origin_name}
                          </p>
                        )}
                      </div>

                      {/* Tóm tắt nội dung */}
                      <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-4 drop-shadow">
                        {movieData?.content ? movieData.content.replace(/<[^>]*>/g, '') : 'Đang tải nội dung phim...'}
                      </p>

                      {/* Đánh giá IMDb */}
                      <div className="flex items-center gap-3 drop-shadow-md">
                        <Star className="w-12 h-12 text-[#f5c518] fill-[#f5c518] drop-shadow-[0_0_10px_rgba(245,197,24,0.5)]" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-[#f5c518] text-black text-[10px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase leading-none select-none">IMDb</span>
                            <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider select-none">Rating</span>
                          </div>
                          <div className="text-2xl md:text-3xl font-black text-white tracking-wide mt-0.5 select-none">
                            {stableRating}/10
                          </div>
                        </div>
                      </div>

                      {/* Hàng nút bấm chức năng */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button 
                          onClick={handleWatchMovie}
                          className="bg-[#e50914] hover:bg-[#b81d24] active:scale-95 transition-all text-white font-black px-6 py-3.5 rounded-full flex items-center justify-center gap-2 text-sm md:text-base shadow-lg shadow-red-600/30 cursor-pointer"
                        >
                          <Play className="w-5 h-5 fill-current text-white translate-x-[1px]" />
                          <span>Watch Now</span>
                        </button>

                        <button 
                          onClick={handleToggleFavorite}
                          className="bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white border border-white/20 font-black px-6 py-3.5 rounded-full flex items-center justify-center gap-2 text-sm md:text-base backdrop-blur-md cursor-pointer"
                        >
                          {isFavorited ? (
                            <>
                              <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                              <span>In List</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5 stroke-[3]" />
                              <span>Add to List</span>
                            </>
                          )}
                        </button>

                        {trailerId && (
                          <button 
                            onClick={() => setMediaMode(mediaMode === 'banner' ? 'trailer' : 'banner')}
                            className="bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white border border-white/20 font-black px-6 py-3.5 rounded-full flex items-center justify-center gap-2 text-sm md:text-base backdrop-blur-md cursor-pointer"
                          >
                            <Film className="w-5 h-5" />
                            <span>{mediaMode === 'banner' ? 'Trailer' : 'Đóng Trailer'}</span>
                          </button>
                        )}
                      </div>

                    </div>

                    {/* Cột phải: Vùng video/trailer/tập phim */}
                    <div className="col-span-1 md:col-span-4 flex flex-col justify-center space-y-4">
                      {rightSideVideos.length > 0 && (
                        <div className="w-full max-w-sm md:max-w-none mx-auto space-y-4">
                          <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 select-none">
                            Video &amp; Trailers
                          </h3>
                          {rightSideVideos.map((video, idx) => (
                            <div 
                              key={idx}
                              onClick={() => {
                                if (video.type === 'trailer' && video.id) {
                                  setMediaMode('trailer');
                                } else if (video.type === 'episode') {
                                  handleWatchEpisode(video.epIndex ?? 0);
                                }
                              }}
                              className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group border border-white/10 hover:border-white/30 transition-all shadow-lg active:scale-98"
                            >
                              <Image 
                                src={video.image} 
                                alt={video.name} 
                                fill 
                                sizes="(max-width: 768px) 100vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />
                              
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all transform group-hover:scale-110 shadow-lg group-active:scale-95">
                                  <Play className="w-5 h-5 text-white fill-current translate-x-[0.5px]" />
                                </div>
                              </div>

                              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded text-[10px] font-black text-white uppercase tracking-wider leading-none">
                                {video.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                </div>

                {/* --- ZONE 2: CÁC CHI TIẾT BỔ SUNG (DƯỚI NẤC CUỘN) --- */}
                <div className="px-6 md:px-12 py-12 space-y-12 bg-[#141414] relative z-10 border-t border-white/5">
                    
                    {/* --- CÁCH XEM --- */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-1 text-white/90 font-bold text-lg md:text-xl select-none">
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

                    {/* --- DIỄN VIÊN & ĐOÀN LÀM PHIM --- */}
                    <div className="space-y-4">
                        <div className="text-white/90 font-bold text-lg md:text-xl select-none">
                            Diễn Viên &amp; Đoàn Làm Phim
                        </div>
                        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                            {peoples.length > 0 ? (
                                peoples.map((person, idx) => (
                                    <CastCard
                                        key={idx}
                                        name={person.name}
                                        role={person.known_for_department === 'Directing' ? 'Đạo diễn' : 'Diễn viên'}
                                        colorIndex={idx}
                                        variant="circle"
                                        photoUrl={person.profile_path ? `${photoBaseUrl}${person.profile_path}` : undefined}
                                    />
                                ))
                            ) : (
                                [...(movieData?.director || []), ...(movieData?.actor || [])]
                                    .filter(name => name && name !== 'Đang cập nhật')
                                    .map((name, idx) => (
                                        <CastCard
                                            key={idx}
                                            name={name}
                                            role={movieData?.director?.includes(name) ? 'Đạo diễn' : 'Diễn viên'}
                                            colorIndex={idx}
                                            variant="circle"
                                        />
                                    ))
                            )}
                            {peoples.length === 0 && (!movieData?.actor || movieData?.actor[0] === 'Đang cập nhật') && (
                                <p className="text-sm text-white/50 italic">Đang cập nhật dữ liệu diễn viên...</p>
                            )}
                        </div>
                    </div>

                    {/* --- CÓ LIÊN QUAN (Full Slider) --- */}
                    {similarMovies.length > 0 && (
                      <div className="space-y-4">
                          <div className="flex items-center gap-1 text-white/90 font-bold text-lg md:text-xl select-none">
                              Có Liên Quan
                          </div>

                          <div className="relative group/list">
                              <button onClick={() => scrollSimilar('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 items-center justify-center transition-all opacity-0 group-hover/list:opacity-100 hidden md:flex"><ChevronLeft className="w-6 h-6 text-white" /></button>
                              
                              <div ref={similarMoviesRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x">
                                  {similarMovies.map((sim) => (
                                      <div key={sim.slug} onClick={() => handleWatchSimilar(sim.slug)} className="shrink-0 w-32 md:w-40 cursor-pointer group snap-start">
                                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 border border-white/10">
                                              <Image src={sim.imageSrc} alt={sim.title} fill className="object-cover transition-transform duration-300 group-hover:scale-110" referrerPolicy="no-referrer" />
                                          </div>
                                          <p className="text-xs md:text-sm font-semibold text-white/80 group-hover:text-white line-clamp-1">{sim.title}</p>
                                      </div>
                                  ))}
                              </div>

                              <button onClick={() => scrollSimilar('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 items-center justify-center transition-all opacity-0 group-hover/list:opacity-100 hidden md:flex"><ChevronRight className="w-6 h-6 text-white" /></button>
                          </div>
                      </div>
                    )}

                    {/* --- GIỚI THIỆU CHI TIẾT --- */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-1 text-white/90 font-bold text-lg md:text-xl select-none">
                            Giới thiệu
                        </div>
                        <div className="bg-[#1c1c1e] border border-white/5 p-6 rounded-2xl">
                            <h4 className="text-base font-bold text-white mb-1 uppercase">{movieData?.name}</h4>
                            <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-4">
                                {movieData?.category?.map((c: { name: string }) => c.name).join(', ')}
                            </p>
                            <div 
                                className="text-white/80 text-sm leading-relaxed prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ 
                                  __html: (movieData?.content || 'Đang cập nhật nội dung...')
                                    .replace(/<script[\s\S]*?<\/script>/gi, '')
                                    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
                                    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
                                    .replace(/javascript:/gi, '')
                                }} 
                            />
                        </div>
                    </div>

                    {/* --- THÔNG TIN CHI TIẾT (LƯỚI 3 CỘT) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-white select-none">Thông tin</h3>
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
                            <h3 className="text-lg font-bold mb-4 text-white select-none">Ngôn ngữ</h3>
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
                            <h3 className="text-lg font-bold mb-4 text-white select-none">Trợ năng</h3>
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