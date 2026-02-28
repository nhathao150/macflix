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
}

export default function FavoriteButton({ movieData }: FavoriteButtonProps) {
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
    e.preventDefault(); // Ngăn chặn sự kiện click lan ra ngoài làm đóng Popup
    e.stopPropagation();

    if (!session?.user?.email) {
      alert("Vui lòng đăng nhập để lưu phim vào danh sách Yêu thích!");
      return;
    }

    // Đổi màu ngay lập tức cho mượt (Optimistic UI)
    setIsFavorited(!isFavorited);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, movieData })
      });
      const data = await res.json();
      
      // Nếu server trả về kết quả thì cập nhật lại cho chắc chắn
      if (res.ok) setIsFavorited(data.isFavorited);
    } catch (error) {
      // Nếu lỗi mạng thì trả lại trạng thái cũ
      setIsFavorited(!isFavorited); 
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="absolute top-4 right-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/70 hover:scale-110 transition-all group/fav shadow-xl"
      title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
    >
      <Heart 
        className={`w-6 h-6 transition-all duration-300 ${
          isFavorited 
          ? 'text-red-500 fill-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] scale-110' 
          : 'text-white/70 group-hover/fav:text-white'
        }`} 
      />
    </button>
  );
}