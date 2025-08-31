import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';
import { debugChartElements, waitForRechartsToRender } from './debugCharts';

export interface ChartCapture {
  element: HTMLElement;
  title: string;
  dataUrl: string;
  width: number;
  height: number;
}

export const captureChartsWithDomToImage = async (): Promise<ChartCapture[]> => {
  console.log('Starting chart capture with dom-to-image...');
  
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
        const title = element.getAttribute('data-chart') || 'Chart';
        
        console.log(`Capturing chart with dom-to-image: ${title}`);
        
        // Check if element is visible and has content
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn(`Skipping invisible chart: ${title}`);
          continue;
        }
        
        // Use dom-to-image which handles modern CSS better
        const dataUrl = await domtoimage.toPng(element, {
          quality: 0.9,
          bgcolor: '#ffffff',
          width: element.offsetWidth,
          height: element.offsetHeight,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        });
        
        console.log(`Successfully captured chart with dom-to-image: ${title}`);
        
        captures.push({
          element,
          title,
          dataUrl,
          width: element.offsetWidth,
          height: element.offsetHeight
        });
      } catch (error) {
        console.error(`Failed to capture chart with dom-to-image: ${element.getAttribute('data-chart')}`, error);
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
    const imgWidth = Math.min(maxWidth, chart.width * 0.4);
    const imgHeight = (chart.height * imgWidth) / chart.width;
    
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
      pdf.addImage(chart.dataUrl, 'PNG', margin, yPosition, imgWidth, imgHeight);
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