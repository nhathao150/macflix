'use client'; // Component này chạy trên client

import React, { useState, useEffect, useCallback } from 'react'; // Thêm React.memo và useCallback
import Image from 'next/image'; // Component Image tối ưu ảnh của Next.js

// ── Các Interface (Định nghĩa kiểu dữ liệu) ────────────

// Kiểu dữ liệu mô tả 1 người (đạo diễn, diễn viên) lấy từ API của ophim
export interface OphimPerson {
  name: string; // Tên diễn viên/đạo diễn
  also_known_as: string[]; // Các tên gọi khác (nếu có)
  profile_path: string | null; // Đường dẫn ảnh (phần đuôi url)
  character?: string; // Vai diễn trong phim
  known_for_department?: string; // Chuyên môn chính (vd: Acting - Diễn xuất)
}

// Kiểu dữ liệu mô tả danh sách diễn viên và đường dẫn gốc của ảnh
export interface PeoplesData {
  peoples: OphimPerson[];
  photoBaseUrl: string; // Tên miền gốc chứa ảnh (vd: https://image.tmdb.org)
}

// Props truyền vào component CastCard
interface CastCardProps {
  name: string; // Tên hiển thị
  role: 'Đạo diễn' | 'Diễn viên'; // Vai trò
  colorIndex: number; // Chỉ số dùng để random màu nền (khi không có ảnh)
  variant?: 'pill' | 'circle'; // Kiểu dáng thẻ hiển thị: pill (hình viên thuốc), circle (hình tròn)
  photoUrl?: string; // Link ảnh nếu có
}

// Mảng chứa các chuỗi màu gradient bằng Tailwind CSS
const GRADIENT_COLORS = [
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-purple-500 to-indigo-500',
  'from-yellow-500 to-orange-500',
  'from-green-500 to-teal-500',
  'from-red-500 to-pink-600',
];

// ── Component chính: CastCard (Thẻ hiển thị 1 diễn viên/đạo diễn) ────────────
const CastCard = React.memo(function CastCard({ name, role, colorIndex, variant = 'pill', photoUrl }: CastCardProps) {
  // State theo dõi xem ảnh có bị lỗi khi tải hay không (vd: link die 404)
  const [imgError, setImgError] = useState(false);

  // Chọn màu nền ngẫu nhiên theo mảng GRADIENT_COLORS dựa trên colorIndex
  const gradient = GRADIENT_COLORS[colorIndex % GRADIENT_COLORS.length];
  
  // Lấy tên viết tắt. VD: "Tom Cruise" -> ["T", "C"] -> "TC"
  const initials = name.split(' ').map((n) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
  
  // Cờ kiểm tra: Nếu có URL ảnh VÀ ảnh chưa bị lỗi thì mới cho hiển thị thẻ <Image>
  const showPhoto = !!photoUrl && !imgError;

  // Dùng useCallback để hàm handleError không bị tạo lại mỗi lần component render
  const handleError = useCallback(() => {
    setImgError(true);
  }, []);

  // Render kiểu giao diện Hình Tròn (Circle)
  if (variant === 'circle') {
    return (
      <div className="shrink-0 flex flex-col items-center gap-3 w-28 md:w-32 text-center group cursor-pointer">
        {/* Khối chứa ảnh (hoặc chữ cái viết tắt) */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-xl border-2 border-transparent group-hover:border-[#F042FF] group-hover:scale-105 transition-all">
          {showPhoto ? (
            // Thẻ Image Next.js, nếu tải lỗi (onError) thì gọi handleError
            <Image src={photoUrl!} alt={name} width={96} height={96}
              className="w-full h-full object-cover object-top"
              onError={handleError} loading="lazy" />
          ) : (
            // Nếu không có ảnh, tạo 1 div có màu nền gradient và chữ viết tắt ở giữa
            <div className={`w-full h-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-black text-2xl md:text-3xl`}>
              {initials}
            </div>
          )}
        </div>
        {/* Tên và chức vụ */}
        <div>
          <p className="text-sm md:text-base font-bold text-white/95 line-clamp-2 leading-tight group-hover:text-[#F042FF] transition-colors">{name}</p>
          <p className="text-xs md:text-sm text-white/60 font-medium mt-0.5">{role}</p>
        </div>
      </div>
    );
  }

  // Render kiểu giao diện Hình Viên Thuốc (Pill) - mặc định
  return (
    <div className="flex items-center gap-4 bg-[#141414] border border-white/10 pr-5 rounded-full hover:bg-white/10 transition-colors cursor-pointer group">
      {/* Cục ảnh hình tròn bên trái */}
      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform">
        {showPhoto ? (
          <Image src={photoUrl!} alt={name} width={48} height={48}
            className="w-full h-full object-cover object-top"
            onError={handleError} loading="lazy" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-black text-base`}>
            {initials}
          </div>
        )}
      </div>
      {/* Text Tên & Chức vụ bên phải cục ảnh */}
      <div>
        <p className="text-sm md:text-base font-bold text-white line-clamp-1">{name}</p>
        <p className="text-xs text-white/60 font-medium">{role}</p>
      </div>
    </div>
  );
});

export default CastCard;

// ── Hook: fetch toàn bộ danh sách diễn viên từ API bên thứ 3 ────────────
export function usePeoplesData(slug: string | null | undefined): PeoplesData {
  // State chứa dữ liệu trả về từ API
  const [data, setData] = useState<PeoplesData>({ peoples: [], photoBaseUrl: 'https://image.tmdb.org/t/p/w185' });

  useEffect(() => {
    if (!slug) return; // Không gọi API nếu không có slug phim
    let cancelled = false; // Dùng để cancel khi component bị xoá (unmount)

    // Lấy URL nguồn từ biến môi trường (env)
    const OPHIM_API_URL = process.env.NEXT_PUBLIC_OPHIM_API_URL || 'https://ophim1.com';
    
    // Gọi API của ophim thông qua API route trung gian /api/proxy (để tránh lỗi CORS)
    fetch(`/api/proxy?url=${encodeURIComponent(`${OPHIM_API_URL}/v1/api/phim/${slug}/peoples`)}`)
      .then((r) => r.json())
      .then((res: {
        success: boolean;
        data?: {
          profile_sizes?: { w185?: string };
          peoples?: OphimPerson[];
        };
      }) => {
        // Cập nhật state nếu fetch thành công và chưa bị cancelled
        if (cancelled || !res.success || !res.data?.peoples) return;
        setData({
          peoples: res.data.peoples,
          photoBaseUrl: res.data.profile_sizes?.w185 || 'https://image.tmdb.org/t/p/w185',
        });
      })
      .catch(() => {});

    // Hàm cleanup (chạy khi unmount) để tránh set state vào component không còn tồn tại
    return () => { cancelled = true; };
  }, [slug]); // Chạy lại khi slug đổi

  return data;
}

// ── Hook phụ: Tạo một Map để lấy nhanh link ảnh bằng tên diễn viên ────────────
export function useTmdbActorPhotos(slug: string | null | undefined): Map<string, string> {
  const { peoples, photoBaseUrl } = usePeoplesData(slug);
  const map = new Map<string, string>(); // Cấu trúc dữ liệu Map (Key-Value)
  
  // Duyệt qua danh sách diễn viên để đổ vào Map
  peoples.forEach((p) => {
    if (!p.profile_path) return;
    const url = `${photoBaseUrl}${p.profile_path}`;
    // Key là tên thường (lowercase) -> Value là url ảnh
    if (p.name) map.set(p.name.toLowerCase(), url);
    // Key có thể là các biệt danh (also_known_as)
    p.also_known_as?.forEach((aka) => { if (aka) map.set(aka.toLowerCase(), url); });
  });
  return map;
}

// Export mảng màu để component khác có thể tái sử dụng
export const CAST_GRADIENT_COLORS = GRADIENT_COLORS;
