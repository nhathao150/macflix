import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getMoviesByGenrePaginated(slug: string, page: number = 1, limit: number = 96) {
  try {
    const res = await fetch(`https://phimapi.com/v1/api/the-loai/${slug}?limit=${limit}&page=${page}`);
    if (!res.ok) return { items: [], pagination: null, title: 'Danh mục phim' };
    
    const data = await res.json();
    const imageDomain = data.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/';

    const items = data.data?.items?.map((movie: any) => ({
      id: movie._id,
      title: movie.name,
      // Ép dùng ảnh dọc (poster_url) cho giao diện dạng lưới
      imageSrc: movie.poster_url.startsWith('http') ? movie.poster_url : `${imageDomain}/${movie.poster_url}`,
      slug: movie.slug
    })) || [];

    return {
      items,
      pagination: data.data?.params?.pagination, // Chứa thông tin tổng số trang
      title: data.data?.seoOnPage?.titleHead || 'Danh mục phim'
    };
  } catch (error) {
    console.error(`Lỗi fetch API thể loại ${slug}:`, error);
    return { items: [], pagination: null, title: 'Lỗi tải dữ liệu' };
  }
}