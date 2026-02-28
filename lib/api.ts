// lib/api.ts

import { Movie, OphimMovie } from "@/types";

export type { Movie };

// 1. Hàm lấy phim mới hỗn hợp (Dùng cho Hero Banner) - Đã Cache
export async function getNewMovies(page = 1, limit = 20): Promise<Movie[]> {
  try {
    const res = await fetch(`https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`Lỗi HTTP getNewMovies: ${res.status}`);
      return [];
    }
    const data = await res.json();
    
    if (!data || !data.items) {
      return [];
    }
    
    const imageDomain = data.pathImage || 'https://phimimg.com/';
    
    // Lấy tất cả items, sau đó mới filter theo limit
    const items = data.items.slice(0, limit);
    
    return items.map((movie: OphimMovie) => ({
      id: movie._id,
      title: movie.name,
      imageSrc: movie.thumb_url?.startsWith('http') ? movie.thumb_url : `${imageDomain}${movie.thumb_url}`,
      slug: movie.slug 
    }));
  } catch (error) {
    console.error("Lỗi catch phim mới:", error);
    return [];
  }
}

// 2. Hàm lấy phim theo từng Danh Mục - Đã Cache
export async function getMoviesByCategory(category: string, limit = 20): Promise<Movie[]> {
  try {
    const res = await fetch(`https://phimapi.com/v1/api/danh-sach/${category}?limit=${limit}`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn(`Cảnh báo: HTTP ${res.status} khi lấy danh mục ${category}`);
      return [];
    }
    
    // Đôi lúc API lỗi trả về textHTML, nên để try-catch lúc parse json
    let data;
    try {
      data = await res.json();
    } catch (e) {
      console.error(`Lỗi parse JSON danh mục ${category}:`, e);
      return [];
    }
    
    // Kiểm tra tính hợp lệ của schema API trả về
    if (!data || data.status === false || !data.data || !data.data.items) {
      console.warn(`Danh mục ${category} trả về kết quả rỗng hoặc không tồn tại.`);
      return [];
    }
    
    const imageDomain = data.data.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/';
    
    return data.data.items.map((movie: OphimMovie) => ({
      id: movie._id,
      title: movie.name,
      imageSrc: movie.thumb_url?.startsWith('http') ? movie.thumb_url : `${imageDomain}/${movie.thumb_url}`,
      slug: movie.slug 
    }));
  } catch (error) {
    console.error(`Lỗi fetch API danh mục ${category}:`, error);
    return [];
  }
}

// 3. Hàm lấy chi tiết phim - ĐÃ THÊM CACHE
export async function getMovieDetails(slug: string) {
  try {
    const res = await fetch(`https://phimapi.com/phim/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Failed to fetch details');
    return await res.json();
  } catch (error) {
    console.error("Lỗi fetch chi tiết phim:", error);
    return null;
  }
}

// 4. Hàm tìm kiếm - KHÔNG CACHE (Vì dữ liệu do user gõ ngẫu nhiên)
export async function searchMovies(keyword: string) {
  try {
    const res = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=5`);
    if (!res.ok) return [];
    const data = await res.json();
    const imageDomain = data.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/';
    
    return data.data?.items?.map((movie: OphimMovie) => ({
      id: movie._id,
      title: movie.name,
      imageSrc: movie.thumb_url.startsWith('http') ? movie.thumb_url : `${imageDomain}/${movie.thumb_url}`,
      slug: movie.slug
    })) || [];
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error);
    return [];
  }
}

// 5. Hàm lấy phim theo Thể loại (Trang chủ) - ĐÃ THÊM CACHE
export async function getMoviesByGenre(slug: string) {
  try {
    const res = await fetch(`https://phimapi.com/v1/api/the-loai/${slug}?limit=10`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const imageDomain = data.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/';
    
    return data.data?.items?.map((movie: OphimMovie) => ({
      id: movie._id,
      title: movie.name,
      imageSrc: movie.thumb_url.startsWith('http') ? movie.thumb_url : `${imageDomain}/${movie.thumb_url}`,
      slug: movie.slug
    })) || [];
  } catch (error) {
    console.error(`Lỗi fetch API thể loại ${slug}:`, error);
    return [];
  }
}

// 6. Hàm Phân trang Thể loại - ĐÃ THÊM CACHE
export async function getMoviesByGenrePaginated(slug: string, page: number = 1, limit: number = 64) {
  try {
    const res = await fetch(`https://phimapi.com/v1/api/the-loai/${slug}?limit=${limit}&page=${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { items: [], pagination: null, title: 'Danh mục phim' };
    
    const data = await res.json();
    const imageDomain = data.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/';

    const items = data.data?.items?.map((movie: OphimMovie) => {
      const imgUrl = movie.poster_url || movie.thumb_url || '';
      return {
        id: movie._id,
        title: movie.name,
        imageSrc: imgUrl.startsWith('http') ? imgUrl : `${imageDomain}/${imgUrl}`,
        slug: movie.slug
      };
    }) || [];

    return {
      items,
      pagination: data.data?.params?.pagination,
      title: data.data?.seoOnPage?.titleHead || 'Danh mục phim'
    };
  } catch (error) {
    console.error(`Lỗi fetch API thể loại ${slug}:`, error);
    return { items: [], pagination: null, title: 'Lỗi tải dữ liệu' };
  }
}

// 7. Hàm Phân trang Quốc gia - ĐÃ THÊM CACHE
export async function getMoviesByCountryPaginated(slug: string, page: number = 1, limit: number = 64) {
  try {
    const res = await fetch(`https://phimapi.com/v1/api/quoc-gia/${slug}?limit=${limit}&page=${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { items: [], pagination: null, title: 'Danh mục quốc gia' };
    
    const data = await res.json();
    const imageDomain = data.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/';

    const items = data.data?.items?.map((movie: OphimMovie) => {
      const imgUrl = movie.poster_url || movie.thumb_url || '';
      return {
        id: movie._id,
        title: movie.name,
        imageSrc: imgUrl.startsWith('http') ? imgUrl : `${imageDomain}/${imgUrl}`,
        slug: movie.slug
      };
    }) || [];

    return {
      items,
      pagination: data.data?.params?.pagination,
      title: data.data?.seoOnPage?.titleHead || 'Danh mục quốc gia'
    };
  } catch (error) {
    console.error(`Lỗi fetch API quốc gia ${slug}:`, error);
    return { items: [], pagination: null, title: 'Lỗi tải dữ liệu' };
  }
}

// 8. Hàm Phân trang cho các Danh Mục (phim-bo, phim-le, hoat-hinh, tv-shows) - ĐÃ THÊM CACHE
export async function getDanhSachPhimPaginated(slug: string, page: number = 1, limit: number = 64) {
  try {
    const res = await fetch(`https://phimapi.com/v1/api/danh-sach/${slug}?limit=${limit}&page=${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) {
        console.warn(`Cảnh báo HTTP ${res.status}: không tìm thấy danh mục phân trang ${slug}`);
        return { items: [], pagination: null, title: 'Danh sách phim' };
    }
    
    const data = await res.json();
    if (!data || data.status === false || !data.data || !data.data.items) {
      return { items: [], pagination: null, title: 'Danh sách phim trống' };
    }

    const imageDomain = data.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/';

    const items = data.data?.items?.map((movie: OphimMovie) => {
      const imgUrl = movie.poster_url || movie.thumb_url || '';
      return {
        id: movie._id,
        title: movie.name,
        imageSrc: imgUrl.startsWith('http') ? imgUrl : `${imageDomain}/${imgUrl}`,
        slug: movie.slug
      };
    }) || [];

    return {
      items,
      pagination: data.data?.params?.pagination,
      title: data.data?.seoOnPage?.titleHead || 'Danh mục phim'
    };
  } catch (error) {
    console.warn(`Cảnh báo fetch API danh mục phân trang ${slug}:`, error);
    return { items: [], pagination: null, title: 'Lỗi tải dữ liệu' };
  }
}

// 9. Hàm Phân trang cho Phim Mới (API này cấu trúc riêng) - ĐÃ THÊM CACHE
export async function getNewMoviesPaginated(page: number = 1) {
  try {
    const res = await fetch(`https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { items: [], pagination: null, title: 'Phim Mới Cập Nhật' };
    
    const data = await res.json();
    if (!data || !data.items) {
       return { items: [], pagination: null, title: 'Phim Mới Cập Nhật trống' };
    }

    const imageDomain = data.pathImage || 'https://phimimg.com/';

    const items = data.items.map((movie: OphimMovie) => {
      const imgUrl = movie.poster_url || movie.thumb_url || '';
      return {
        id: movie._id,
        title: movie.name,
        imageSrc: imgUrl.startsWith('http') ? imgUrl : `${imageDomain}${imgUrl}`,
        slug: movie.slug
      };
    }) || [];

    return {
      items,
      pagination: data.pagination,
      title: 'Phim Mới Cập Nhật'
    };
  } catch (error) {
    console.error(`Lỗi fetch API phim mới phân trang:`, error);
    return { items: [], pagination: null, title: 'Lỗi tải dữ liệu' };
  }
}