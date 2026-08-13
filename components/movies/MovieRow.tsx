'use client'; // Đánh dấu đây là Client Component trong Next.js (chạy trên trình duyệt, có thể dùng hooks như useRef, onClick)

import { useRef, useCallback } from 'react'; // Hook để tham chiếu trực tiếp đến một phần tử HTML (DOM)
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Các icon mũi tên trái/phải
import MovieCard from './MovieCard'; // Component hiển thị từng thẻ phim
import Link from 'next/link'; // Component điều hướng trang của Next.js (không làm tải lại trang)
import { Movie } from '@/types'; // Định nghĩa kiểu dữ liệu cho một bộ phim
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'; // Hook custom giúp lazy load

// Định nghĩa các thuộc tính (props) mà component MovieRow sẽ nhận vào từ component cha
interface MovieRowProps {
  title: string; // Tiêu đề của hàng phim (vd: "Phim thịnh hành")
  movies: Movie[]; // Danh sách các bộ phim sẽ hiển thị
  isTrending?: boolean; // Cờ đánh dấu có phải phim thịnh hành hay không (tuỳ chọn)
  onMovieClick: (movie: Movie) => void; // Hàm xử lý sự kiện khi người dùng click vào một bộ phim
  viewMoreLink?: string; // Link "Xem tất cả" (tuỳ chọn)
  rowIndex?: number; // Vị trí của hàng phim (dùng để lazy load hoặc xếp hạng - tuỳ chọn)
}

export default function MovieRow({ title, movies, isTrending, onMovieClick, viewMoreLink, rowIndex = 0 }: MovieRowProps) {
  // Tham chiếu đến toàn bộ thẻ div bao ngoài cùng để đo vị trí cuộn
  const containerRef = useRef<HTMLDivElement>(null);
  // Tham chiếu đến thẻ div bọc danh sách phim. Dùng để tính toán và điều khiển việc cuộn (scroll) ngang
  const rowRef = useRef<HTMLDivElement>(null);

  // Áp dụng Hook IntersectionObserver: Chỉ render khi cuộn cách màn hình 500px
  // Render ưu tiên cho 2 hàng đầu tiên (rowIndex < 2) để người dùng thấy ngay lúc mới vào web
  const isIntersecting = useIntersectionObserver(containerRef, { rootMargin: '500px', triggerOnce: true });
  const shouldRender = isIntersecting || rowIndex < 2;

  // Nếu không có phim nào hoặc mảng phim rỗng thì không hiển thị gì cả (ẩn row này đi)
  if (!movies || movies.length === 0) return null;

  // Hàm xử lý khi bấm nút cuộn sang trái hoặc phải
  // Dùng useCallback để tránh tạo lại hàm này mỗi lần component render lại
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (rowRef.current) {
      // Lấy ra vị trí cuộn hiện tại (scrollLeft) và chiều rộng hiển thị của danh sách (clientWidth)
      const { scrollLeft, clientWidth } = rowRef.current;
      
      // Tính toán quãng đường sẽ cuộn (bằng 75% chiều rộng màn hình để người dùng vẫn thấy một phần phim cũ)
      const scrollAmount = clientWidth * 0.75;
      
      // Tính toán vị trí cần cuộn tới dựa vào hướng trái hay phải
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

      // Thực hiện cuộn mượt (smooth) tới vị trí đã tính
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, []);

  // Khối giao diện của Tiêu đề hàng phim
  const titleContent = (
    <h2 className="font-bold text-white mb-4 px-4 md:px-12 drop-shadow-md flex items-center group/title cursor-pointer w-fit">
      {title}
      {/* Nếu có truyền link viewMoreLink thì mới hiển thị chữ "Xem tất cả" */}
      {viewMoreLink && (
        <span className="flex items-center text-sm font-normal text-gray-400 opacity-0 group-hover/title:opacity-100 transition-all duration-300 ml-3 group-hover/title:translate-x-2">
          Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      )}
    </h2>
  );

  return (
    <div
      ref={containerRef}
      className="w-full relative py-6"
      style={{
        // Tối ưu hoá render: Trình duyệt sẽ chỉ render nội dung bên trong khi nó gần xuất hiện trên màn hình
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 280px', // Kích thước dự kiến của khối này để tránh nhảy layout (ngăn ngừa CLS)
        minHeight: '280px' // Đảm bảo luôn giữ chỗ kể cả khi chưa render
      }}
    >
      {/* Hiển thị tiêu đề. Nếu có link thì bọc trong thẻ Link, nếu không thì hiển thị bình thường */}
      {viewMoreLink ? (
        <Link href={viewMoreLink} className="inline-block w-fit">
          {titleContent}
        </Link>
      ) : (
        titleContent
      )}

      {/* Khối chứa danh sách phim và 2 nút mũi tên */}
      <div className="relative group/row px-4 md:px-12">
        
        {/* Nút lướt Trái - Dạng nút tròn, kính mờ (ẩn mặc định, hover mới hiện) */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-2 md:left-4 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-lg scale-90 hover:scale-100 hidden md:flex"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        {shouldRender && (
          <div
            ref={rowRef} // Gắn ref vào đây để hàm scroll ở trên có thể điều khiển được
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 pt-2 -mx-4 md:-mx-12 px-4 md:px-12 md:snap-x md:snap-mandatory"
          >
            {/* Vòng lặp duyệt qua mảng phim và tạo ra các MovieCard */}
            {movies.map((movie, index) => (
              <div
                key={movie.id} // Bắt buộc phải có key duy nhất khi dùng vòng lặp map trong React
                className="shrink-0 transition-transform duration-300 hover:z-50 focus-within:z-50 md:snap-start md:snap-always"
                onClick={() => onMovieClick(movie)} // Gọi hàm xử lý click phim (vd: mở popup)
              >
                {/* index < 4 để ưu tiên load ảnh cho 4 phim đầu tiên hiển thị trên màn hình */}
                <MovieCard movie={movie} isTrending={isTrending} priority={index < 4 && rowIndex < 2} />
              </div>
            ))}
          </div>
        )}

        {/* Nút lướt Phải - Dạng nút tròn, kính mờ */}
        {shouldRender && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-2 md:right-4 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-lg scale-90 hover:scale-100 hidden md:flex"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}