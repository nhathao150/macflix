'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface FavoriteButtonProps {
  movieData: {
    slug: string;
    name: string;
    imageSrc: string;
  };
  className?: string;
}

export default function FavoriteButton({ movieData, className }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);

  // 1. Kiểm tra xem phim này đã được tim chưa khi vừa mở Popup
  useEffect(() => {
    const checkFavorite = async () => {
      if (!session?.user?.email || !movieData?.slug) return;
      try {
        const res = await fetch(`/api/favorites?email=${session.user.email}`);
        const data = await res.json();
        if (res.ok && data.favorites) {
          setIsFavorited(data.favorites.some((item: { slug: string }) => item.slug === movieData.slug));
        }
      } catch (error) {
        console.error("Lỗi check phim yêu thích:", error);
      }
    };
    checkFavorite();
  }, [session, movieData?.slug]);

  // 2. Xử lý khi người dùng bấm vào Trái tim
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.email) {
      alert("Vui lòng đăng nhập để lưu phim vào danh sách Yêu thích!");
      return;
    }

    setIsFavorited(!isFavorited);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, movieData })
      });
      const data = await res.json();
      if (res.ok) setIsFavorited(data.isFavorited);
    } catch (error) {
      setIsFavorited(!isFavorited);
    }
  };

  const defaultStyle = "w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl bg-white/15 hover:bg-white/25 focus:bg-white/25 backdrop-blur-md border border-white/25 hover:scale-105 focus:scale-105 focus:ring-4 focus:ring-[#F042FF] focus:outline-none transition-all cursor-pointer shadow-xl group/fav";

  return (
    <button
      onClick={handleToggle}
      className={className || defaultStyle}
      title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
    >
      <Heart
        className={`w-7 h-7 transition-all duration-300 ${
          isFavorited
          ? 'scale-110'
          : 'text-white/80 group-hover/fav:text-white'
        }`}
        style={isFavorited ? { color: '#F042FF', fill: '#F042FF', filter: 'drop-shadow(0 0 14px rgba(240,66,255,0.9))' } : {}}
      />
    </button>
  );
}