# 🎬 Macflix - Advanced Movie Streaming Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![HLS.js](https://img.shields.io/badge/HLS.js-Streaming-FF0000?logo=youtube)](https://github.com/video-dev/hls.js/)

> **Macflix** là nền tảng xem phim trực tuyến chất lượng cao được lấy cảm hứng từ giao diện UI/UX của Netflix. Dự án tập trung mạnh vào hiệu năng (Performance), khả năng tương thích đa thiết bị (Responsive/Mobile-first) và tối ưu hóa luồng dữ liệu Video (Video Streaming).

🌐 **Live Demo:** [https://macflix-ten.vercel.app](https://#)

---

## 💡 Các bài toán kỹ thuật đã giải quyết (Technical Challenges & Solutions)

### 1. Tối ưu hóa render cho hàng ngàn thẻ phim (DOM Optimization)
- **Vấn đề:** Khi render hàng chục danh mục với hàng ngàn bộ phim trên trang chủ, trình duyệt bị giật lag và rớt FPS nghiêm trọng.
- **Giải pháp:** Tự xây dựng Custom Hook `useIntersectionObserver` kết hợp với thuộc tính CSS `content-visibility: auto`. Chỉ những danh mục phim nào lọt vào khung hình (Viewport) mới được render, giúp trang web load siêu tốc với FPS luôn ở mức 60.

### 2. Tối ưu Video Streaming & Vượt rào cản của iOS Safari
- **Vấn đề:** Trình phát video mặc định rất xấu, khó dùng trên điện thoại. Đặc biệt hệ điều hành iOS chặn nghiêm ngặt tính năng tự động phát (Auto-play) và các sự kiện Fullscreen bằng code.
- **Giải pháp:** 
  - Tích hợp `hls.js` (HTTP Live Streaming) để băm nhỏ video thành các đoạn chunk, hỗ trợ **Adaptive Bitrate Streaming** chống giật lag khi mạng yếu.
  - Tự code 100% giao diện Custom Video Player.
  - Bắt các sự kiện `onTouchEnd` thay vì `onClick` để xử lý triệt để lỗi "click ảo" trên Safari. Sử dụng khối `try-catch` để bẫy lỗi Fullscreen của Apple và xử lý mượt mà.

### 3. Hạn chế Request đến API bên thứ 3 (API Caching)
- **Vấn đề:** Sử dụng API miễn phí từ bên thứ 3 thường bị giới hạn lượt gọi (Rate Limit) và thời gian phản hồi chậm.
- **Giải pháp:** Chuyển hướng các lệnh gọi API từ Client qua **Next.js Server-side Proxy**. Thiết lập thời gian sống của bộ nhớ đệm (Cache Revalidation = 3600s), giúp hàng ngàn user truy cập cùng lúc nhưng server chỉ gọi API đúng 1 lần mỗi giờ. Chống sập hệ thống và giảm thời gian phản hồi xuống mức mili-giây.

---

## 🚀 Các tính năng nổi bật (Features)

- **UI/UX chuẩn Cinematic:** Dark theme, Glassmorphism, CSS Scroll Snapping (vuốt ngang mượt mà).
- **Trải nghiệm Mobile-first:** Tích hợp thanh Bottom Navigation như App Native, tự động cảnh báo yêu cầu xoay ngang màn hình khi xem phim.
- **Trình phát Video nâng cao:** Chạm đúp để tua (Double-tap to seek), Picture-in-Picture, Tùy chỉnh tốc độ.
- **Tính năng cá nhân hóa:** Đăng nhập an toàn (NextAuth), lưu Lịch sử xem phim, thêm phim vào danh sách Yêu thích.
- **Tìm kiếm thông minh:** Tính năng Autocomplete Search áp dụng `Debounce` chống spam request.

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router), React 19
- **Styling:** Tailwind CSS, Framer Motion
- **Video Player:** HLS.js, HTML5 Video API
- **Authentication:** NextAuth.js
- **Database / API:** PhimAPI (Nguồn phim), MongoDB (Lưu lịch sử/User - *nếu bạn có dùng*)

---

## ⚙️ Cài đặt chạy thử tại máy (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/nhathao150/macflix.git

# 2. Cài đặt thư viện
npm install

# 3. Tạo file .env.local và thêm các biến môi trường cần thiết
NEXT_PUBLIC_MOVIE_API_URL=https://phimapi.com

# 4. Chạy dự án
npm run dev