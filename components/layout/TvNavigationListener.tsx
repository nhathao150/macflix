'use client';

import { useEffect } from 'react';

export default function TvNavigationListener() {
  useEffect(() => {
    // Chỉ kích hoạt trên môi trường Client
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
      if (!keys.includes(e.key)) return;

      const active = document.activeElement as HTMLElement;

      // 1. Xử lý nút Enter cho các thẻ không phải button/link mặc định nhưng có tabIndex
      if (e.key === 'Enter') {
        if (active && active.tabIndex === 0) {
          const tagName = active.tagName.toLowerCase();
          if (tagName !== 'button' && tagName !== 'a' && tagName !== 'input' && tagName !== 'textarea') {
            e.preventDefault();
            active.click();
          }
        }
        return;
      }

      // 2. Tìm tất cả các phần tử có thể nhận focus trên trang
      // Nếu có modal đang mở (có data-modal-container), chỉ quét các phần tử bên trong modal đó
      const modalContainer = document.querySelector('[data-modal-container]') as HTMLElement;
      const searchRoot = modalContainer || document;

      const focusables = Array.from(
        searchRoot.querySelectorAll('button, a, input, select, textarea, [tabindex="0"]')
      ).filter((el) => {
        const htmlEl = el as HTMLElement;
        // Bỏ qua các phần tử bị ẩn hoặc không thể tương tác
        const style = window.getComputedStyle(htmlEl);
        if (style.display === 'none' || style.visibility === 'hidden' || htmlEl.offsetWidth === 0 || htmlEl.offsetHeight === 0) {
          return false;
        }
        return true;
      }) as HTMLElement[];

      if (focusables.length === 0) return;

      // 3. Nếu chưa có phần tử nào đang focus, hoặc phần tử đang focus nằm ngoài vùng tìm kiếm hiện tại (ví dụ: khi modal vừa mở)
      if (!active || active === document.body || !focusables.includes(active)) {
        if (focusables.length > 0) {
          focusables[0].focus();
          e.preventDefault();
        }
        return;
      }

      const activeRect = active.getBoundingClientRect();
      const activeCenterX = activeRect.left + activeRect.width / 2;
      const activeCenterY = activeRect.top + activeRect.height / 2;

      let nextElement: HTMLElement | null = null;
      let minDistance = Infinity;
      const tolerance = 5; // Độ sai số tọa độ nhỏ để xử lý lệch mép nhẹ

      focusables.forEach((el) => {
        if (el === active) return;

        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;

        let isCandidate = false;
        let distance = 0;

        // Xác định xem phần tử này có nằm cùng hàng ngang với phần tử đang active không
        const isSameRow = (rect.top < activeRect.bottom - 5 && rect.bottom > activeRect.top + 5) || 
                          Math.abs(elCenterY - activeCenterY) < 50;

        // Xác định góc/hướng dựa trên phím bấm
        if (e.key === 'ArrowRight' && rect.left >= activeRect.right - tolerance) {
          isCandidate = true;
          // Phạt lệch trục Y cực nặng nếu không cùng hàng để ngăn việc nhảy hàng xiên xẹo
          const verticalPenalty = isSameRow ? 10 : 1000000;
          distance = Math.pow(elCenterX - activeCenterX, 2) + Math.pow(elCenterY - activeCenterY, 2) * verticalPenalty;
        } else if (e.key === 'ArrowLeft' && rect.right <= activeRect.left + tolerance) {
          isCandidate = true;
          const verticalPenalty = isSameRow ? 10 : 1000000;
          distance = Math.pow(elCenterX - activeCenterX, 2) + Math.pow(elCenterY - activeCenterY, 2) * verticalPenalty;
        } else if (e.key === 'ArrowDown' && rect.top >= activeRect.bottom - tolerance) {
          isCandidate = true;
          // Phạt lệch trục X để ưu tiên phần tử thẳng đứng bên dưới
          distance = Math.pow(elCenterX - activeCenterX, 2) * 5 + Math.pow(rect.top - activeRect.bottom, 2);
        } else if (e.key === 'ArrowUp' && rect.bottom <= activeRect.top + tolerance) {
          isCandidate = true;
          // Phạt lệch trục X để ưu tiên phần tử thẳng đứng bên trên
          distance = Math.pow(elCenterX - activeCenterX, 2) * 5 + Math.pow(activeRect.top - rect.bottom, 2);
        }

        if (isCandidate && distance < minDistance) {
          minDistance = distance;
          nextElement = el;
        }
      });

      // 4. Nếu tìm thấy phần tử thích hợp tiếp theo, focus vào và scroll màn hình
      if (nextElement) {
        e.preventDefault();
        (nextElement as HTMLElement).focus();
        
        // Cuộn mượt màn hình sao cho phần tử đó nằm ở giữa
        (nextElement as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
