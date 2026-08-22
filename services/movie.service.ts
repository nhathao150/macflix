// lib/api.ts

import { Movie, OphimMovie } from "@/types";

export type { Movie };

const MOVIE_API_URL = process.env.NEXT_PUBLIC_MOVIE_API_URL || 'https://phimapi.com';

// Helper to fetch with local server-side caching on client-side, and direct fetch on server-side
async function fetchWithCache(url: string, revalidate = 86400) {
  try {
    // If running in the browser, call through our local Next.js proxy route so it gets server-cached
    if (typeof window !== 'undefined') {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Proxy failed: ${res.statusText}`);
      return await res.json();
    } else {
      // If running on the server (build time or SSR), fetch directly
      const res = await fetch(url, { next: { revalidate } });
      if (!res.ok) throw new Error(`Direct fetch failed: ${res.statusText}`);
      return await res.json();
    }
  } catch (error) {
    console.error(`Error in fetchWithCache for URL: ${url}`, error);
    throw error;
  }
}


// 1. Hàm lấy phim mới hỗn hợp (Dùng cho Hero Banner) - Đã Cache
export async function getNewMovies(page = 1, limit = 20): Promise<Movie[]> {
  try {
    const res = await fetch(`${MOVIE_API_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`Lỗi HTTP getNewMovies: ${res.status}`);
      return [];
    }
    const data = await res.json();
    
    if (!data || !data.items) {
      return [];
    }
    
    const imageDomain = data.pathImage || 'https://phimimg.com/';
    const imgDomain = imageDomain.endsWith('/') ? imageDomain : `${imageDomain}/`;
    
    // Lấy tất cả items, sau đó mới filter theo limit
    const items = data.items.slice(0, limit);
    
    return items.map((movie: OphimMovie) => ({
      id: movie._id,
      title: movie.name,
      imageSrc: movie.thumb_url?.startsWith('http') ? movie.thumb_url : `${imgDomain}${movie.thumb_url}`,
      posterSrc: movie.poster_url ? (movie.poster_url.startsWith('http') ? movie.poster_url : `${imgDomain}${movie.poster_url}`) : undefined,
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
    const res = await fetch(`${MOVIE_API_URL}/v1/api/danh-sach/${category}?limit=${limit}`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      if (res.status !== 404) {
        console.warn(`Cảnh báo: HTTP ${res.status} khi lấy danh mục ${category}`);
      }
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
    const imgDomain = imageDomain.endsWith('/') ? imageDomain : `${imageDomain}/`;
    
    return data.data.items.map((movie: OphimMovie) => {
      const thumbUrl = movie.thumb_url || movie.poster_url || '';
      const posterUrl = movie.poster_url || movie.thumb_url || '';
      return {
        id: movie._id,
        title: movie.name,
        imageSrc: thumbUrl.startsWith('http') ? thumbUrl : `${imgDomain}${thumbUrl}`,
        posterSrc: posterUrl.startsWith('http') ? posterUrl : `${imgDomain}${posterUrl}`,
        slug: movie.slug 
      };
    });
  } catch (error) {
    console.error(`Lỗi fetch API danh mục ${category}:`, error);
    return [];
  }
}

// 3. Hàm lấy chi tiết phim - ĐÃ THÊM CACHE QUA PROXY
export async function getMovieDetails(slug: string) {
  try {
    return await fetchWithCache(`${MOVIE_API_URL}/phim/${slug}`, 3600);
  } catch (error) {
    console.error("Lỗi fetch chi tiết phim:", error);
    return null;
  }
}

// 4. Hàm tìm kiếm nhanh (dropdown) - KHÔNG CACHE (Vì search cần phản hồi động)
export async function searchMovies(keyword: string) {
  try {
    const res = await fetch(`${MOVIE_API_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=6`);
    if (!res.ok) return [];
    const data = await res.json();
    const imageDomain = data.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/';
    const imgDomain = imageDomain.endsWith('/') ? imageDomain : `${imageDomain}/`;
    
    return data.data?.items?.map((movie: OphimMovie) => {
      const thumbUrl = movie.thumb_url || movie.poster_url || '';
      const posterUrl = movie.poster_url || movie.thumb_url || '';
      return {
        id: movie._id,
        title: movie.name,
        originName: movie.origin_name,
        imageSrc: thumbUrl.startsWith('http') ? thumbUrl : `${imgDomain}${thumbUrl}`,
        posterSrc: posterUrl.startsWith('http') ? posterUrl : `${imgDomain}${posterUrl}`,
        slug: movie.slug
      };
    }) || [];
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error);
    return [];
  }
}

// 4b. Hàm tìm kiếm có phân trang (trang kết quả)
export async function searchMoviesPaginated(keyword: string, page: number = 1, limit: number = 48) {
  try {
    const res = await fetch(`${MOVIE_API_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=${limit}&page=${page}`);
    if (!res.ok) return { items: [], pagination: null };
    const data = await res.json();
    const imageDomain = data.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/';

    const items = data.data?.items?.map((movie: OphimMovie) => {
      const imgUrl = movie.poster_url || movie.thumb_url || '';
      return {
        id: movie._id,
        title: movie.name,
        originName: movie.origin_name,
        imageSrc: imgUrl.startsWith('http') ? imgUrl : `${imageDomain}/${imgUrl}`,
        slug: movie.slug
      };
    }) || [];

    return {
      items,
      pagination: data.data?.params?.pagination
    };
  } catch (error) {
    console.error("Lỗi tìm kiếm phân trang:", error);
    return { items: [], pagination: null };
  }
}

// 5. Hàm lấy phim theo Thể loại (Trang chủ) - CÓ CACHE QUA PROXY
export async function getMoviesByGenre(slug: string) {
  try {
    const data = await fetchWithCache(`${MOVIE_API_URL}/v1/api/the-loai/${slug}?limit=24`, 3600);
    if (!data?.data?.items) return [];
    const imageDomain = data.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com/';
    const imgDomain = imageDomain.endsWith('/') ? imageDomain : `${imageDomain}/`;
    
    return data.data.items.map((movie: OphimMovie) => {
      const thumbUrl = movie.thumb_url || movie.poster_url || '';
      const posterUrl = movie.poster_url || movie.thumb_url || '';
      return {
        id: movie._id,
        title: movie.name,
        originName: movie.origin_name,
        imageSrc: thumbUrl.startsWith('http') ? thumbUrl : `${imgDomain}${thumbUrl}`,
        posterSrc: posterUrl.startsWith('http') ? posterUrl : `${imgDomain}${posterUrl}`,
        slug: movie.slug
      };
    });
  } catch (error) {
    console.error(`Lỗi fetch API thể loại ${slug}:`, error);
    return [];
  }
}

// 6. Hàm Phân trang Thể loại - ĐÃ THÊM CACHE
export async function getMoviesByGenrePaginated(slug: string, page: number = 1, limit: number = 24, country: string = '', year: string = '') {
  try {
    let url = `${MOVIE_API_URL}/v1/api/the-loai/${slug}?limit=${limit}&page=${page}`;
    if (country) url += `&country=${country}`;
    if (year) url += `&year=${year}`;
    const data = await fetchWithCache(url, 3600);
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
export async function getMoviesByCountryPaginated(slug: string, page: number = 1, limit: number = 24, category: string = '', year: string = '') {
  try {
    let url = `${MOVIE_API_URL}/v1/api/quoc-gia/${slug}?limit=${limit}&page=${page}`;
    if (category) url += `&category=${category}`;
    if (year) url += `&year=${year}`;
    const data = await fetchWithCache(url, 3600);
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
export async function getDanhSachPhimPaginated(slug: string, page: number = 1, limit: number = 24, category: string = '', country: string = '', year: string = '') {
  try {
    let url = `${MOVIE_API_URL}/v1/api/danh-sach/${slug}?limit=${limit}&page=${page}`;
    if (category) url += `&category=${category}`;
    if (country) url += `&country=${country}`;
    if (year) url += `&year=${year}`;
    const data = await fetchWithCache(url, 3600);
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

// 9. Hàm Phân trang cho Phim Mới (API này cấu trúc riêng) - CÓ CACHE QUA PROXY
export async function getNewMoviesPaginated(page: number = 1) {
  try {
    const data = await fetchWithCache(`${MOVIE_API_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`, 3600);
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

// 10. Hàm lọc phim theo Quốc Gia + Thể Loại - CÓ CACHE QUA PROXY
export async function getMoviesByCountryAndGenre(
  countrySlug: string,
  genreSlug: string,
  page: number = 1,
  limit: number = 24,
  year: string = ''
) {
  try {
    let url = `${MOVIE_API_URL}/v1/api/quoc-gia/${countrySlug}?limit=${limit}&page=${page}&category=${genreSlug}`;
    if (year) url += `&year=${year}`;
    const data = await fetchWithCache(url, 3600);
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
      title: data.data?.seoOnPage?.titleHead || ''
    };
  } catch (error) {
    console.error(`Lỗi fetch API quốc gia+thể loại:`, error);
    return { items: [], pagination: null, title: '' };
  }
}
