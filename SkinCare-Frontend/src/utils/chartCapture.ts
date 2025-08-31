import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { debugChartElements, waitForRechartsToRender } from './debugCharts';
import { fixOklchColors } from './colorFix';

export interface ChartCapture {
  element: HTMLElement;
  title: string;
  canvas: HTMLCanvasElement;
  imgData: string;
}

export const captureCharts = async (): Promise<ChartCapture[]> => {
  console.log('Starting chart capture process...');
  
  // Wait for Recharts to fully render
  await waitForRechartsToRender(5000);
  
  // Debug chart elements
  debugChartElements();
  
  const chartElements = document.querySelectorAll('[data-chart]');
  const captures: ChartCapture[] = [];
  
  console.log(`Found ${chartElements.length} chart elements to capture`);
  
  for (const element of chartElements) {
    if (element instanceof HTMLElement) {
      try {
        // Get the chart title from the element or data attribute
        const title = element.getAttribute('data-chart') || 'Chart';
        
        console.log(`Capturing chart: ${title}`);
        
        // Check if element is visible and has content
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn(`Skipping invisible chart: ${title}`);
          continue;
        }
        
        // Fix oklch color issues before capture
        const restoreColors = fixOklchColors(element);
        
        try {
          // Capture the chart element with simpler options
          const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 1.2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: element.offsetWidth,
            height: element.offsetHeight,
          });
          
          const imgData = canvas.toDataURL('image/png', 0.9);
          
          console.log(`Successfully captured chart: ${title} (${canvas.width}x${canvas.height})`);
          
          captures.push({
            element,
            title,
            canvas,
            imgData
          });
        } finally {
          // Always restore original colors
          restoreColors();
        }

      } catch (error) {
        console.error(`Failed to capture chart: ${element.getAttribute('data-chart')}`, error);
      }
    }
  }
  
  console.log(`Chart capture complete. Captured ${captures.length} charts.`);
  return captures;
};

export const addChartsToPDF = (pdf: jsPDF, charts: ChartCapture[]) => {
  if (charts.length === 0) return;
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  
  // Add a new page for charts
  pdf.addPage();
  let yPosition = margin;
  
  // Add charts section title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dashboard Charts', margin, yPosition);
  yPosition += 15;
  
  charts.forEach((chart, index) => {
    // Calculate image dimensions
    const imgWidth = Math.min(maxWidth, chart.canvas.width * 0.3);
    const imgHeight = (chart.canvas.height * imgWidth) / chart.canvas.width;
    
    // Check if we need a new page
    if (yPosition + imgHeight + 30 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Add chart title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const chartTitle = formatChartTitle(chart.title);
    pdf.text(chartTitle, margin, yPosition);
    yPosition += 10;
    
    // Add the chart image
    try {
      pdf.addImage(chart.imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 20;
    } catch (error) {
      console.warn('Failed to add chart to PDF:', error);
      // Add error message instead
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Chart could not be rendered', margin, yPosition);
      yPosition += 20;
    }
  });
};

const formatChartTitle = (title: string): string => {
  switch (title) {
    case 'sales-by-category':
      return 'Sales by Category Chart';
    case 'top-products':
      return 'Top Products Performance';
    default:
      return title.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

export const waitForChartsToLoad = (timeout: number = 3000): Promise<void> => {
  return new Promise((resolve) => {
    // Wait for charts to fully render
    const checkCharts = () => {
      const chartElements = document.querySelectorAll('[data-chart]');
      let allLoaded = true;
      
      chartElements.forEach(element => {
        if (element instanceof HTMLElement) {
          // Check if the chart has content (not just loading state)
          const hasContent = element.querySelector('svg, canvas, .recharts-wrapper');
          if (!hasContent) {
            allLoaded = false;
          }
        }
      });
      
      if (allLoaded || timeout <= 0) {
        resolve();
      } else {
        setTimeout(checkCharts, 100);
        timeout -= 100;
      }
    };
    
    checkCharts();
  });
};