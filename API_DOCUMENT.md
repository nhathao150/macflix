# Tài Liệu API Phim (KKPhim & OPhim API)

Tài liệu này được tổng hợp để bạn có thể xem trực tiếp các đường dẫn API lấy dữ liệu phim đang sử dụng trong dự án `macflix` mà không lo bị nhà mạng chặn.

---

## 1. Domain API Gốc
* **API Chính (Phim & Tìm kiếm):** `https://phimapi.com`
* **API Diễn viên (Cast):** `https://ophim1.com`
* **CDN Ảnh phim mặc định:** `https://phimimg.com/` (nếu API không trả về domain ảnh riêng)

---

## 2. Các Endpoint Chi Tiết

### 2.1. Lấy danh sách Phim Mới Cập Nhật (Phân trang)
* **URL:** `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page={page}`
* **Method:** `GET`
* **Tham số:** 
  * `page` (number): Số trang muốn lấy (mặc định là `1`).
* **Cấu trúc JSON trả về mẫu:**
  ```json
  {
    "status": true,
    "items": [
      {
        "name": "Tên phim tiếng Việt",
        "origin_name": "Tên phim gốc",
        "slug": "ten-phim-slug",
        "thumb_url": "duong-dan-anh-thumb.jpg",
        "poster_url": "duong-dan-anh-poster.jpg",
        "year": 2026,
        "_id": "id_phim"
      }
    ],
    "pathImage": "https://phimimg.com/uploads/movies/",
    "pagination": {
      "totalItems": 1200,
      "totalItemsPerPage": 10,
      "currentPage": 1,
      "totalPages": 120
    }
  }
  ```

---

### 2.2. Lấy Danh Sách Phim theo Danh Mục (Phim bộ, Phim lẻ, Hoạt hình, TV Shows)
* **URL:** `https://phimapi.com/v1/api/danh-sach/{slug}?limit={limit}&page={page}`
* **Method:** `GET`
* **Tham số:**
  * `{slug}` (string): Nhận một trong các giá trị sau:
    * `phim-bo` (Phim bộ)
    * `phim-le` (Phim lẻ)
    * `hoat-hinh` (Hoạt hình)
    * `tv-shows` (TV Shows)
  * `limit` (number): Số lượng phim trên 1 trang (Ví dụ: `24`, `48`).
  * `page` (number): Số trang hiện tại.
* **Cấu trúc JSON trả về mẫu:**
  ```json
  {
    "status": "success",
    "data": {
      "items": [...],
      "APP_DOMAIN_CDN_IMAGE": "https://phimimg.com",
      "params": {
        "pagination": {
          "totalItems": 8500,
          "totalItemsPerPage": 24,
          "currentPage": 1,
          "pageRanges": 5
        }
      }
    }
  }
  ```

---

### 2.3. Lấy Chi Tiết Một Bộ Phim (Bao gồm link phát video)
* **URL:** `https://phimapi.com/phim/{slug}`
* **Method:** `GET`
* **Tham số:**
  * `{slug}` (string): Đường dẫn slug của phim (Ví dụ: `dau-pha-thuong-khung`).
* **Cấu trúc dữ liệu chứa:**
  * `movie`: Thông tin chi tiết của phim (tên, mô tả, năm phát hành, đạo diễn, chất lượng, thời lượng...).
  * `episodes`: Danh sách các tập phim. Mỗi tập sẽ có:
    * `filename`: Tên tập phim (Ví dụ: "Tập 01").
    * `link_embed`: Link iframe để nhúng trực tiếp trình phát video vào web.
    * `link_m3u8`: Link stream video trực tiếp (định dạng HLS, cần các thư viện như `hls.js` hoặc các player như `Video.js`, `Plyr` để phát).

---

### 2.4. Tìm Kiếm Phim
* **URL:** `https://phimapi.com/v1/api/tim-kiem?keyword={keyword}&limit={limit}&page={page}`
* **Method:** `GET`
* **Tham số:**
  * `keyword` (string): Từ khóa tìm kiếm (Ví dụ: `hoat hinh`, `dragon ball`).
  * `limit` (number): Số phim giới hạn trả về.
  * `page` (number): Số trang.

---

### 2.5. Lọc Phim theo Thể Loại
* **URL:** `https://phimapi.com/v1/api/the-loai/{slug}?limit={limit}&page={page}`
* **Method:** `GET`
* **Tham số:**
  * `{slug}` (string): Tên thể loại viết thường không dấu (Ví dụ: `hanh-dong`, `tinh-cam`, `co-trang`).

---

### 2.6. Lọc Phim theo Quốc Gia
* **URL:** `https://phimapi.com/v1/api/quoc-gia/{slug}?limit={limit}&page={page}`
* **Method:** `GET`
* **Tham số:**
  * `{slug}` (string): Tên quốc gia viết thường không dấu (Ví dụ: `trung-quoc`, `han-quoc`, `au-my`).

---

### 2.7. Lấy danh sách diễn viên (Cast) của phim
* **URL:** `https://ophim1.com/v1/api/phim/{slug}/peoples`
* **Method:** `GET`
* **Tham số:**
  * `{slug}` (string): Đường dẫn slug của phim.
