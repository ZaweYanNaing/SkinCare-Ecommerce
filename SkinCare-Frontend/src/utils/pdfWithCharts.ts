import { jsPDF } from 'jspdf';
import { exportAdvancedPDF } from './advancedPdfExport';
import { captureCharts, addChartsToPDF, waitForChartsToLoad } from './chartCapture';
import { captureChartsWithDomToImage, addChartsToPDF as addChartsWithDomToImage } from './alternativeChartCapture';
import type { ExportData } from './exportUtils';

export const exportPDFWithCharts = async (data: ExportData): Promise<jsPDF> => {
  try {
    // First, wait for charts to fully load
    await waitForChartsToLoad(5000);
    
    // Create the basic PDF with tables
    const pdf = exportAdvancedPDF(data);
    
    console.log('Attempting chart capture with dom-to-image (better CSS support)...');
    
    // Try dom-to-image first (better CSS support)
    let charts = await captureChartsWithDomToImage();
    
    if (charts.length === 0) {
      console.log('dom-to-image failed, trying html2canvas...');
      // Fallback to html2canvas
      const html2canvasCharts = await captureCharts();
      
      if (html2canvasCharts.length > 0) {
        // Convert html2canvas format to dom-to-image format
        charts = html2canvasCharts.map(chart => ({
          element: chart.element,
          title: chart.title,
          dataUrl: chart.imgData,
          width: chart.canvas.width,
          height: chart.canvas.height
        }));
      }
    }
    
    if (charts.length > 0) {
      // Add charts to the PDF
      addChartsWithDomToImage(pdf, charts);
      
      console.log(`Successfully captured ${charts.length} charts for PDF`);
    } else {
      console.warn('No charts found to capture with either method');
      
      // Add a note about missing charts
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Charts Section', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Charts could not be captured at this time.', 20, 50);
      pdf.text('This may be due to charts still loading or rendering issues.', 20, 65);
      pdf.text('Please try again after ensuring all charts are fully loaded.', 20, 80);
    }
    
    return pdf;
  } catch (error) {
    console.error('Error creating PDF with charts:', error);
    
    // Fallback to basic PDF
    const pdf = exportAdvancedPDF(data);
    
    // Add error page
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Charts Section - Error', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('An error occurred while capturing charts:', 20, 50);
    pdf.text(error instanceof Error ? error.message : 'Unknown error', 20, 65);
    
    return pdf;
  }
};

export const downloadPDFWithCharts = async (data: ExportData, filename: string) => {
  const pdf = await exportPDFWithCharts(data);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  pdf.save(`${filename}-with-charts-${timestamp}.pdf`);
};