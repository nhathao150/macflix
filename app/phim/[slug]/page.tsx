'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { getMovieDetails, getMoviesByGenre, searchMoviesPaginated } from '@/lib/api';
import Hls from 'hls.js';
import { ListVideo, CircleAlert, MoreHorizontal, ChevronUp, Mic2, ChevronLeft, ChevronRight, Heart, Play, Pause, Maximize, Minimize, Settings, Subtitles, Volume2, VolumeX, RotateCcw, RotateCw, Film, Tv } from 'lucide-react'; 
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
  const [hasAutoFullscreen, setHasAutoFullscreen] = useState(false);
  
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [activeSubIndex, setActiveSubIndex] = useState(-1);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  // === TOUCH GESTURES & SEEK ===
  const lastTapRef = useRef<number>(0);
  const lastTouchTimeRef = useRef<number>(0);
  const [seekFeedback, setSeekFeedback] = useState<'forward' | 'backward' | null>(null);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // === STATE CHO ZOOM ASPECT RATIO (FIT / COVER) ===
  const [videoFitMode, setVideoFitMode] = useState<'contain' | 'cover'>('contain');
  const [zoomToast, setZoomToast] = useState<string | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const isPinchingRef = useRef<boolean>(false);

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

  // TỰ ĐỘNG BẬT FULLSCREEN KHI VIDEO PHÁT SẴN SÀNG & FOCUS VÀO NÚT TRONG FULLSCREEN
  const triggerAutoFullscreen = () => {
    if (!hasAutoFullscreen && playerContainerRef.current) {
      setHasAutoFullscreen(true);
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().then(() => {
          setTimeout(() => {
            const playBtn = playerContainerRef.current?.querySelector('[data-center-play]') as HTMLElement;
            playBtn?.focus();
          }, 100);
        }).catch(() => {});
      }
    }
  };

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

  // 6. CHUYỂN NHÓM TẬP TỰ ĐỘNG KHI CHUYỂN TẬP
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

  // Reset trình phát về chế độ chính khi chuyển tập phim hoặc server
  useEffect(() => {
    if (currentEpisode && !currentEpisode.link_m3u8 && currentEpisode.link_embed) {
      setUseEmbedPlayer(true);
    } else {
      setUseEmbedPlayer(false);
    }
  }, [currentEpisodeIndex, activeServerIndex, currentEpisode]);

  // FETCH PHIM LIÊN QUAN
  useEffect(() => {
    if (!movieDetails?.movie) return;

    const fetchSmartRelated = async () => {
      const movieName = movieDetails.movie.name || '';
      const originName = movieDetails.movie.origin_name || '';

      const stripSeriesNumber = (name: string) =>
        name
          .replace(/\s*:.*$/, '')
          .replace(/\s*([-–]?\s*(phần|season|part|movie|film|tập|ep|episode|mùa)\s*\d+)$/gi, '')
          .replace(/\s+\d+$/, '')
          .trim();

      const seriesKeywordEn = stripSeriesNumber(originName);
      const seriesKeywordVi = stripSeriesNumber(movieName);
      const TOTAL_SLOTS = 12;

      let seriesMovies: Movie[] = [];
      try {
        const searches = await Promise.allSettled([
          seriesKeywordEn.length >= 2
            ? searchMoviesPaginated(seriesKeywordEn, 1, 20)
            : Promise.resolve({ items: [] }),
          seriesKeywordVi.length >= 2 && seriesKeywordVi.toLowerCase() !== seriesKeywordEn.toLowerCase()
            ? searchMoviesPaginated(seriesKeywordVi, 1, 20)
            : Promise.resolve({ items: [] }),
        ]);

        const seen = new Set<string>([slug]);
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
          } catch {}
        }
      }

      setRelatedMovies(combined.slice(0, TOTAL_SLOTS));
    };

    fetchSmartRelated();
  }, [movieDetails, slug]);

  // 7. VIDEO PLAYER CHỐNG LAG, TỰ ĐỘNG CHẠY VÀ BẮT PHỤ ĐỀ
  useEffect(() => {
    if (useEmbedPlayer || !hasLinkMovie || !currentEpisode?.link_m3u8 || !videoRef.current) return;
    
    let videoSrc = currentEpisode.link_m3u8;
    if (videoSrc && videoSrc.startsWith('http://')) {
      videoSrc = videoSrc.replace('http://', 'https://');
    }
    
    const video = videoRef.current;
    let fallbackTimeout: NodeJS.Timeout;

    const handleNativeError = (e: Event) => {
      console.log("Native HLS error, fallback to embed player...", e);
      setUseEmbedPlayer(true);
    };
    
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    
    if ((isSafari || isIOS) && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.load();
      video.addEventListener('error', handleNativeError);
      
      fallbackTimeout = setTimeout(() => {
        setUseEmbedPlayer(true);
      }, 7000);

      const handleLoadedMetadata = () => {
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        video.play().then(() => triggerAutoFullscreen()).catch((e) => console.log("Autoplay blocked by Safari:", e));
        
        const tracks = [];
        for (let i = 0; i < video.textTracks.length; i++) {
          if (video.textTracks[i].kind === 'subtitles' || video.textTracks[i].kind === 'captions') {
            tracks.push(video.textTracks[i]);
          }
        }
        setSubtitleTracks(tracks);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1, 
        capLevelToPlayerSize: true, 
        maxBufferLength: 15,
        maxMaxBufferLength: 30,
        maxBufferSize: 15 * 1000 * 1000,
        abrEwmaDefaultEstimate: 500000, 
      });
      hlsRef.current = hls; 
      
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (hls.subtitleTracks && hls.subtitleTracks.length > 0) {
           setSubtitleTracks(hls.subtitleTracks);
        }
        video.play().then(() => triggerAutoFullscreen()).catch(() => {}); 
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setUseEmbedPlayer(true);
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.load();
      video.addEventListener('error', handleNativeError);
      
      fallbackTimeout = setTimeout(() => {
        setUseEmbedPlayer(true);
      }, 7000);

      const handleLoadedMetadata = () => {
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        video.play().then(() => triggerAutoFullscreen()).catch(() => {}); 
        const tracks = [];
        for (let i = 0; i < video.textTracks.length; i++) {
          if (video.textTracks[i].kind === 'subtitles' || video.textTracks[i].kind === 'captions') {
            tracks.push(video.textTracks[i]);
          }
        }
        setSubtitleTracks(tracks);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    }

    return () => { 
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hasLinkMovie, currentEpisode, useEmbedPlayer]);

  // PLAYER HANDLERS
  const handleMouseMove = () => {
    if (Date.now() - lastTouchTimeRef.current < 1500) return;

    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (!isSpeedMenuOpen && !isSubMenuOpen && isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setIsControlsVisible(false);
        }, 4000);
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
    if (!isFullscreen) {
      toggleFullScreen();
      return;
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      toggleFullScreen();
      lastTapRef.current = 0;
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }

      if (!isControlsVisible) {
        setIsControlsVisible(true);
        controlsTimeoutRef.current = setTimeout(() => setIsControlsVisible(false), 4000);
      } else {
        setIsControlsVisible(false);
      }
      lastTapRef.current = now;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    lastTouchTimeRef.current = Date.now();
    if (e.touches.length === 2) {
      isPinchingRef.current = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPinchingRef.current && e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const diff = currentDistance - initialPinchDistanceRef.current;
      
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          changeFitMode('cover');
        } else {
          changeFitMode('contain');
        }
        initialPinchDistanceRef.current = currentDistance;
      }
    }
  };

  const handleTouchEnd = () => {
    isPinchingRef.current = false;
    initialPinchDistanceRef.current = null;
  };

  const changeFitMode = (mode: 'contain' | 'cover') => {
    if (videoFitMode === mode) return;
    setVideoFitMode(mode);
    setZoomToast(mode === 'cover' ? 'Tràn màn hình (Zoom to Fill)' : 'Vừa màn hình (Vừa tỷ lệ gốc)');
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleTimeUpdate = () => setCurrentTime(videoRef.current?.currentTime || 0);
  const handleLoadedMetadata = () => {
    setDuration(videoRef.current?.duration || 0);
    triggerAutoFullscreen();
  };

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
          playerContainerRef.current.requestFullscreen()
            .then(() => {
              if (screen.orientation && (screen.orientation as any).lock) {
                (screen.orientation as any).lock('landscape').catch(() => {});
              }
              setTimeout(() => {
                const playBtn = playerContainerRef.current?.querySelector('[data-center-play]') as HTMLElement;
                playBtn?.focus();
              }, 100);
            })
            .catch(err => console.error(err));
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
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (isFs && playerContainerRef.current) {
        setTimeout(() => {
          const targetFocusable = (playerContainerRef.current?.querySelector('[data-center-play]') || playerContainerRef.current?.querySelector('button')) as HTMLElement;
          targetFocusable?.focus();
        }, 150);
      }
      if (!isFs && screen.orientation && screen.orientation.unlock) {
        try {
          screen.orientation.unlock();
        } catch (e) {}
      }
    };
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

  useEffect(() => {
    if (zoomToast) {
      const timeout = setTimeout(() => setZoomToast(null), 1500);
      return () => clearTimeout(timeout);
    }
  }, [zoomToast]);

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

  // HELPER FOCUS CHỐNG NHẢY ĐÚP SỰ KIỆN PHÍM
  const safeFocus = (selector: string) => {
    const el = playerContainerRef.current?.querySelector(selector) as HTMLElement;
    if (el) {
      el.focus();
    }
  };

  // KEYBOARD / REMOTE SHORTCUTS HANDLER METICULOUS D-PAD ROUTING
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const tag = activeEl?.tagName?.toLowerCase();
      const inputType = (activeEl as HTMLInputElement)?.type;
      
      // Chỉ bỏ qua các ô nhập văn bản (search, text input), KHÔNG bỏ qua thanh Timeline (range)
      if ((tag === 'input' && inputType === 'text') || tag === 'textarea' || tag === 'select') return;

      const isInsidePlayer = playerContainerRef.current && playerContainerRef.current.contains(activeEl);
      const isPlayerContainerFocused = activeEl === playerContainerRef.current || (activeEl?.getAttribute('data-player-container') === 'true');

      // NẾU ĐANG Ở MÀN HÌNH THU NHỎ (!isFullscreen):
      // Trong khung video KHÔNG tương tác nút con. Bấm OK / Enter / Space -> Phóng to Fullscreen!
      if (!isFullscreen && (isInsidePlayer || isPlayerContainerFocused)) {
        if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
          e.preventDefault();
          e.stopPropagation();
          toggleFullScreen();
          return;
        }
      }

      // 1. PHÍM BACK / ESCAPE TRÊN REMOTE -> ẨN NHANH TRÌNH QUẢN LÝ VIDEO
      if (
        e.key === 'Escape' || 
        e.key === 'Back' || 
        e.key === 'GoBack' || 
        e.key === 'BrowserBack' || 
        e.keyCode === 27 || 
        e.keyCode === 8 || 
        e.keyCode === 10009 || 
        e.keyCode === 461
      ) {
        if (isControlsVisible) {
          e.preventDefault();
          setIsControlsVisible(false);
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
          return;
        }
      }

      // 2. HIỂN THỊ TRÌNH QUẢN LÝ VIDEO KHI CÓ BẤT KỲ TƯƠNG TÁC PHÍM NÀO
      setIsControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 4000);

      // 3. ĐIỀU HƯỚNG D-PAD 3 TẦNG BÊN TRONG VIDEO:
      // TẦNG 1 (TOP BAR): Các Nút Chức Năng (sub-btn ⟷ speed-btn ⟷ fit-btn ⟷ fullscreen-btn ⟷ volume-btn)
      // TẦNG 2 (TRUNG TÂM): Cụm Nút Tạm Dừng / Phát (rewind ⟷ play ⟷ forward)
      // TẦNG 3 (DƯỚI ĐÁY): Thanh Timeline (timeline)
      if (isInsidePlayer) {
        const activeControl = activeEl?.getAttribute('data-player-control');

        if (e.key === 'ArrowDown') {
          if (
            activeControl === 'sub-btn' || 
            activeControl === 'speed-btn' || 
            activeControl === 'fit-btn' || 
            activeControl === 'fullscreen-btn' ||
            activeControl === 'volume-btn'
          ) {
            // TẦNG 1 -> TẦNG 2 (Nút Play Trung Tâm)
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-center-play]');
            return;
          } else if (activeControl === 'play' || activeControl === 'rewind' || activeControl === 'forward') {
            // TẦNG 2 -> TẦNG 3 (Thanh Timeline)
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="timeline"]');
            return;
          } else if (activeControl === 'timeline') {
            // TẦNG 3 KHÔNG TUA VIDEO KHI BẤM PHÍM XUỐNG
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        } else if (e.key === 'ArrowUp') {
          if (activeControl === 'timeline') {
            // TẦNG 3 -> TẦNG 2 (Nút Play Trung Tâm)
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-center-play]');
            return;
          } else if (activeControl === 'play' || activeControl === 'rewind' || activeControl === 'forward') {
            // TẦNG 2 -> TẦNG 1 (Nút Phụ Đề Hoặc Âm Lượng)
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="sub-btn"]');
            return;
          }
        } else if (e.key === 'ArrowRight') {
          if (activeControl === 'sub-btn') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="speed-btn"]');
            return;
          } else if (activeControl === 'speed-btn') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="fit-btn"]');
            return;
          } else if (activeControl === 'fit-btn') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="fullscreen-btn"]');
            return;
          } else if (activeControl === 'fullscreen-btn') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="volume-btn"]');
            return;
          } else if (activeControl === 'rewind') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="play"]');
            return;
          } else if (activeControl === 'play') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="forward"]');
            return;
          }
        } else if (e.key === 'ArrowLeft') {
          if (activeControl === 'volume-btn') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="fullscreen-btn"]');
            return;
          } else if (activeControl === 'fullscreen-btn') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="fit-btn"]');
            return;
          } else if (activeControl === 'fit-btn') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="speed-btn"]');
            return;
          } else if (activeControl === 'speed-btn') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="sub-btn"]');
            return;
          } else if (activeControl === 'forward') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="play"]');
            return;
          } else if (activeControl === 'play') {
            e.preventDefault();
            e.stopPropagation();
            safeFocus('[data-player-control="rewind"]');
            return;
          }
        }
      }

      // Nếu chưa tự động Fullscreen, kích hoạt Fullscreen ở phím tương tác đầu tiên
      if (!hasAutoFullscreen && playerContainerRef.current && !document.fullscreenElement) {
        setHasAutoFullscreen(true);
        playerContainerRef.current.requestFullscreen().catch(() => {});
      }

      switch (e.key) {
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullScreen();
          break;

        case ' ':
        case 'Enter':
          if (tag === 'button' || tag === 'a' || inputType === 'range') return;
          if (isInsidePlayer || isPlayerContainerFocused) {
            e.preventDefault();
            togglePlay();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasAutoFullscreen, isControlsVisible, isFullscreen]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      tabContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white pt-6 md:pt-[100px] px-4 md:px-12 pb-20">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
          <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-3xl animate-skeleton" />
          <div className="flex flex-col gap-4 mt-4">
            <div className="h-10 w-1/2 bg-white/10 rounded-xl animate-skeleton" />
            <div className="flex gap-4">
              <div className="h-6 w-16 bg-white/5 rounded animate-skeleton" />
              <div className="h-6 w-20 bg-white/5 rounded animate-skeleton" />
              <div className="h-6 w-14 bg-white/5 rounded animate-skeleton" />
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col gap-4 mt-2">
            <div className="h-6 w-44 bg-white/10 rounded animate-skeleton" />
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-12 w-20 bg-white/5 rounded-2xl animate-skeleton" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movieDetails?.movie) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-3xl font-black mb-6">Không tìm thấy thông tin phim!</h1>
        <Link href="/" className="px-8 py-3.5 bg-[#7226FF] hover:bg-[#853aff] text-white font-black text-lg rounded-2xl transition-all shadow-xl">
          Về trang chủ
        </Link>
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
  
  const validCast = [...(movie.director || []), ...(movie.actor || [])].filter(name => name && name !== 'Đang cập nhật');

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-[#F042FF]/30 pb-24 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        *:fullscreen,
        *:-webkit-full-screen,
        *:fullscreen:focus,
        *:-webkit-full-screen:focus,
        video:-webkit-full-screen,
        iframe:-webkit-full-screen,
        div:-webkit-full-screen,
        video, iframe, video:focus, iframe:focus {
          outline: none !important;
          outline-width: 0 !important;
          border: none !important;
          border-width: 0 !important;
          box-shadow: none !important;
        }
      `}} />
      
      <Navbar />

      <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-[#7226FF]/20 blur-[140px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-[#F042FF]/15 blur-[140px] rounded-full mix-blend-screen" />
      </div>

      <div className="w-full px-6 md:px-16 lg:px-24 relative z-10 flex flex-col gap-8 md:gap-10 pt-4 md:pt-[100px]">
        
        {/* ======================================================= */}
        {/* TẦNG 1: KHUNG VIDEO PLAYER CHUẨN 4K                      */}
        {/* ======================================================= */}
        {hasLinkMovie ? (
          useEmbedPlayer ? (
            <div 
              ref={playerContainerRef} 
              tabIndex={0}
              data-player-container="true"
              onClick={() => toggleFullScreen()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                  e.preventDefault();
                  toggleFullScreen();
                }
              }}
              className={`relative w-full aspect-video bg-black overflow-hidden outline-none cursor-pointer focus:outline-none transition-all duration-300 ${isFullscreen ? 'rounded-none border-none shadow-none' : 'rounded-3xl border-2 border-white/15 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/60 focus:shadow-[0_0_50px_rgba(240,66,255,0.5)] shadow-[0_20px_60px_rgba(0,0,0,0.9)]'}`}
            >
              <iframe
                src={currentEpisode?.link_embed?.startsWith('http://') ? currentEpisode.link_embed.replace('http://', 'https://') : currentEpisode?.link_embed}
                className="w-full h-full border-none pointer-events-none"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            </div>
          ) : (
            <div 
              ref={playerContainerRef} 
              tabIndex={0}
              data-player-container="true"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onFocus={() => {
                safeFocus('[data-center-play]');
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsControlsVisible((prev) => !prev);
              }}
              className={`relative w-full aspect-video bg-black overflow-hidden group select-none flex flex-col justify-center touch-manipulation cursor-pointer outline-none focus:outline-none transition-all duration-300 ${!isPlaying || isControlsVisible ? 'cursor-auto' : 'cursor-none'} ${isFullscreen ? 'rounded-none border-none shadow-none' : 'rounded-3xl border-2 border-white/15 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/60 focus:shadow-[0_0_50px_rgba(240,66,255,0.5)] shadow-[0_20px_60px_rgba(0,0,0,0.9)]'}`}
            >
              <video 
                ref={videoRef} 
                preload="metadata"
                playsInline
                className={`w-full h-full object-${videoFitMode} bg-black outline-none pointer-events-none transition-all duration-300`}
                poster={bannerUrl} 
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => {
                  setIsPlaying(true);
                  triggerAutoFullscreen();
                }}
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
              />

              {/* OVERLAY TƯƠNG TÁC */}
              <div 
                className="absolute inset-0 z-0 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleVideoInteraction(e); }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />

              {/* TOAST THÔNG BÁO THU PHÓNG */}
              {zoomToast && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 z-50 text-white font-black text-base pointer-events-none animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
                    {zoomToast}
                </div>
              )}

              {/* HIỆU ỨNG TUA NHANH 10S */}
              <div className={`absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-[#7226FF]/30 to-transparent flex items-center justify-center transition-opacity duration-300 pointer-events-none rounded-l-3xl ${seekFeedback === 'backward' ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="flex flex-col items-center gap-2 animate-bounce">
                      <RotateCcw className="w-10 h-10 md:w-16 md:h-16 text-white" />
                      <span className="text-white font-black text-lg md:text-2xl">-10s</span>
                  </div>
              </div>
              <div className={`absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-[#7226FF]/30 to-transparent flex items-center justify-center transition-opacity duration-300 pointer-events-none rounded-r-3xl ${seekFeedback === 'forward' ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="flex flex-col items-center gap-2 animate-bounce">
                      <RotateCw className="w-10 h-10 md:w-16 md:h-16 text-white" />
                      <span className="text-white font-black text-lg md:text-2xl">+10s</span>
                  </div>
              </div>

              {/* TẦNG 1 INTERFACE FULLSCREEN: THANH TOP BAR (GỒM PHỤ ĐỀ, TỐC ĐỘ, TỶ LỆ, FULLSCREEN VÀ ÂM LƯỢNG) */}
              <div className={`absolute top-6 left-6 right-6 flex justify-end items-center gap-3 md:gap-4 z-30 transition-all duration-300 ${!isPlaying || isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`} onClick={(e) => e.stopPropagation()}>
                  
                  {/* CỤM NÚT CHỨC NĂNG GỘP VÀO TẦNG 1 GÓC TRÊN */}
                  <div className="pointer-events-auto flex items-center gap-2 md:gap-4 bg-black/60 backdrop-blur-xl px-4 md:px-5 py-2 md:py-2.5 rounded-2xl border border-white/20 shadow-2xl shrink-0">
                      
                      {/* 1. Nút Phụ Đề */}
                      <div className="relative">
                          {isSubMenuOpen && (
                              <>
                                  <div className="fixed inset-0 z-40" onClick={() => setIsSubMenuOpen(false)} />
                                  <div className="absolute top-full right-0 mt-3 w-max min-w-[200px] z-50">
                                    <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col py-3">
                                        <div className="px-5 py-2 text-xs font-black text-[#F042FF] border-b border-white/10 uppercase mb-1">Ngôn ngữ hỗ trợ</div>
                                        <button onClick={() => changeSubtitle(-1)} className={`px-5 py-3 text-base text-left hover:bg-white/20 transition-colors flex items-center gap-2 ${activeSubIndex === -1 ? 'text-[#F042FF]' : 'text-white/80'}`}>Tắt phụ đề</button>
                                        {subtitleTracks.length > 0 ? (
                                            subtitleTracks.map((track, idx) => (
                                                <button key={idx} onClick={() => changeSubtitle(idx)} className={`px-5 py-3 text-base text-left hover:bg-white/20 transition-colors flex items-center gap-2 ${activeSubIndex === idx ? 'text-[#F042FF] font-black' : 'text-white/80 font-bold'}`}>{track.name || track.label || track.language || `Ngôn ngữ ${idx + 1}`}</button>
                                            ))
                                        ) : (
                                            <div className="px-5 py-3 text-sm text-white/50 italic">Bản mặc định (Vietsub)</div>
                                        )}
                                    </div>
                                  </div>
                              </>
                          )}
                          <button tabIndex={0} data-player-control="sub-btn" onClick={() => { setIsSubMenuOpen(!isSubMenuOpen); setIsSpeedMenuOpen(false); }} className={`hover:scale-110 transition flex items-center justify-center cursor-pointer focus:outline-none focus:text-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/60 rounded-xl p-1.5 ${isSubMenuOpen || activeSubIndex !== -1 ? 'text-[#F042FF]' : 'text-white/80'}`} title="Phụ đề"><Subtitles className="w-6 h-6" /></button>
                      </div>

                      {/* 2. Nút Tốc Độ */}
                      <div className="relative">
                          {isSpeedMenuOpen && (
                              <>
                                  <div className="fixed inset-0 z-40" onClick={() => setIsSpeedMenuOpen(false)} />
                                  <div className="absolute top-full right-0 mt-3 w-44 z-50">
                                    <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col py-3">
                                        <div className="px-5 py-2 text-xs font-black text-[#F042FF] border-b border-white/10 uppercase mb-1">Tốc độ phát</div>
                                        {speedOptions.map(rate => (
                                            <button key={rate} onClick={() => changePlaybackRate(rate)} className={`px-5 py-2.5 text-base text-left hover:bg-white/20 transition-colors ${playbackRate === rate ? 'text-[#F042FF] font-black' : 'text-white/80 font-bold'}`}>{rate === 1 ? 'Chuẩn (1x)' : `${rate}x`}</button>
                                        ))}
                                    </div>
                                  </div>
                              </>
                          )}
                          <button tabIndex={0} data-player-control="speed-btn" onClick={() => { setIsSpeedMenuOpen(!isSpeedMenuOpen); setIsSubMenuOpen(false); }} className={`hover:scale-110 transition flex items-center justify-center cursor-pointer focus:outline-none focus:text-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/60 rounded-xl p-1.5 ${isSpeedMenuOpen || playbackRate !== 1 ? 'text-[#F042FF]' : 'text-white/80'}`} title="Cài đặt tốc độ"><Settings className="w-6 h-6" /></button>
                      </div>

                      {/* 3. Nút Tỷ Lệ Màn Hình */}
                      <button 
                          tabIndex={0}
                          data-player-control="fit-btn"
                          onClick={(e) => { e.stopPropagation(); changeFitMode(videoFitMode === 'contain' ? 'cover' : 'contain'); }} 
                          className={`hover:scale-110 transition flex items-center justify-center cursor-pointer focus:outline-none focus:text-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/60 rounded-xl p-1.5 ${videoFitMode === 'cover' ? 'text-[#F042FF]' : 'text-white/80'}`} 
                          title={videoFitMode === 'cover' ? "Tỷ lệ gốc (Vừa màn hình)" : "Phóng to (Tràn màn hình)"}
                      >
                          {videoFitMode === 'cover' ? <Minimize className="w-6 h-6 rotate-45" /> : <Maximize className="w-6 h-6 rotate-45" />}
                      </button>

                      {/* 4. Nút Toàn Màn Hình */}
                      <button tabIndex={0} data-player-control="fullscreen-btn" onClick={toggleFullScreen} className="text-white/80 hover:text-white hover:scale-110 transition flex items-center justify-center cursor-pointer focus:outline-none focus:text-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/60 rounded-xl p-1.5" title="Toàn màn hình">
                          {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                      </button>
                  </div>

                  {/* 5. Nút Âm Lượng (Góc Trên Bên Phải) */}
                  <div className="pointer-events-auto flex items-center group/vol bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/20 shadow-2xl">
                      <button 
                          tabIndex={0}
                          data-player-control="volume-btn"
                          onClick={toggleMute} 
                          className="text-white/80 hover:text-white focus:text-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/60 rounded-xl p-1 transition flex items-center justify-center shrink-0 cursor-pointer focus:outline-none" 
                          title="Âm lượng"
                      >
                          {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                      </button>
                      
                      <div className="w-0 overflow-hidden group-hover/vol:w-32 transition-all duration-300 ease-out flex items-center ml-0 group-hover/vol:ml-4">
                          <input
                              tabIndex={0}
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={isMuted ? 0 : volume}
                              onChange={(e) => { e.stopPropagation(); handleVolumeChange(e); }}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#F042FF] custom-slider"
                              style={{ background: `linear-gradient(to right, #F042FF ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) ${(isMuted ? 0 : volume) * 100}%)` }}
                          />
                      </div>
                  </div>
              </div>

              {/* LỚP PHỦ TỐI NỀN VIDEO */}
              <div className={`absolute inset-0 transition-all duration-300 pointer-events-none z-10 ${!isPlaying ? 'opacity-100 bg-black/50' : (isControlsVisible ? 'opacity-100 bg-black/20' : 'opacity-0')}`} />

              {/* TẦNG 2 INTERFACE FULLSCREEN: CỤM NÚT TRUNG TÂM (Play/Pause, Tua 10s) */}
              <div 
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-8 md:gap-14 transition-all duration-300 z-30 ${!isPlaying || isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()}
              >
                  <button 
                    tabIndex={0}
                    data-player-control="rewind"
                    onClick={(e) => { e.stopPropagation(); skipTime(-10); }} 
                    className="pointer-events-auto w-14 h-14 md:w-20 md:h-20 rounded-full bg-black/60 hover:bg-[#7226FF] focus:bg-[#7226FF] backdrop-blur-xl flex items-center justify-center border-2 border-white/20 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/70 text-white hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer shadow-2xl outline-none"
                  >
                      <RotateCcw className="w-6 h-6 md:w-9 md:h-9" />
                  </button>

                  <button 
                    tabIndex={0}
                    data-player-control="play"
                    data-center-play="true"
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                    className="pointer-events-auto w-22 h-22 md:w-28 md:h-28 bg-[#7226FF] hover:bg-[#853aff] focus:bg-[#853aff] backdrop-blur-xl rounded-full flex items-center justify-center border-4 border-transparent focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/70 text-white shadow-[0_0_50px_rgba(114,38,255,0.7)] hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer outline-none"
                  >
                      {isPlaying ? <Pause className="w-10 h-10 md:w-14 md:h-14 fill-white" /> : <Play className="w-10 h-10 md:w-14 md:h-14 fill-white ml-2" />}
                  </button>

                  <button 
                    tabIndex={0}
                    data-player-control="forward"
                    onClick={(e) => { e.stopPropagation(); skipTime(10); }} 
                    className="pointer-events-auto w-14 h-14 md:w-20 md:h-20 rounded-full bg-black/60 hover:bg-[#7226FF] focus:bg-[#7226FF] backdrop-blur-xl flex items-center justify-center border-2 border-white/20 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/70 text-white hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer shadow-2xl outline-none"
                  >
                      <RotateCw className="w-6 h-6 md:w-9 md:h-9" />
                  </button>
              </div>

              {/* TẦNG 3 INTERFACE FULLSCREEN: THANH ĐIỀU KHIỂN DƯỚI ĐÁY (TÊN PHIM & THANH TIMELINE) */}
              <div 
                className={`absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-6 pt-28 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end z-20 transition-all duration-300 ${!isPlaying || isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="pointer-events-auto flex flex-col w-full gap-3 md:gap-5">
                      
                      <div className="flex flex-col drop-shadow-lg pr-4 cursor-default">
                          <p className="text-xs md:text-base font-black text-[#F042FF] tracking-widest mb-0.5 uppercase">
                              {currentEpisode?.name || 'Đang tải tập...'}
                          </p>
                          <h2 className="text-xl md:text-3xl font-black text-white tracking-tight line-clamp-1">
                              {movie.name}
                          </h2>
                      </div>

                      <div className="flex items-center gap-6 md:gap-8 w-full cursor-default px-2">
                          <span className="text-sm md:text-lg font-mono font-black text-white shrink-0 min-w-[70px] md:min-w-[90px] text-left drop-shadow-lg z-20">
                              {formatTime(currentTime)}
                          </span>

                          <div className="flex-1 relative flex items-center">
                              <input
                                  tabIndex={0}
                                  data-player-control="timeline"
                                  type="range"
                                  min={0}
                                  max={duration || 100}
                                  value={currentTime}
                                  onChange={handleSeek}
                                  onKeyDown={(e) => {
                                    if (e.key === 'ArrowUp') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      safeFocus('[data-center-play]');
                                    } else if (e.key === 'ArrowDown') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    } else if (e.key === 'ArrowLeft') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      skipTime(-10);
                                      setSeekFeedback('backward');
                                      setTimeout(() => setSeekFeedback(null), 500);
                                    } else if (e.key === 'ArrowRight') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      skipTime(10);
                                      setSeekFeedback('forward');
                                      setTimeout(() => setSeekFeedback(null), 500);
                                    } else if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      togglePlay();
                                    }
                                  }}
                                  className="w-full h-3 md:h-3.5 rounded-full appearance-none cursor-pointer relative z-10 accent-[#F042FF] shadow-lg custom-slider focus:outline-none focus:ring-4 focus:ring-[#F042FF] focus:ring-offset-2 focus:ring-offset-black/80"
                                  style={{ background: `linear-gradient(to right, #F042FF ${progressPercent}%, rgba(255, 255, 255, 0.25) ${progressPercent}%)` }}
                              />
                          </div>

                          <span className="text-sm md:text-lg font-mono font-black text-white shrink-0 min-w-[70px] md:min-w-[90px] text-right drop-shadow-lg z-20">
                              -{formatTime(duration - currentTime)}
                          </span>
                      </div>

                  </div>
              </div>
            </div>
          )
        ) : (
          <div className="relative w-full aspect-video bg-black rounded-3xl border border-white/10 flex flex-col items-center justify-center text-white/50 gap-3">
              <CircleAlert className="w-14 h-14 opacity-50" />
              <p className="text-xl font-bold">Chưa có link phim</p>
          </div>
        )}
        {/* ======================================================= */}

        {/* ======================================================= */}
        {/* TẦNG 2: THÔNG TIN CƠ BẢN VÀ NÚT YÊU THÍCH                */}
        {/* ======================================================= */}
        <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-6">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-md leading-tight">
                    {movie.name}
                </h1>

                {/* NÚT YÊU THÍCH HD CHO REMOTE CONTROL */}
                <button
                  tabIndex={0}
                  onClick={handleToggleFavorite}
                  className="shrink-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:scale-105 focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/60 focus:outline-none transition-all cursor-pointer shadow-xl"
                  title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                >
                  <Heart 
                    className={`w-7 h-7 md:w-8 md:h-8 transition-all duration-300 ${
                      isFavorited 
                      ? 'scale-110' 
                      : 'text-white/80'
                    }`} 
                    style={isFavorited ? { color: '#F042FF', fill: '#F042FF', filter: 'drop-shadow(0 0 14px rgba(240,66,255,0.9))' } : {}}
                  />
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-black text-white/70 uppercase tracking-wider mt-1">
                <span className="text-[#F042FF]">{movie.year}</span>
                <span>•</span>
                <span className="text-yellow-400">{movie.time}</span>
                <span>•</span>
                <span className="border border-white/20 px-3 py-1 rounded-xl text-xs md:text-sm text-white bg-[#7226FF]">{movie.quality}</span>
                 {movie.category?.slice(0, 3).map((cat: { id: string, name: string }) => (
                    <span key={cat.id} className="hidden md:inline-block before:content-['•'] before:mr-2 before:opacity-50">
                        {cat.name}
                    </span>
                 ))}
            </div>
        </div>

        {/* ======================================================= */}
        {/* TẦNG 3: KHUNG CHỌN TRÌNH PHÁT & TẬP PHIM                 */}
        {/* ======================================================= */}
        {(hasLinkMovie || servers.length > 1 || episodesList.length > 0) && (
            <div className="bg-[#1c1c1e] border-2 border-white/15 p-8 md:p-10 rounded-[36px] backdrop-blur-xl flex flex-col gap-8 shadow-2xl">
                
                {/* 1. CHỌN ÂM THANH / SERVER (NẾU CÓ NHIỀU SERVER) */}
                {servers.length > 1 && (
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/15">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 text-white font-black text-lg md:text-xl uppercase tracking-wider shrink-0">
                            <Mic2 className="w-7 h-7 text-yellow-400" /> Ngôn ngữ:
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {servers.map((server: { server_name: string }, idx: number) => (
                                <button
                                    key={idx}
                                    tabIndex={0}
                                    onClick={() => { setActiveServerIndex(idx); setCurrentEpisodeIndex(0); setActiveGroupIndex(0); setIsExpanded(false); }}
                                    className={`px-6 py-3 rounded-2xl text-base md:text-lg font-black transition-all border-2 ${activeServerIndex === idx ? 'bg-[#7226FF] text-white border-transparent shadow-[0_0_24px_rgba(114,38,255,0.8)] scale-105' : 'bg-black/50 text-white/70 border-white/15 hover:bg-white/10 hover:text-white'} focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer`}
                                >
                                    {server.server_name}
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
                )}

                {/* 2. CHỌN TẬP PHIM (DANH SÁCH KHỔ LỚN DỄ BẤM REMOTE) */}
                {episodesList.length > 0 && (
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div className="flex items-center gap-3 text-[#F042FF] font-black text-xl md:text-2xl uppercase tracking-wider shrink-0">
                                <ListVideo className="w-7 h-7 text-[#F042FF]" /> Chọn Tập Phim
                            </div>
                            {episodeGroups.length > 1 && (
                                <div className="relative w-full md:max-w-[75%] lg:max-w-[80%] group/tabs">
                                    <button
                                        type="button"
                                        onClick={() => scrollTabs('left')}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-[#141414]/90 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all opacity-0 group-hover/tabs:opacity-100 hidden md:flex"
                                    ><ChevronLeft className="w-6 h-6 text-white" /></button>

                                    <div
                                        ref={tabContainerRef}
                                        className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-0 md:px-12"
                                    >
                                        {episodeGroups.map((group, idx) => {
                                            const firstEp = group[0]?.name?.replace(/Tập\s*/i, '').trim();
                                            const lastEp = group[group.length - 1]?.name?.replace(/Tập\s*/i, '').trim();
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    tabIndex={0}
                                                    onClick={(e) => { e.stopPropagation(); setActiveGroupIndex(idx); setIsExpanded(false); }}
                                                    className={`shrink-0 px-6 py-3 text-base md:text-lg font-black rounded-2xl transition-all border-2 whitespace-nowrap cursor-pointer ${
                                                        activeGroupIndex === idx
                                                            ? 'bg-[#7226FF] text-white border-transparent shadow-[0_0_24px_rgba(114,38,255,0.8)] scale-105'
                                                            : 'bg-black/50 text-white/70 border-white/15 hover:bg-white/10 hover:text-white'
                                                    } focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40`}
                                                >Tập {firstEp} - {lastEp}</button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => scrollTabs('right')}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-[#141414]/90 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all opacity-0 group-hover/tabs:opacity-100 hidden md:flex"
                                    ><ChevronRight className="w-6 h-6 text-white" /></button>
                                </div>
                            )}
                        </div>

                        {/* LƯỚI TẬP PHIM KHỔ LỚN CỰC KỲ DỄ BẤM VỚI D-PAD REMOTE */}
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 md:gap-4">
                            {visibleEpisodes.map((ep: { slug: string, name: string }, localIndex: number) => {
                                const globalIndex = activeGroupIndex * EPISODES_PER_GROUP + localIndex;
                                const isPlaying = currentEpisodeIndex === globalIndex;
                                return (
                                    <button 
                                      key={ep.slug} 
                                      tabIndex={0}
                                      onClick={() => { setCurrentEpisodeIndex(globalIndex); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                                      className={`w-full py-4 md:py-5 rounded-2xl text-base md:text-xl font-black transition-all border-2 cursor-pointer focus:outline-none focus:scale-105 focus:bg-[#7226FF] focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 shadow-lg ${isPlaying ? 'bg-[#7226FF] text-white border-transparent shadow-[0_0_24px_rgba(114,38,255,0.8)] scale-105 z-10' : 'bg-black/50 text-[#F042FF] font-black border-white/15 hover:bg-white/20 hover:text-white'}`}
                                    >
                                      {ep.name.replace('Tập ', '')}
                                    </button>
                                );
                             })}
                            {hasMoreInGroup && !isExpanded && (
                                <button tabIndex={0} onClick={() => setIsExpanded(true)} className="w-full py-4 md:py-5 rounded-2xl text-base md:text-xl font-black transition-all border-2 bg-white/10 text-white/80 border-white/15 hover:bg-white hover:text-black flex items-center justify-center focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer"><MoreHorizontal className="w-7 h-7" /></button>
                            )}
                        </div>

                        {hasMoreInGroup && isExpanded && (
                            <div className="mt-6 flex justify-center">
                                <button tabIndex={0} onClick={() => setIsExpanded(false)} className="flex items-center gap-2 text-base font-black text-white/70 hover:text-white uppercase tracking-widest transition-colors py-3.5 px-8 rounded-full hover:bg-white/10 focus:outline-none focus:scale-105 focus:border-[#F042FF] focus:ring-4 focus:ring-[#F042FF]/40 cursor-pointer"><ChevronUp className="w-6 h-6" /> Thu gọn</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* ======================================================= */}
        {/* TẦNG 4: BÀI VIẾT NỘI DUNG PHIM                            */}
        {/* ======================================================= */}
        <div className="bg-[#1c1c1e] border-2 border-white/15 p-8 md:p-10 rounded-[36px] shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mb-4">Nội Dung Phim</h3>
          <div 
            className="text-white/90 text-lg md:text-xl leading-relaxed prose prose-invert max-w-none font-medium" 
            dangerouslySetInnerHTML={{ __html: movie.content }} 
          />
        </div>

        {/* ======================================================= */}
        {/* TẦNG 5: DIỄN VIÊN & ĐOÀN LÀM PHIM                        */}
        {/* ======================================================= */}
        {validCast.length > 0 && (
            <div className="pt-6 border-t border-white/15">
                <h3 className="text-2xl md:text-3xl font-black mb-6 uppercase tracking-wider text-white">Diễn Viên &amp; Đoàn Làm Phim</h3>
                <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-4">
                    {validCast.map((name, idx) => (
                        <CastCard
                            key={idx}
                            name={name}
                            role={movie.director?.includes(name) ? 'Đạo diễn' : 'Diễn viên'}
                            colorIndex={idx}
                            variant="circle"
                            photoUrl={actorPhotoMap.get(name.toLowerCase())}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* ======================================================= */}
        {/* TẦNG 6: PHIM LIÊN QUAN CHO REMOTE CONTROL                 */}
        {/* ======================================================= */}
        {relatedMovies.length > 0 && (
          <div className="pt-8 border-t border-white/15">
            <div className="flex items-center gap-3 mb-6">
              <Film className="w-8 h-8 text-[#F042FF]" />
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white">Phim Liên Quan</h3>
            </div>
            <div className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide pb-4">
              {relatedMovies.map((relMovie, index) => (
                <div
                  key={relMovie.slug}
                  tabIndex={0}
                  onClick={() => router.push(`/phim/${relMovie.slug}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13) {
                      e.preventDefault();
                      router.push(`/phim/${relMovie.slug}`);
                    }
                  }}
                  className="shrink-0 w-48 md:w-60 cursor-pointer group focus:outline-none transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] rounded-3xl overflow-hidden mb-3 border-2 border-white/15 group-focus:border-[#F042FF] group-focus:ring-4 group-focus:ring-[#F042FF]/40 group-focus:scale-105 transition-all duration-300 shadow-xl bg-black/40">
                    <Image
                      src={relMovie.imageSrc}
                      alt={relMovie.title}
                      fill
                      sizes="(max-width: 640px) 44vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110 group-focus:scale-110"
                      referrerPolicy="no-referrer"
                      priority={index < 4}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-14 h-14 rounded-full bg-[#7226FF] flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 group-focus:scale-100 transition-transform duration-300">
                        <Play className="w-7 h-7 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <p className="text-base md:text-lg font-black text-white/90 group-hover:text-white group-focus:text-white line-clamp-1">{relMovie.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}