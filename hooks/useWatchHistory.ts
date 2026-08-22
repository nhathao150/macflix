import { useState, useEffect, useMemo } from 'react';
import { Movie } from '@/types';
import { getMovieDetails } from '@/services/movie.service';

// Định nghĩa kiểu dữ liệu cho mục lịch sử trả về từ API
interface HistoryItem {
  _id?: string;
  slug: string;
  name: string;
  imageSrc?: string;
  updatedAt: string;
}

interface UseWatchHistoryParams {
  email?: string | null;
  moviesToMatch: Movie[][]; 
}

export function useWatchHistory({ email, moviesToMatch }: UseWatchHistoryParams) {
  const [continueWatchingMovies, setContinueWatchingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Tránh re-calculate mảng phim quá nhiều lần
  const allLocalMovies = useMemo(() => moviesToMatch.flat(), [moviesToMatch]);

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (!email) {
        setContinueWatchingMovies([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await fetch(`/api/history?email=${email}`);
        if (!res.ok) throw new Error('Failed to fetch history');
        
        const data = await res.json();
        
        if (data.history && data.history.length > 0) {
          const sortedHistory = data.history
            .sort((a: HistoryItem, b: HistoryItem) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 10);

          const historyMovies: Movie[] = await Promise.all(
            sortedHistory.map(async (item: HistoryItem) => {
              let imgSrc = '/placeholder-image.jpg';
              
              const matchedMovie = allLocalMovies.find(m => m.slug === item.slug);
              
              if (matchedMovie) {
                imgSrc = matchedMovie.imageSrc;
              } else if (item.imageSrc) {
                imgSrc = item.imageSrc;
              } else {
                try {
                  const detail = await getMovieDetails(item.slug);
                  if (detail?.movie) {
                    const imgUrl = detail.movie.thumb_url || detail.movie.poster_url || '';
                    imgSrc = imgUrl.startsWith('http') ? imgUrl : `https://phimimg.com/${imgUrl}`;
                  }
                } catch (e) {
                  console.error(`Lỗi lấy ảnh tạm cho slug: ${item.slug}`, e);
                }
              }

              return {
                id: item._id || item.slug,
                title: item.name,
                slug: item.slug,
                imageSrc: imgSrc
              };
            })
          );
          
          if (isMounted) {
            setContinueWatchingMovies(historyMovies);
          }
        } else {
           if (isMounted) setContinueWatchingMovies([]);
        }
      } catch (error) {
        console.error("Lỗi lấy lịch sử:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [email, allLocalMovies]); 

  return { continueWatchingMovies, isLoading };
}
