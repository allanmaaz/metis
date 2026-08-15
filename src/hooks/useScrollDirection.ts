import { useState, useEffect } from 'react';

/**
 * Tracks scroll direction with thresholding for smooth bottom navigation collapse/expand
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [prevOffset, setPrevOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentOffset = window.pageYOffset || document.documentElement.scrollTop;
          const diff = currentOffset - prevOffset;

          // Threshold of 10px to prevent jitter
          if (Math.abs(diff) > 8) {
            if (diff > 0 && currentOffset > 60) {
              setScrollDirection('down');
            } else if (diff < 0) {
              setScrollDirection('up');
            }
            setPrevOffset(currentOffset);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevOffset]);

  return scrollDirection;
}
