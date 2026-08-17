import { useEffect } from 'react';

/**
 * Hook để khoá (ngăn cuộn) trang (body) khi một Modal/Popup được mở.
 * Cũng tự động trả lại vị trí focus cuối cùng sau khi đóng modal để đảm bảo Accessibility (a11y).
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    let lastActiveElement: HTMLElement | null = null;

    if (isLocked) {
      lastActiveElement = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      
      // Chờ một chút cho modal render xong để lấy element focusable đầu tiên
      const timer = setTimeout(() => {
        const modalContainer = document.querySelector('[data-modal-container]') as HTMLElement;
        if (modalContainer) {
          const firstFocusable = modalContainer.querySelector('button, [tabindex="0"]') as HTMLElement;
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }
      }, 150);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
        document.body.style.overscrollBehavior = 'auto';
        if (lastActiveElement) {
          lastActiveElement.focus();
        }
      };
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.overscrollBehavior = 'auto';
    };
  }, [isLocked]);
}
