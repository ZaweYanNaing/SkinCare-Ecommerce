import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExportData } from './exportUtils';

export const exportAdvancedPDF = (data: ExportData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Helper function to add section title
  const addSectionTitle = (title: string, fontSize: number = 14) => {
    checkPageBreak(15);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 20, yPosition);
    yPosition += 10;
  };

  // Add header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Skincare Business Overview Report', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, yPosition);
  yPosition += 15;

  // Add overview statistics
  addSectionTitle('Overview Statistics', 16);
  
  const overviewData = [
    ['Metric', 'Value'],
    ['Total Sales', `$${data.overview_stats.total_sales.toLocaleString()}`],
    ['Total Orders', data.overview_stats.total_orders.toString()],
    ['Best Selling Product', data.overview_stats.best_selling_product],
    ['Best Selling Quantity', data.overview_stats.best_selling_quantity.toString()],
    ['Active Customers (30 days)', data.overview_stats.active_customers.toString()],
  ];

  autoTable(pdf, {
    head: [overviewData[0]],
    body: overviewData.slice(1),
    startY: yPosition,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  // Get the final Y position after the table
  const finalY = (pdf as any).lastAutoTable?.finalY || yPosition + 50;
  yPosition = finalY + 15;

  // Add sales by category
  if (data.sales_by_category.length > 0) {
    checkPageBreak(60);
    addSectionTitle('Sales by Category');
    
    const categoryData = [
      ['Category', 'Quantity Sold', 'Revenue', 'Orders'],
      ...data.sales_by_category.map(item => [
        item.CategoryName,
        item.total_quantity.toString(),
        `$${item.total_sales.toLocaleString()}`,
        item.order_count.toString()
      ])
    ];

    autoTable(pdf, {
      head: [categoryData[0]],
      body: categoryData.slice(1),
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 },
    });

    yPosition = (pdf as any).lastAutoTable?.finalY + 15 || yPosition + 50;
  }

  // Add top products
  if (data.top_products.length > 0) {
    checkPageBreak(60);
    addSectionTitle('Top Performing Products');
    
    const productsData = [
      ['Product Name', 'Orders', 'Revenue', 'Avg Price', 'Stock'],
      ...data.top_products.slice(0, 10).map(item => [
        item.Name.length > 25 ? item.Name.substring(0, 25) + '...' : item.Name,
        item.total_orders.toString(),
        `$${item.total_revenue.toLocaleString()}`,
        `$${parseFloat(item.avg_price.toString()).toFixed(2)}`,
        item.current_stock.toString()
      ])
    ];

    autoTable(pdf, {
      head: [productsData[0]],
      body: productsData.slice(1),
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [46, 204, 113] },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 }
      }
    });

    yPosition = (pdf as any).lastAutoTable?.finalY + 15 || yPosition + 50;
  }

  // Add monthly sales trend
  if (data.monthly_sales_trend.length > 0) {
    checkPageBreak(40);
    addSectionTitle('Monthly Sales Trend (Last 6 Months)');
    
    const trendData = [
      ['Month', 'Sales', 'Orders'],
      ...data.monthly_sales_trend.map(item => [
        item.month,
        `$${item.monthly_sales.toLocaleString()}`,
        item.monthly_orders.toString()
      ])
    ];

    autoTable(pdf, {
      head: [trendData[0]],
      body: trendData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182] },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 },
    });

    yPosition = (pdf as any).lastAutoTable?.finalY + 15 || yPosition + 50;
  }

  // Add recent orders on new page
  if (data.recent_orders.length > 0) {
    pdf.addPage();
    yPosition = 20;
    addSectionTitle('Recent Orders (Last 20)', 16);
    
    const ordersData = [
      ['Order ID', 'Customer', 'Date', 'Status', 'Amount', 'Payment'],
      ...data.recent_orders.slice(0, 15).map(item => [
        item.OrderID.toString(),
        item.customer_name.length > 15 ? item.customer_name.substring(0, 15) + '...' : item.customer_name,
        new Date(item.orderDate).toLocaleDateString(),
        item.status,
        `$${item.payment_amount.toLocaleString()}`,
        item.paymentMethod
      ])
    ];

    autoTable(pdf, {
      head: [ordersData[0]],
      body: ordersData.slice(1),
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [231, 76, 60] },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      }
    });
  }

  // Add footer to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    pdf.text('Skincare Business Report', 20, pageHeight - 10);
  }

  return pdf;
};

export const downloadAdvancedPDF = (pdf: jsPDF, filename: string) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  pdf.save(`${filename}-${timestamp}.pdf`);
};