'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { getMovieDetails, getMoviesByGenre, searchMoviesPaginated } from '@/lib/api';
import Hls from 'hls.js';
import { ListVideo, CircleAlert, MoreHorizontal, ChevronUp, Mic2, ChevronLeft, ChevronRight, Heart, Play, Pause, Maximize, Minimize, Settings, Subtitles, Volume2, VolumeX, RotateCcw, RotateCw, PictureInPicture, Share, Film, Tv } from 'lucide-react'; 
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { MovieDetails, Movie } from '@/types';
import CastCard, { useTmdbActorPhotos } from '@/components/movies/CastCard';

const EPISODES_PER_GROUP = 100;
const INITIAL_VISIBLE_EPISODES = 24; 

export default function MovieDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession(); 

  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const router = useRouter();

  // Lấy ảnh diễn viên từ ophim peoples API
  const actorPhotoMap = useTmdbActorPhotos(slug);
  
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  // === STATE CHO CUSTOM VIDEO PLAYER ===
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useEmbedPlayer, setUseEmbedPlayer] = useState(false);
  
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [activeSubIndex, setActiveSubIndex] = useState(-1);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  // === THÊM STATE CHO TOUCH GESTURES ===
  const lastTapRef = useRef<number>(0);
  const [seekFeedback, setSeekFeedback] = useState<'forward' | 'backward' | null>(null);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // STATE: Quản lý việc tự động ẩn giao diện
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  
  const hlsRef = useRef<Hls | null>(null);

  // 1. FETCH DỮ LIỆU PHIM
  useEffect(() => {
    const fetchMovie = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await getMovieDetails(slug);
        setMovieDetails(data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu phim:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [slug]);

  const servers = movieDetails?.episodes || [];
  const currentServer = servers[activeServerIndex] || {};
  const episodesList = currentServer.server_data || [];
  
  const currentEpisode = episodesList[currentEpisodeIndex];
  const hasLinkMovie = episodesList.length > 0;

  const episodeGroups = [];
  for (let i = 0; i < episodesList.length; i += EPISODES_PER_GROUP) {
    episodeGroups.push(episodesList.slice(i, i + EPISODES_PER_GROUP));
  }

  // 2. ĐỌC LỊCH SỬ TỪ MONGODB
  useEffect(() => {
    if (!movieDetails || hasLoadedHistory) return;
    const userEmail = session?.user?.email;

    if (!userEmail) {
      setHasLoadedHistory(true);
      return;
    }

    const fetchUserHistory = async () => {
      try {
        const res = await fetch(`/api/history?email=${userEmail}`);
        const data = await res.json();
        
        if (res.ok && data.history) {
          const previousWatch = data.history.find((item: { slug: string, serverIndex?: number, episodeIndex?: number }) => item.slug === slug);
          if (previousWatch) {
            setActiveServerIndex(previousWatch.serverIndex || 0);
            setCurrentEpisodeIndex(previousWatch.episodeIndex || 0);
            const correctGroupIndex = Math.floor((previousWatch.episodeIndex || 0) / EPISODES_PER_GROUP);
            if (!isNaN(correctGroupIndex)) setActiveGroupIndex(correctGroupIndex);
          }
        }
      } catch (error) {
        console.error("Lỗi đọc lịch sử:", error);
      } finally {
        setHasLoadedHistory(true);
      }
    };

    fetchUserHistory();
  }, [session, movieDetails, hasLoadedHistory, slug]);

  // 3. KIỂM TRA PHIM YÊU THÍCH
  useEffect(() => {
    const userEmail = session?.user?.email;
    if (!userEmail || !slug) return;

    const checkFavorite = async () => {
      try {
        const res = await fetch(`/api/favorites?email=${userEmail}`);
        const data = await res.json();
        if (res.ok && data.favorites) {
          const isFav = data.favorites.some((item: { slug: string }) => item.slug === slug);
          setIsFavorited(isFav);
        }
      } catch (error) {
        console.error("Lỗi check phim yêu thích:", error);
      }
    };
    checkFavorite();
  }, [session, slug]);

  // 4. LƯU LỊCH SỬ NGẦM
  useEffect(() => {
    const userEmail = session?.user?.email;
    if (!userEmail || !movieDetails?.movie || !hasLinkMovie || !hasLoadedHistory) return;

    const syncHistoryToDB = async () => {
      const currentEpName = episodesList[currentEpisodeIndex]?.name || '';
      const movieInfo = movieDetails?.movie;
      if (!movieInfo) return;

      const bannerUrl = movieInfo.thumb_url?.startsWith('http') 
          ? movieInfo.thumb_url 
          : (movieInfo.poster_url?.startsWith('http') ? movieInfo.poster_url : `https://phimimg.com/${movieInfo.poster_url}`);

      const movieData = {
        slug: slug,
        name: movieInfo.name,
        episodeName: currentEpName,
        episodeIndex: currentEpisodeIndex,
        serverIndex: activeServerIndex,
        imageSrc: bannerUrl,
      };

      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, movieData })
        });
      } catch (error) {
        console.error("Lỗi đồng bộ lịch sử:", error);
      }
    };

    const timeoutId = setTimeout(() => { syncHistoryToDB(); }, 5000);
    return () => clearTimeout(timeoutId);
  }, [movieDetails, currentEpisodeIndex, activeServerIndex, session, hasLoadedHistory, hasLinkMovie, episodesList, slug]);

  // 5. NÚT TRÁI TIM
  const handleToggleFavorite = async () => {
    const userEmail = session?.user?.email;
    if (!userEmail) {
      alert("Vui lòng đăng nhập để thêm phim vào danh sách Yêu thích!");
      return;
    }
    setIsFavorited(!isFavorited);

    const movieInfo = movieDetails?.movie;
    if (!movieInfo) return;

    const bannerUrl = movieInfo.thumb_url?.startsWith('http') 
        ? movieInfo.thumb_url 
        : (movieInfo.poster_url?.startsWith('http') ? movieInfo.poster_url : `https://phimimg.com/${movieInfo.poster_url}`);

    const movieData = {
      slug: slug,
      name: movieInfo.name,
      imageSrc: bannerUrl,
    };

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, movieData })
      });
      const data = await res.json();
      if (res.ok) setIsFavorited(data.isFavorited);
    } catch (error) {
      console.error("Lỗi bấm yêu thích:", error);
      setIsFavorited(!isFavorited);
    }
  };

  // 6. CHUYỂN NHÓM TẬP TỰ ĐỘNG KHI CHUYỂN TẬP (chỉ chạy khi episode thay đổi, không ghi đè click tab)
  const prevEpisodeIndexRef = useRef(currentEpisodeIndex);
  useEffect(() => {
    if (prevEpisodeIndexRef.current !== currentEpisodeIndex) {
      prevEpisodeIndexRef.current = currentEpisodeIndex;
      const correctGroupIndex = Math.floor(currentEpisodeIndex / EPISODES_PER_GROUP);
      if (!isNaN(correctGroupIndex)) {
        setActiveGroupIndex(correctGroupIndex);
      }
    }
  }, [currentEpisodeIndex]);

  // Reset trình phát về chế độ chính khi chuyển tập phim hoặc server âm thanh
  useEffect(() => {
    setUseEmbedPlayer(false);
  }, [currentEpisodeIndex, activeServerIndex]);

  // FETCH PHIM LIÊN QUAN - THÔNG MINH HƠN
  useEffect(() => {
    if (!movieDetails?.movie) return;

    const fetchSmartRelated = async () => {
      const movieName = movieDetails.movie.name || '';
      const originName = movieDetails.movie.origin_name || '';

      // === BƯỚC 1: Trích xuất "tên gốc của series" ===
      // Xoá các suffix/infix số phần, season, movie, colon-subtitle, v.v.
      // VD: "One Piece: The Movie"  → "One Piece"
      //     "Đảo Hải Tặc 1: Đảo Châu Báu" → "Đảo Hải Tặc"
      //     "ReZero Season 4"        → "ReZero"
      //     "Naruto Shippuden"       → "Naruto Shippuden" (giữ nguyên)
      const stripSeriesNumber = (name: string) =>
        name
          // bỏ ": bất cứ thứ gì" (subtitle sau dấu hai chấm)
          .replace(/\s*:.*$/, '')
          // bỏ suffix có từ khoá số phần
          .replace(/\s*([-–]?\s*(phần|season|part|movie|film|tập|ep|episode|mùa)\s*\d+)$/gi, '')
          // bỏ số đứng cuối tên (VD: "Đảo Hải Tặc 1")
          .replace(/\s+\d+$/, '')
          .trim();

      const seriesKeywordEn = stripSeriesNumber(originName);
      const seriesKeywordVi = stripSeriesNumber(movieName);
      const TOTAL_SLOTS = 12;

      // === BƯỚC 2: Search song song keyword EN và VI, merge + dedup ===
      let seriesMovies: Movie[] = [];
      try {
        const searches = await Promise.allSettled([
          seriesKeywordEn.length >= 2
            ? searchMoviesPaginated(seriesKeywordEn, 1, 20)
            : Promise.resolve({ items: [] }),
          // Chỉ search VI nếu khác EN để tránh duplicate request
          seriesKeywordVi.length >= 2 && seriesKeywordVi.toLowerCase() !== seriesKeywordEn.toLowerCase()
            ? searchMoviesPaginated(seriesKeywordVi, 1, 20)
            : Promise.resolve({ items: [] }),
        ]);

        const seen = new Set<string>([slug]); // loại phim hiện tại
        for (const result of searches) {
          if (result.status === 'fulfilled') {
            for (const m of result.value.items as Movie[]) {
              if (!seen.has(m.slug)) {
                seen.add(m.slug);
                seriesMovies.push(m);
              }
            }
          }
        }
        seriesMovies = seriesMovies.slice(0, TOTAL_SLOTS);
      } catch {
        seriesMovies = [];
      }

      // === BƯỚC 3: Nếu chưa đủ slot → lấp đầy bằng phim cùng thể loại ===
      let combined = [...seriesMovies];
      if (combined.length < TOTAL_SLOTS) {
        const categorySlug = movieDetails.movie.category[0]?.slug;
        if (categorySlug) {
          try {
            const genreMovies = await getMoviesByGenre(categorySlug);
            const existingSlugs = new Set(combined.map((m) => m.slug));
            existingSlugs.add(slug);
            const extra = (genreMovies as Movie[])
              .filter((m) => !existingSlugs.has(m.slug))
              .slice(0, TOTAL_SLOTS - combined.length);
            combined = [...combined, ...extra];
          } catch {
            // ignore
          }
        }
      }

      setRelatedMovies(combined.slice(0, TOTAL_SLOTS));
    };

    fetchSmartRelated();
  }, [movieDetails, slug]);


  // 7. VIDEO PLAYER CHỐNG LAG & BẮT PHỤ ĐỀ
  useEffect(() => {
    if (useEmbedPlayer || !hasLinkMovie || !currentEpisode?.link_m3u8 || !videoRef.current) return;
    const videoSrc = currentEpisode.link_m3u8;
    const video = videoRef.current;
    
    // 1. Nhận diện trình duyệt:
    // iPadOS 13+ có thể báo là Mac, nên thêm check ontouchend để chắc chắn là thiết bị cảm ứng (iOS/iPadOS)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    
    // 2. Quyết định phát:
    if ((isSafari || isIOS) && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Bắt buộc dùng Native HLS cho toàn bộ hệ sinh thái iOS/iPadOS và Safari Desktop.
      video.src = videoSrc;
      video.load(); // Khởi động stream
      
      video.addEventListener('loadedmetadata', () => { 
        video.play().catch((e) => {
           console.log("Autoplay blocked by Safari:", e);
        }); 
        
        const tracks = [];
        for (let i = 0; i < video.textTracks.length; i++) {
          if (video.textTracks[i].kind === 'subtitles' || video.textTracks[i].kind === 'captions') {
            tracks.push(video.textTracks[i]);
          }
        }
        setSubtitleTracks(tracks);
      }, { once: true });
    } else if (Hls.isSupported()) {
      // iPad, Mac, Windows, Android -> Let hls.js handle it for maximum stability
      // Since iPad supports MSE (MediaSource Extensions) on iPadOS 13+, hls.js works beautifully.
      const hls = new Hls({
        startLevel: -1, 
        capLevelToPlayerSize: true, 
        maxBufferLength: 15, // Giảm từ 60 xuống 15 giây
        maxMaxBufferLength: 30, // Giảm từ 600 xuống 30 giây
        maxBufferSize: 15 * 1000 * 1000, // Giảm buffer size tối đa xuống 15MB
        abrEwmaDefaultEstimate: 500000, 
      });
      hlsRef.current = hls; 
      
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (hls.subtitleTracks && hls.subtitleTracks.length > 0) {
           setSubtitleTracks(hls.subtitleTracks);
        }
        video.play().catch(() => {}); 
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.log('Fatal unrecoverable error, switching to embed player...');
              setUseEmbedPlayer(true);
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.load();
      video.addEventListener('loadedmetadata', () => { 
        video.play().catch(() => {}); 
        const tracks = [];
        for (let i = 0; i < video.textTracks.length; i++) {
          if (video.textTracks[i].kind === 'subtitles' || video.textTracks[i].kind === 'captions') {
            tracks.push(video.textTracks[i]);
          }
        }
        setSubtitleTracks(tracks);
      }, { once: true });
    }

    return () => { 
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hasLinkMovie, currentEpisode, useEmbedPlayer]);

  // === CÁC HÀM XỬ LÝ GIAO DIỆN PLAYER ===
  
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (!isSpeedMenuOpen && !isSubMenuOpen && isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setIsControlsVisible(false);
        }, 3000);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && !isSpeedMenuOpen && !isSubMenuOpen) {
        setIsControlsVisible(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
      setIsControlsVisible(true);
    }
  };

  const handleVideoInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Nhấn đúp (Double tap) -> Phóng to/Thu nhỏ màn hình (Fullscreen)
      toggleFullScreen();
      lastTapRef.current = 0; // Reset
    } else {
      // Nhấn đơn (Single tap)
      // Nếu controls đang ẩn (thường gặp dể di chuột ra/hoặc trên điện thoại), bấm 1 lần là hiện
      // Nếu đang hiện, bấm 1 lần là play/pause
      if (!isControlsVisible) {
        setIsControlsVisible(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => setIsControlsVisible(false), 3000);
      } else {
        setIsControlsVisible(false);
      }
      lastTapRef.current = now;
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleTimeUpdate = () => setCurrentTime(videoRef.current?.currentTime || 0);
  const handleLoadedMetadata = () => setDuration(videoRef.current?.duration || 0);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "00:00";
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (!document.fullscreenElement && !(video as any).webkitDisplayingFullscreen) {
        if (playerContainerRef.current?.requestFullscreen) {
          playerContainerRef.current.requestFullscreen().catch(err => console.error(err));
        } else if ((video as any).webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
        } else if ((video as any).webkitRequestFullscreen) {
          (video as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((video as any).webkitExitFullscreen) {
          (video as any).webkitExitFullscreen();
        }
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    
    const video = videoRef.current;
    const handleWebKitFsChange = () => {
      setIsFullscreen((video as any).webkitDisplayingFullscreen || false);
    };
    if (video) {
      video.addEventListener('webkitbeginfullscreen', handleWebKitFsChange);
      video.addEventListener('webkitendfullscreen', handleWebKitFsChange);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', handleWebKitFsChange);
        video.removeEventListener('webkitendfullscreen', handleWebKitFsChange);
      }
    };
  }, [hasLinkMovie]);

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setIsSpeedMenuOpen(false);
  };

  const changeSubtitle = (index: number) => {
    setActiveSubIndex(index);
    setIsSubMenuOpen(false);

    if (Hls.isSupported() && hlsRef.current) {
      hlsRef.current.subtitleTrack = index; 
    } else if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      let subIdx = 0;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind === 'subtitles' || tracks[i].kind === 'captions') {
          tracks[i].mode = (subIdx === index) ? 'showing' : 'hidden';
          subIdx++;
        }
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (!newMutedState && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("Lỗi PiP:", error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: movieDetails?.movie?.name,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Đã copy link phim vào khay nhớ tạm!');
      }
    } catch (err) {
      console.log('Chia sẻ bị hủy', err);
    }
  };
  // ==============================================

  // === KEYBOARD SHORTCUTS ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu user đang gõ vào input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      switch (e.key) {
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullScreen();
          break;

        case ' ':
        case 'Spacebar':
          e.preventDefault();
          togglePlay();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-10);
          setSeekFeedback('backward');
          setTimeout(() => setSeekFeedback(null), 500);
          break;

        case 'ArrowRight':
          e.preventDefault();
          skipTime(10);
          setSeekFeedback('forward');
          setTimeout(() => setSeekFeedback(null), 500);
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(1, videoRef.current.volume + 0.1);
            videoRef.current.volume = newVol;
            videoRef.current.muted = false;
            setVolume(newVol);
            setIsMuted(false);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(0, videoRef.current.volume - 0.1);
            videoRef.current.volume = newVol;
            videoRef.current.muted = newVol === 0;
            setVolume(newVol);
            setIsMuted(newVol === 0);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ===========================

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      tabContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white pt-6 md:pt-[100px] px-4 md:px-8 pb-20">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
          {/* Skeleton Video Player */}
          <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl animate-skeleton" />
          
          {/* Skeleton Title & Metadata */}
          <div className="flex flex-col gap-3 mt-4">
            <div className="h-8 w-1/2 bg-white/10 rounded-lg animate-skeleton" />
            <div className="flex gap-4">
              <div className="h-4 w-12 bg-white/5 rounded animate-skeleton" />
              <div className="h-4 w-16 bg-white/5 rounded animate-skeleton" />
              <div className="h-4 w-10 bg-white/5 rounded animate-skeleton" />
            </div>
          </div>

          {/* Skeleton Episodes */}
          <div className="bg-white/5 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col gap-4 mt-2">
            <div className="h-5 w-36 bg-white/10 rounded animate-skeleton" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 w-16 bg-white/5 rounded-xl animate-skeleton" />
              ))}
            </div>
          </div>

          {/* Skeleton Description */}
          <div className="h-24 w-full bg-white/5 border border-white/5 rounded-2xl animate-skeleton" />

          {/* Skeleton Cast & Crew */}
          <div className="flex flex-col gap-4">
            <div className="h-4 w-24 bg-white/10 rounded animate-skeleton" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl w-40 animate-skeleton" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movieDetails?.movie) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy phim!</h1>
        <Link href="/" className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors active-scale">Về trang chủ</Link>
      </div>
    );
  }

  const { movie } = movieDetails;
  const bannerUrl = movie.thumb_url?.startsWith('http') ? movie.thumb_url : (movie.poster_url.startsWith('http') ? movie.poster_url : `https://phimimg.com/${movie.poster_url}`);

  const currentGroupEpisodes = episodeGroups[activeGroupIndex] || [];
  const visibleEpisodes = isExpanded ? currentGroupEpisodes : currentGroupEpisodes.slice(0, INITIAL_VISIBLE_EPISODES);
  const hasMoreInGroup = currentGroupEpisodes.length > INITIAL_VISIBLE_EPISODES;

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const progressPercent = (currentTime / (duration || 1)) * 100;
  
  // Xác định xem có cần render nguyên cái mảng Cast hay không
  const validCast = [...(movie.director || []), ...(movie.actor || [])].filter(name => name && name !== 'Đang cập nhật');

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-cyan-500/30 pb-20 relative overflow-hidden">
      <Navbar />

      <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/30 blur-[120px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-4 md:pt-[100px] relative z-10 flex flex-col gap-8">
        
        {/* ======================================================= */}
        {/* GIAO DIỆN VIDEO PLAYER                                  */}
        {/* ======================================================= */}
        {hasLinkMovie ? (
          useEmbedPlayer ? (
            <div 
              ref={playerContainerRef} 
              className={`relative w-full aspect-video bg-black overflow-hidden ${isFullscreen ? 'rounded-none border-none shadow-none' : 'rounded-2xl md:rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]'}`}
            >
              <iframe
                src={currentEpisode?.link_embed}
                className="w-full h-full border-none"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            </div>
          ) : (
            <div 
              ref={playerContainerRef} 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => {
                // Chạm vào container cũng hiện controls trên mobile
                setIsControlsVisible(true);
                if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
                controlsTimeoutRef.current = setTimeout(() => setIsControlsVisible(false), 3000);
              }}
              className={`relative w-full aspect-video bg-black overflow-hidden group select-none flex flex-col justify-center touch-manipulation ${!isPlaying || isControlsVisible ? 'cursor-auto' : 'cursor-none'} ${isFullscreen ? 'rounded-none border-none shadow-none' : 'rounded-2xl md:rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]'}`}
            >
              <video 
                ref={videoRef} 
                className="w-full h-full object-contain bg-black outline-none pointer-events-none"
                poster={bannerUrl} 
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => { setIsPlaying(false); setIsControlsVisible(true); }}
                onEnded={() => {
                  if (currentEpisodeIndex < episodesList.length - 1) {
                     setCurrentEpisodeIndex(prev => prev + 1);
                  }
                }}
                onError={() => {
                  console.log("Video playback error, auto fallback to embed player...");
                  setUseEmbedPlayer(true);
                }}
                autoPlay
                playsInline
              />

              {/* Lớp phủ tương tác (Click/Touch Overlay) thay thế trực tiếp click vào video */}
              <div 
                className="absolute inset-0 z-0 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleVideoInteraction(e); }}
              />

              {/* HIỆU ỨNG TUA NHANH 10S */}
              <div className={`absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-white/20 to-transparent flex items-center justify-center transition-opacity duration-300 pointer-events-none rounded-l-2xl md:rounded-l-3xl ${seekFeedback === 'backward' ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="flex flex-col items-center gap-2 animate-bounce">
                      <RotateCcw className="w-8 h-8 md:w-12 md:h-12 text-white" />
                      <span className="text-white font-bold text-sm md:text-lg">-10s</span>
                  </div>
              </div>
              <div className={`absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-white/20 to-transparent flex items-center justify-center transition-opacity duration-300 pointer-events-none rounded-r-2xl md:rounded-r-3xl ${seekFeedback === 'forward' ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="flex flex-col items-center gap-2 animate-bounce">
                      <RotateCw className="w-8 h-8 md:w-12 md:h-12 text-white" />
                      <span className="text-white font-bold text-sm md:text-lg">+10s</span>
                  </div>
              </div>

              {/* THANH TOP BAR (CÀI ĐẶT GÓC PHẢI TRÊN CÙNG MOBILE, VOLUME TRÊN DESKTOP) */}
              <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-end items-start gap-3 z-30 transition-opacity duration-300 ${!isPlaying || isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={(e) => e.stopPropagation()}>
                  
                  {/* CỤM NÚT CÀI ĐẶT/PHỤ ĐỀ TRÊN MOBILE (ẨN KHI FULLSCREEN HOẶC TRÊN DESKTOP) */}
                  <div className={`pointer-events-auto flex items-center gap-3 bg-[#1a1a1c]/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl shrink-0 md:hidden ${isFullscreen ? 'hidden' : 'flex'}`}>
                      {/* Nút Phụ Đề */}
                      <div className="relative">
                          {isSubMenuOpen && (
                              <>
                                  {/* Nền ảo hỗ trợ đóng menu trên điện thoại/iPad khi chạm ra ngoài */}
                                  <div className="fixed inset-0 z-40" onClick={() => setIsSubMenuOpen(false)} />
                                  <div className="absolute top-full right-0 mt-3 w-max min-w-[180px] z-50">
                                  <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col py-2 animate-in fade-in slide-in-from-top-2">
                                      <div className="px-4 py-2 text-xs font-bold text-white/50 border-b border-white/10 uppercase mb-1">Ngôn ngữ hỗ trợ</div>
                                      <button onClick={() => changeSubtitle(-1)} className={`px-4 py-3 text-sm text-left hover:bg-white/20 transition-colors flex items-center gap-2 whitespace-normal leading-snug ${activeSubIndex === -1 ? 'text-cyan-400 font-bold' : 'text-white/80 font-medium'}`}>Tắt phụ đề</button>
                                      {subtitleTracks.length > 0 ? (
                                          subtitleTracks.map((track, idx) => (
                                              <button key={idx} onClick={() => changeSubtitle(idx)} className={`px-4 py-3 text-sm text-left hover:bg-white/20 transition-colors flex items-center gap-2 whitespace-normal leading-snug ${activeSubIndex === idx ? 'text-cyan-400 font-bold' : 'text-white/80 font-medium'}`}>{track.name || track.label || track.language || `Ngôn ngữ ${idx + 1}`}</button>
                                          ))
                                      ) : (
                                          <div className="px-4 py-3 text-sm text-white/40 italic flex items-center gap-2">Bản mặc định (Vietsub)</div>
                                      )}
                                  </div>
                                  </div>
                              </>
                          )}
                          <button onClick={() => { setIsSubMenuOpen(!isSubMenuOpen); setIsSpeedMenuOpen(false); }} className={`w-8 h-8 hover:scale-110 active-scale transition flex items-center justify-center ${isSubMenuOpen || activeSubIndex !== -1 ? 'text-cyan-400' : 'text-white/70 hover:text-white'}`} title="Phụ đề"><Subtitles className="w-4 h-4" /></button>
                      </div>

                      {/* Nút Tốc Độ */}
                      <div className="relative">
                          {isSpeedMenuOpen && (
                              <>
                                  {/* Nền ảo hỗ trợ đóng menu trên điện thoại/iPad khi chạm ra ngoài */}
                                  <div className="fixed inset-0 z-40" onClick={() => setIsSpeedMenuOpen(false)} />
                                  <div className="absolute top-full right-0 mt-3 w-36 z-50">
                                  <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col py-2 animate-in fade-in slide-in-from-top-2">
                                      <div className="px-4 py-2 text-xs font-bold text-white/50 border-b border-white/10 uppercase mb-1">Tốc độ phát</div>
                                      {speedOptions.map(rate => (
                                          <button key={rate} onClick={() => changePlaybackRate(rate)} className={`px-4 py-2 text-sm text-left hover:bg-white/20 transition-colors flex items-center gap-2 ${playbackRate === rate ? 'text-cyan-400 font-bold' : 'text-white/80 font-medium'}`}>{rate === 1 ? 'Chuẩn (1x)' : `${rate}x`}</button>
                                      ))}
                                  </div>
                                  </div>
                              </>
                          )}
                          <button onClick={() => { setIsSpeedMenuOpen(!isSpeedMenuOpen); setIsSubMenuOpen(false); }} className={`w-8 h-8 hover:scale-110 active-scale transition flex items-center justify-center ${isSpeedMenuOpen || playbackRate !== 1 ? 'text-cyan-400' : 'text-white/70 hover:text-white'}`} title="Cài đặt tốc độ"><Settings className="w-4 h-4" /></button>
                      </div>
                  </div>

                  {/* THANH TĂNG GIẢM ÂM LƯỢNG (HIỆN KHI FULLSCREEN HOẶC TRÊN DESKTOP) */}
                  <div className={`pointer-events-auto items-center group/vol bg-[#1a1a1c]/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg ${isFullscreen ? 'flex' : 'hidden md:flex'}`}>
                      <button 
                          onClick={toggleMute} 
                          className="text-white/70 hover:text-white hover:scale-110 transition flex items-center justify-center shrink-0" 
                          title="Âm lượng"
                      >
                          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                      </button>
                      
                      <div className="w-0 overflow-hidden group-hover/vol:w-20 md:group-hover/vol:w-28 transition-all duration-300 ease-out flex items-center ml-0 group-hover/vol:ml-3">
                          <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={isMuted ? 0 : volume}
                              onChange={(e) => { e.stopPropagation(); handleVolumeChange(e); }}
                              className="w-full h-1 rounded-full appearance-none cursor-pointer hover:h-1.5 transition-all accent-white custom-slider"
                              style={{ background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) ${(isMuted ? 0 : volume) * 100}%)` }}
                          />
                      </div>
                  </div>
              </div>

              {/* CỤM NÚT TRUNG TÂM (Play/Pause, Tua 10s) */}
              <div 
                className={`absolute inset-0 flex items-center justify-center gap-6 md:gap-12 transition-all duration-300 z-10 ${!isPlaying ? 'opacity-100 bg-black/40 pointer-events-auto' : (isControlsVisible ? 'opacity-100 bg-black/10 pointer-events-auto' : 'opacity-0 pointer-events-none')}`}
                onClick={(e) => { e.stopPropagation(); handleVideoInteraction(e); }}
              >
                  
                  <button onClick={(e) => { e.stopPropagation(); skipTime(-10); }} className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-white/20 hover:scale-110 transition shadow-xl">
                      <RotateCcw className="w-5 h-5 md:w-7 md:h-7" />
                  </button>

                  <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="pointer-events-auto w-20 h-20 md:w-24 md:h-24 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white shadow-2xl hover:bg-white/20 hover:scale-110 transition">
                      {isPlaying ? <Pause className="w-10 h-10 md:w-12 md:h-12 fill-white" /> : <Play className="w-10 h-10 md:w-12 md:h-12 fill-white ml-2" />}
                  </button>

                  <button onClick={(e) => { e.stopPropagation(); skipTime(10); }} className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-white/20 hover:scale-110 transition shadow-xl">
                      <RotateCw className="w-5 h-5 md:w-7 md:h-7" />
                  </button>

              </div>

              {/* THANH ĐIỀU KHIỂN DƯỚI ĐÁY */}
              <div 
                className={`absolute bottom-0 left-0 right-0 p-4 md:p-8 pt-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end z-20 transition-opacity duration-300 ${!isPlaying || isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="pointer-events-auto flex flex-col w-full gap-3 md:gap-5">
                      
                      {/* DÒNG 1: TÊN PHIM VÀ CÁC NÚT CÀI ĐẶT (HIỆN KHI FULLSCREEN HOẶC TRÊN DESKTOP) */}
                      <div className={`items-end justify-between w-full ${isFullscreen ? 'flex' : 'hidden md:flex'}`}>
                          
                          <div className={`flex flex-col drop-shadow-lg pr-4 cursor-default ${isFullscreen ? 'flex' : 'hidden md:flex'}`}>
                              <p className="text-[10px] md:text-sm font-bold text-white/70 tracking-widest mb-1 uppercase">
                                  {currentEpisode?.name || 'Đang tải tập...'}
                              </p>
                              <h2 className="text-base md:text-2xl font-black text-white tracking-tight line-clamp-1">
                                  {movie.name}
                              </h2>
                          </div>

                              <div className="flex items-center gap-2 md:gap-4 bg-[#1a1a1c]/80 backdrop-blur-xl px-2 md:px-5 py-1 md:py-2.5 rounded-full border border-white/10 shadow-2xl shrink-0">
                                  
                                  {/* Nút Phụ Đề */}
                                  <div className="relative">
                                      {isSubMenuOpen && (
                                          <>
                                              {/* Nền ảo hỗ trợ đóng menu trên điện thoại/iPad khi chạm ra ngoài */}
                                              <div className="fixed inset-0 z-40" onClick={() => setIsSubMenuOpen(false)} />
                                              <div className="absolute bottom-full right-0 pb-6 w-max min-w-[180px] z-50">
                                              <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col py-2 animate-in fade-in slide-in-from-bottom-2">
                                                  <div className="px-4 py-2 text-xs font-bold text-white/50 border-b border-white/10 uppercase mb-1">Ngôn ngữ hỗ trợ</div>
                                                  <button onClick={() => changeSubtitle(-1)} className={`px-4 py-3 text-sm text-left hover:bg-white/20 transition-colors flex items-center gap-2 whitespace-normal leading-snug ${activeSubIndex === -1 ? 'text-cyan-400 font-bold' : 'text-white/80 font-medium'}`}>Tắt phụ đề</button>
                                                  {subtitleTracks.length > 0 ? (
                                                      subtitleTracks.map((track, idx) => (
                                                          <button key={idx} onClick={() => changeSubtitle(idx)} className={`px-4 py-3 text-sm text-left hover:bg-white/20 transition-colors flex items-center gap-2 whitespace-normal leading-snug ${activeSubIndex === idx ? 'text-cyan-400 font-bold' : 'text-white/80 font-medium'}`}>{track.name || track.label || track.language || `Ngôn ngữ ${idx + 1}`}</button>
                                                      ))
                                                  ) : (
                                                      <div className="px-4 py-3 text-sm text-white/40 italic flex items-center gap-2">Bản mặc định (Vietsub)</div>
                                                  )}
                                              </div>
                                              </div>
                                          </>
                                      )}
                                      <button onClick={() => { setIsSubMenuOpen(!isSubMenuOpen); setIsSpeedMenuOpen(false); }} className={`w-11 h-11 md:w-auto md:h-auto hover:scale-110 active-scale transition flex items-center justify-center ${isSubMenuOpen || activeSubIndex !== -1 ? 'text-cyan-400' : 'text-white/70 hover:text-white'}`} title="Phụ đề"><Subtitles className="w-5 h-5 md:w-5 md:h-5" /></button>
                                  </div>

                                  {/* Nút Tốc Độ */}
                                  <div className="relative">
                                      {isSpeedMenuOpen && (
                                          <>
                                              {/* Nền ảo hỗ trợ đóng menu trên điện thoại/iPad khi chạm ra ngoài */}
                                              <div className="fixed inset-0 z-40" onClick={() => setIsSpeedMenuOpen(false)} />
                                              <div className="absolute bottom-full right-0 pb-6 w-36 z-50">
                                              <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col py-2 animate-in fade-in slide-in-from-bottom-2">
                                                  <div className="px-4 py-2 text-xs font-bold text-white/50 border-b border-white/10 uppercase mb-1">Tốc độ phát</div>
                                                  {speedOptions.map(rate => (
                                                      <button key={rate} onClick={() => changePlaybackRate(rate)} className={`px-4 py-2 text-sm text-left hover:bg-white/20 transition-colors flex items-center gap-2 ${playbackRate === rate ? 'text-cyan-400 font-bold' : 'text-white/80 font-medium'}`}>{rate === 1 ? 'Chuẩn (1x)' : `${rate}x`}</button>
                                                  ))}
                                              </div>
                                              </div>
                                          </>
                                      )}
                                      <button onClick={() => { setIsSpeedMenuOpen(!isSpeedMenuOpen); setIsSubMenuOpen(false); }} className={`w-11 h-11 md:w-auto md:h-auto hover:scale-110 active-scale transition flex items-center justify-center ${isSpeedMenuOpen || playbackRate !== 1 ? 'text-cyan-400' : 'text-white/70 hover:text-white'}`} title="Cài đặt tốc độ"><Settings className="w-5 h-5 md:w-5 md:h-5" /></button>
                                  </div>

                                  {/* Nút Fullscreen */}
                                  <button onClick={toggleFullScreen} className="w-11 h-11 md:w-auto md:h-auto text-white/70 hover:text-white hover:scale-110 transition flex items-center justify-center active-scale" title="Toàn màn hình">
                                      {isFullscreen ? <Minimize className="w-5 h-5 md:w-5 md:h-5" /> : <Maximize className="w-5 h-5 md:w-5 md:h-5" />}
                                  </button>
                          </div>
                      </div>

                      {/* DÒNG 2: THANH TIMELINE TOÀN MÀN HÌNH */}
                      <div className="flex items-center gap-3 md:gap-4 w-full cursor-default">
                          
                          <span className="text-xs md:text-sm text-white/90 font-medium shrink-0 w-12 md:w-16 text-left font-mono drop-shadow-md">
                              {formatTime(currentTime)}
                          </span>

                          <input
                              type="range"
                              min={0}
                              max={duration || 100}
                              value={currentTime}
                              onChange={handleSeek}
                              className="flex-1 h-1.5 md:h-2 rounded-full appearance-none cursor-pointer hover:h-2.5 md:hover:h-3 transition-all relative z-10 accent-white shadow-lg custom-slider"
                              style={{ background: `linear-gradient(to right, white ${progressPercent}%, rgba(255, 255, 255, 0.2) ${progressPercent}%)` }}
                          />

                          <span className="text-xs md:text-sm text-white/90 font-medium shrink-0 w-14 md:w-16 text-right font-mono drop-shadow-md">
                              -{formatTime(duration - currentTime)}
                          </span>

                          {/* Nút Thu Phóng Trên Mobile (Chỉ hiện khi KHÔNG FULLSCREEN & TRÊN MOBILE - Bên phải đồng hồ thời gian còn lại) */}
                          <button 
                              onClick={toggleFullScreen}
                              className={`hover:scale-110 active-scale transition flex items-center justify-center text-white/70 hover:text-white shrink-0 md:hidden ${isFullscreen ? 'hidden' : 'flex'}`}
                              title="Toàn màn hình"
                          >
                              <Maximize className="w-5 h-5" />
                          </button>
                      </div>

                  </div>
              </div>
            </div>
          )
        ) : (
          <div className="relative w-full aspect-video bg-black rounded-2xl md:rounded-3xl border border-white/10 flex flex-col items-center justify-center text-white/50 gap-2">
              <CircleAlert className="w-10 h-10 opacity-50" />
              <p>Chưa có link phim</p>
          </div>
        )}
        {/* ======================================================= */}

        {/* CHỌN TRÌNH PHÁT (SERVER DỰ PHÒNG) */}
        {hasLinkMovie && (
          <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-sm relative z-10">
            <div className="flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-wider shrink-0">
              <Tv className="w-4 h-4 text-cyan-400" /> Chọn Trình Phát:
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setUseEmbedPlayer(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${!useEmbedPlayer ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-black/40 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'}`}
              >
                Trình phát chính (HLS - Custom UI)
              </button>
              <button
                onClick={() => setUseEmbedPlayer(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${useEmbedPlayer ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-black/40 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'}`}
              >
                Trình phát dự phòng (Iframe)
              </button>
            </div>
          </div>
        )}

        {/* THÔNG TIN CƠ BẢN VÀ NÚT YÊU THÍCH */}
        <div className="flex flex-col gap-2 mt-2">
            
            <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white drop-shadow-md leading-tight">
                    {movie.name}
                </h1>

                {/* ====== NÚT YÊU THÍCH ====== */}
                <button
                  onClick={handleToggleFavorite}
                  className="shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:scale-110 transition-all group/fav shadow-lg"
                  title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                >
                  <Heart 
                    className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${
                      isFavorited 
                      ? 'text-red-500 fill-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] scale-110' 
                      : 'text-white/70 group-hover/fav:text-white'
                    }`} 
                  />
                </button>
                {/* ==================================================== */}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/60 uppercase tracking-wider mt-1">
                <span className="text-cyan-400">{movie.year}</span>
                <span>•</span>
                <span className="text-yellow-400">{movie.time}</span>
                 <span>•</span>
                <span className="border border-white/20 px-1 rounded">{movie.quality}</span>
                 {movie.category?.slice(0, 3).map((cat: { id: string, name: string }) => (
                    <span key={cat.id} className="hidden md:inline-block before:content-['•'] before:mr-2 before:opacity-50">
                        {cat.name}
                    </span>
                 ))}
            </div>
        </div>

        {/* ĐÃ ẨN HOÀN TOÀN KHUNG TẬP PHIM NẾU LÀ PHIM LẺ / KHÔNG CÓ SERVER */}
        {(servers.length > 1 || episodesList.length > 1) && (
            <div className="bg-white/5 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl backdrop-blur-sm flex flex-col gap-6">
                {servers.length > 1 && (
                    <div className="flex flex-col gap-3 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-2 text-white/90 font-bold text-sm uppercase tracking-wider">
                            <Mic2 className="w-5 h-5 text-yellow-400" /> Chọn Âm thanh / Phụ đề
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {servers.map((server: { server_name: string }, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => { setActiveServerIndex(idx); setCurrentEpisodeIndex(0); setActiveGroupIndex(0); setIsExpanded(false); }}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${activeServerIndex === idx ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-black/40 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {server.server_name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {episodesList.length > 1 && (
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2 text-white/90 font-bold text-sm uppercase tracking-wider shrink-0">
                                <ListVideo className="w-5 h-5 text-cyan-400" /> Chọn tập phim
                            </div>
                            {episodeGroups.length > 1 && (
                                <div className="relative w-full md:max-w-[75%] lg:max-w-[80%] group/tabs">
                                    {/* Nút cuộn trái */}
                                    <button
                                        type="button"
                                        onClick={() => scrollTabs('left')}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-[#141414]/90 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all opacity-0 group-hover/tabs:opacity-100 hidden md:flex"
                                    ><ChevronLeft className="w-4 h-4 text-white" /></button>

                                    {/* Container cuộn ngang */}
                                    <div
                                        ref={tabContainerRef}
                                        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-0 md:px-8"
                                    >
                                        {episodeGroups.map((group, idx) => {
                                            const firstEp = group[0]?.name?.replace(/Tập\s*/i, '').trim();
                                            const lastEp = group[group.length - 1]?.name?.replace(/Tập\s*/i, '').trim();
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setActiveGroupIndex(idx); setIsExpanded(false); }}
                                                    className={`shrink-0 px-4 py-2 text-sm font-bold rounded-lg transition-all border whitespace-nowrap cursor-pointer ${
                                                        activeGroupIndex === idx
                                                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                                                            : 'bg-black/40 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'
                                                    }`}
                                                >Tập {firstEp} - {lastEp}</button>
                                            );
                                        })}
                                    </div>

                                    {/* Nút cuộn phải */}
                                    <button
                                        type="button"
                                        onClick={() => scrollTabs('right')}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-[#141414]/90 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all opacity-0 group-hover/tabs:opacity-100 hidden md:flex"
                                    ><ChevronRight className="w-4 h-4 text-white" /></button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {visibleEpisodes.map((ep: { slug: string, name: string }, localIndex: number) => {
                                const globalIndex = activeGroupIndex * EPISODES_PER_GROUP + localIndex;
                                const isPlaying = currentEpisodeIndex === globalIndex;
                                return (
                                    <button key={ep.slug} onClick={() => { setCurrentEpisodeIndex(globalIndex); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-[calc(25%-6px)] sm:w-[calc(20%-8px)] md:w-[calc(10%-11px)] py-3 rounded-xl text-xs font-bold transition-all border active-scale ${isPlaying ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105 z-10' : 'bg-[#1a1a1c] text-white/70 border-white/5 hover:bg-white/20 hover:text-white hover:border-white/20'}`}>{ep.name.replace('Tập ', '')}</button>
                                );
                            })}
                            {hasMoreInGroup && !isExpanded && (
                                <button onClick={() => setIsExpanded(true)} className="w-[calc(25%-6px)] sm:w-[calc(20%-8px)] md:w-[calc(10%-11px)] py-3 rounded-xl text-xs font-bold transition-all border bg-white/5 text-white/70 border-white/10 hover:bg-white hover:text-black flex items-center justify-center active-scale"><MoreHorizontal className="w-5 h-5" /></button>
                            )}
                        </div>
                        {hasMoreInGroup && isExpanded && (
                            <div className="mt-4 flex justify-center">
                                <button onClick={() => setIsExpanded(false)} className="flex items-center gap-1 text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors py-2 px-4 rounded-full hover:bg-white/10 active-scale"><ChevronUp className="w-4 h-4" /> Thu gọn</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

         <div className="text-white/80 text-sm leading-relaxed p-4 md:p-6 rounded-2xl bg-[#141414] border border-white/5 shadow-inner" dangerouslySetInnerHTML={{ __html: movie.content }} />

        {/* ẨN LINE NẾU KHÔNG CÓ CAST & CREW */}
        {validCast.length > 0 && (
            <div className="pt-4 border-t border-white/10">
                <h3 className="text-xs font-bold mb-4 uppercase tracking-wider text-white/70 px-4 md:px-0">Cast &amp; Crew</h3>
                <div className="flex flex-nowrap md:flex-wrap gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    {validCast.map((name, idx) => (
                        <CastCard
                            key={idx}
                            name={name}
                            role={movie.director?.includes(name) ? 'Đạo diễn' : 'Diễn viên'}
                            colorIndex={idx}
                            photoUrl={actorPhotoMap.get(name.toLowerCase())}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* PHIM LIÊN QUAN */}
        {relatedMovies.length > 0 && (
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 mb-5 px-4 md:px-0">
              <Film className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">Phim Liên Quan</h3>
            </div>
            <div className="flex flex-nowrap md:grid md:grid-cols-6 gap-3 md:gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {relatedMovies.map((movie) => (
                <div
                  key={movie.slug}
                  onClick={() => router.push(`/phim/${movie.slug}`)}
                  className="group flex flex-col cursor-pointer w-[110px] md:w-auto shrink-0 md:shrink-1 active-scale"
                >
                  <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-2 border border-white/5 bg-white/5">
                    <Image
                      src={movie.imageSrc}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 33vw, 17vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors line-clamp-2 leading-snug">{movie.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}