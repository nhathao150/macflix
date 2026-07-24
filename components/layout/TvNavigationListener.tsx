'use client';

import { useEffect, useRef } from 'react';

export default function TvNavigationListener() {
  const lastContentElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 0. Xử lý phím Back Remote TV (Escape, Back, GoBack, BrowserBack, keyCodes: 27, 8, 10009, 461)
      const isBackKey =
        e.key === 'Escape' ||
        e.key === 'Back' ||
        e.key === 'GoBack' ||
        e.key === 'BrowserBack' ||
        e.keyCode === 27 ||
        e.keyCode === 8 ||
        e.keyCode === 10009 ||
        e.keyCode === 461;

      if (isBackKey) {
        const modalContainer = document.querySelector('[data-modal-container]') as HTMLElement;
        if (modalContainer) {
          e.preventDefault();
          e.stopPropagation();
          const closeBtn = modalContainer.querySelector('button[aria-label="Close"], button[data-close-modal], button') as HTMLElement;
          closeBtn?.click();
          return;
        }
      }

      const isSelectKey = 
        e.key === 'Enter' || 
        e.key === ' ' || 
        e.key === 'Select' || 
        e.keyCode === 13 || 
        e.keyCode === 66 || 
        e.keyCode === 23;

      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (!keys.includes(e.key) && !isSelectKey) return;

      const active = document.activeElement as HTMLElement;

      // 1. Xử lý nút OK / Enter / Select cho thẻ có tabIndex={0}
      if (isSelectKey) {
        if (active && active.tabIndex === 0) {
          const tagName = active.tagName.toLowerCase();
          if (tagName !== 'button' && tagName !== 'a' && tagName !== 'input' && tagName !== 'textarea') {
            e.preventDefault();
            active.click();
          }
        }
        return;
      }

      // Quét các phần tử có thể nhận focus
      const modalContainer = document.querySelector('[data-modal-container]') as HTMLElement;
      const searchRoot = modalContainer || document;

      const focusables = Array.from(
        searchRoot.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [tabindex="0"]')
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || el.offsetWidth === 0 || el.offsetHeight === 0) {
          return false;
        }
        return true;
      });

      if (focusables.length === 0) return;

      // Nếu chưa có focus, gán focus vào phần tử đầu tiên
      if (!active || active === document.body || !focusables.includes(active)) {
        focusables[0].focus();
        e.preventDefault();
        return;
      }

      const currentZone = active.getAttribute('data-zone');
      const currentCol = parseInt(active.getAttribute('data-col') || '-1', 10);

      // Lưu lại phần tử nội dung active trước đó (khi đang nằm ở Hero hoặc Row)
      if (currentZone === 'hero' || currentZone === 'row') {
        lastContentElementRef.current = active;
      }

      // === FOCUS ZONE MEMORY & D-PAD RULE ===
      // A. Nhảy từ Sidebar (Zone 1) sang Nội dung (Zone 2/3) khi bấm ArrowRight
      if (currentZone === 'sidebar' && e.key === 'ArrowRight') {
        e.preventDefault();
        const remembered = lastContentElementRef.current;
        if (remembered && document.body.contains(remembered) && focusables.includes(remembered)) {
          remembered.focus();
          remembered.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          return;
        }

        // Nếu không có phần tử ghi nhớ, tìm phần tử đầu tiên ở Hero hoặc Row
        const targetContent = focusables.find((el) => {
          const z = el.getAttribute('data-zone');
          return z === 'hero' || z === 'row';
        });

        if (targetContent) {
          targetContent.focus();
          targetContent.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          return;
        }
      }

      // B. Nhảy từ Nội dung (Hero/Row) sang Sidebar khi bấm ArrowLeft ở thẻ đầu tiên (data-col === 0)
      if ((currentZone === 'hero' || currentZone === 'row') && e.key === 'ArrowLeft' && currentCol === 0) {
        e.preventDefault();
        const sidebarTarget = focusables.find((el) => el.getAttribute('data-zone') === 'sidebar');
        if (sidebarTarget) {
          sidebarTarget.focus();
          sidebarTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          return;
        }
      }

      // === SPATIAL NAVIGATION THEO TỌA ĐỘ HÌNH HỌC (X, Y) ===
      const activeRect = active.getBoundingClientRect();
      const activeCenterX = activeRect.left + activeRect.width / 2;
      const activeCenterY = activeRect.top + activeRect.height / 2;

      let nextElement: HTMLElement | null = null;
      let minDistance = Infinity;
      const tolerance = 5;

      focusables.forEach((el) => {
        if (el === active) return;

        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;

        let isCandidate = false;
        let distance = 0;

        const isSameRow = (rect.top < activeRect.bottom - 5 && rect.bottom > activeRect.top + 5) ||
                          Math.abs(elCenterY - activeCenterY) < 50;

        if (e.key === 'ArrowRight' && rect.left >= activeRect.right - tolerance) {
          isCandidate = true;
          const verticalPenalty = isSameRow ? 10 : 1000000;
          distance = Math.pow(elCenterX - activeCenterX, 2) + Math.pow(elCenterY - activeCenterY, 2) * verticalPenalty;
        } else if (e.key === 'ArrowLeft' && rect.right <= activeRect.left + tolerance) {
          isCandidate = true;
          const verticalPenalty = isSameRow ? 10 : 1000000;
          distance = Math.pow(elCenterX - activeCenterX, 2) + Math.pow(elCenterY - activeCenterY, 2) * verticalPenalty;
        } else if (e.key === 'ArrowDown' && rect.top >= activeRect.bottom - tolerance) {
          isCandidate = true;
          distance = Math.pow(elCenterX - activeCenterX, 2) * 5 + Math.pow(rect.top - activeRect.bottom, 2);
        } else if (e.key === 'ArrowUp' && rect.bottom <= activeRect.top + tolerance) {
          isCandidate = true;
          distance = Math.pow(elCenterX - activeCenterX, 2) * 5 + Math.pow(activeRect.top - rect.bottom, 2);
        }

        if (isCandidate && distance < minDistance) {
          minDistance = distance;
          nextElement = el;
        }
      });

      if (nextElement) {
        e.preventDefault();
        (nextElement as HTMLElement).focus();
        (nextElement as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
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
