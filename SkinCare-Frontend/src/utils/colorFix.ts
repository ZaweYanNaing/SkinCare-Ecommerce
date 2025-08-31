// Utility to fix oklch color issues for html2canvas
export const fixOklchColors = (element: HTMLElement): () => void => {
  const originalStyles = new Map<Element, string>();
  
  // Find all elements with potentially problematic colors
  const allElements = element.querySelectorAll('*');
  
  allElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      const computedStyle = window.getComputedStyle(el);
      let needsFixing = false;
      let newStyle = '';
      
      // Check for oklch colors in various properties
      const properties = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];
      
      properties.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value.includes('oklch')) {
          needsFixing = true;
          // Convert oklch to a safe fallback color
          if (prop === 'color' || prop === 'fill') {
            newStyle += `${prop}: rgb(0, 0, 0) !important; `;
          } else if (prop === 'backgroundColor') {
            newStyle += `${prop}: transparent !important; `;
          } else if (prop === 'borderColor' || prop === 'stroke') {
            newStyle += `${prop}: rgb(200, 200, 200) !important; `;
          }
        }
      });
      
      if (needsFixing) {
        originalStyles.set(el, el.style.cssText);
        el.style.cssText += newStyle;
      }
    }
  });
  
  // Return cleanup function
  return () => {
    originalStyles.forEach((originalStyle, el) => {
      if (el instanceof HTMLElement) {
        el.style.cssText = originalStyle;
      }
    });
  };
};