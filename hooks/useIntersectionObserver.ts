import { useState, useEffect, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  ref: RefObject<HTMLElement | null>,
  options: UseIntersectionObserverOptions = { threshold: 0, rootMargin: '300px', triggerOnce: true }
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (options.triggerOnce) {
            observer.unobserve(target);
          }
        } else if (!options.triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        root: options.root,
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [ref, options.root, options.rootMargin, options.threshold, options.triggerOnce]);

  return isIntersecting;
}
