export const debugChartElements = () => {
  console.log('=== Chart Debug Information ===');
  
  const chartElements = document.querySelectorAll('[data-chart]');
  console.log(`Found ${chartElements.length} elements with data-chart attribute`);
  
  chartElements.forEach((element, index) => {
    if (element instanceof HTMLElement) {
      const chartType = element.getAttribute('data-chart');
      const rect = element.getBoundingClientRect();
      const hasContent = element.querySelector('svg, canvas, .recharts-wrapper, .recharts-surface');
      
      console.log(`Chart ${index + 1}:`, {
        type: chartType,
        dimensions: `${rect.width}x${rect.height}`,
        position: `${rect.left}, ${rect.top}`,
        visible: rect.width > 0 && rect.height > 0,
        hasContent: !!hasContent,
        contentType: hasContent?.tagName || 'none',
        innerHTML: element.innerHTML.substring(0, 200) + '...',
        element: element
      });
      
      // Check for Recharts specific elements
      const rechartsElements = element.querySelectorAll('.recharts-wrapper, .recharts-surface, svg');
      console.log(`  - Recharts elements found: ${rechartsElements.length}`);
      
      rechartsElements.forEach((rechartEl, i) => {
        const rechartRect = rechartEl.getBoundingClientRect();
        console.log(`    ${i + 1}. ${rechartEl.tagName}: ${rechartRect.width}x${rechartRect.height}`);
      });
      
      // Also check for any visual content that could be captured
      const allVisualElements = element.querySelectorAll('*');
      console.log(`  - Total child elements: ${allVisualElements.length}`);
    }
  });
  
  console.log('=== End Chart Debug ===');
};

export const waitForRechartsToRender = (timeout: number = 5000): Promise<void> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkCharts = () => {
      const chartElements = document.querySelectorAll('[data-chart]');
      let allReady = true;
      
      chartElements.forEach(element => {
        if (element instanceof HTMLElement) {
          const chartType = element.getAttribute('data-chart');
          
          // For actual chart components (with SVG), check for SVG content
          if (chartType === 'sales-by-category') {
            const svg = element.querySelector('svg');
            const rechartsWrapper = element.querySelector('.recharts-wrapper');
            
            if (!svg && !rechartsWrapper) {
              allReady = false;
              return;
            }
            
            // Check if SVG has actual content (not just empty)
            if (svg) {
              const rect = svg.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) {
                allReady = false;
                return;
              }
              
              // Check for actual chart elements inside SVG
              const chartContent = svg.querySelectorAll('rect, path, circle, line');
              if (chartContent.length === 0) {
                allReady = false;
                return;
              }
            }
          }
          // For table-based components (like top-products), just check if they have content
          else if (chartType === 'top-products') {
            const tableContent = element.querySelectorAll('.grid');
            if (tableContent.length < 2) { // Should have header + at least one row
              allReady = false;
              return;
            }
          }
        }
      });
      
      const elapsed = Date.now() - startTime;
      
      if (allReady) {
        console.log(`Charts ready after ${elapsed}ms`);
        resolve();
      } else if (elapsed >= timeout) {
        console.warn(`Chart loading timeout after ${elapsed}ms`);
        debugChartElements();
        resolve();
      } else {
        setTimeout(checkCharts, 100);
      }
    };
    
    checkCharts();
  });
};