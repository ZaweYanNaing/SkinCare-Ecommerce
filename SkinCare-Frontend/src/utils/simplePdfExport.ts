import { jsPDF } from 'jspdf';
import type { ExportData } from './exportUtils';

export const exportSimplePDF = (data: ExportData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 20;

  // Add header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Skincare Business Overview Report', 20, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, yPosition);
  yPosition += 20;

  // Add overview statistics
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overview Statistics', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const stats = [
    `Total Sales: $${data.overview_stats.total_sales.toLocaleString()}`,
    `Total Orders: ${data.overview_stats.total_orders}`,
    `Best Selling Product: ${data.overview_stats.best_selling_product}`,
    `Best Selling Quantity: ${data.overview_stats.best_selling_quantity}`,
    `Active Customers: ${data.overview_stats.active_customers}`,
  ];

  stats.forEach(stat => {
    pdf.text(stat, 20, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Add sales by category
  if (data.sales_by_category.length > 0) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sales by Category', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    data.sales_by_category.forEach(category => {
      const categoryText = `${category.CategoryName}: ${category.total_quantity} units, $${category.total_sales.toLocaleString()} revenue`;
      pdf.text(categoryText, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 10;
  }

  // Add top products
  if (data.top_products.length > 0) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Products', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    data.top_products.slice(0, 5).forEach((product, index) => {
      const productText = `${index + 1}. ${product.Name}: ${product.total_orders} orders, $${product.total_revenue.toLocaleString()} revenue`;
      pdf.text(productText, 20, yPosition);
      yPosition += 8;
    });
  }

  return pdf;
};

export const downloadSimplePDF = (pdf: jsPDF, filename: string) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  pdf.save(`${filename}-${timestamp}.pdf`);
};