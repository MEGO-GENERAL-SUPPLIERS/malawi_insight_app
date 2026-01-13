export const setupKeyboardScrollFix = () => {
  if(typeof window === 'undefined' || !('visualViewport' in window)) return;

  let initialViewportHeight: number | null = window.visualViewport?.height || window.innerHeight;

  const handleSize = () => {
    const currentViewportHeight = window.visualViewport?.height || 0;
    const keyboardHeight = initialViewportHeight - currentViewportHeight;

    if (keyboardHeight > 80) {
      const activeElement = document.activeElement;
      if(activeElement && activeElement instanceof HTMLElement) {
        const rect = activeElement.getBoundingClientRect();
        const offsetTop = rect.top + window.scrollY;
        const scrollMargin = 20;

        if(rect.bottom > currentViewportHeight){
          window.scrollTo({
            top: offsetTop - scrollMargin,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  window.visualViewport?.addEventListener('resize', handleSize);

  return () => {
    window.visualViewport?.removeEventListener('resize', handleSize);
  };
};