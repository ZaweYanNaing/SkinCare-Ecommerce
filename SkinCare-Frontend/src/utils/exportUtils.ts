// Utility functions for data export

export interface ExportData {
  overview_stats: {
    total_sales: number;
    total_orders: number;
    best_selling_product: string;
    best_selling_quantity: number;
    active_customers: number;
    export_date: string;
  };
  sales_by_category: Array<{
    CategoryName: string;
    total_quantity: number;
    total_sales: number;
    order_count: number;
  }>;
  top_products: Array<{
    Name: string;
    total_orders: number;
    total_revenue: number;
    avg_price: number;
    current_stock: number;
  }>;
  recent_orders: Array<{
    OrderID: number;
    customer_name: string;
    orderDate: string;
    status: string;
    payment_amount: number;
    paymentMethod: string;
  }>;
  monthly_sales_trend: Array<{
    month: string;
    monthly_sales: number;
    monthly_orders: number;
  }>;
}

// Convert array of objects to CSV string
export const arrayToCSV = (data: any[], headers: string[]): string => {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes in CSV
      return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Export overview data to multiple CSV files in a ZIP-like structure
export const exportOverviewData = (data: ExportData): void => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  
  // Overview Statistics
  const overviewStats = [data.overview_stats];
  const overviewCSV = arrayToCSV(overviewStats, [
    'total_sales', 'total_orders', 'best_selling_product', 
    'best_selling_quantity', 'active_customers', 'export_date'
  ]);
  downloadCSV(overviewCSV, `overview-stats-${timestamp}.csv`);
  
  // Sales by Category
  if (data.sales_by_category.length > 0) {
    const categoryCSV = arrayToCSV(data.sales_by_category, [
      'CategoryName', 'total_quantity', 'total_sales', 'order_count'
    ]);
    downloadCSV(categoryCSV, `sales-by-category-${timestamp}.csv`);
  }
  
  // Top Products
  if (data.top_products.length > 0) {
    const productsCSV = arrayToCSV(data.top_products, [
      'Name', 'total_orders', 'total_revenue', 'avg_price', 'current_stock'
    ]);
    downloadCSV(productsCSV, `top-products-${timestamp}.csv`);
  }
  
  // Recent Orders
  if (data.recent_orders.length > 0) {
    const ordersCSV = arrayToCSV(data.recent_orders, [
      'OrderID', 'customer_name', 'orderDate', 'status', 'payment_amount', 'paymentMethod'
    ]);
    downloadCSV(ordersCSV, `recent-orders-${timestamp}.csv`);
  }
  
  // Monthly Sales Trend
  if (data.monthly_sales_trend.length > 0) {
    const trendCSV = arrayToCSV(data.monthly_sales_trend, [
      'month', 'monthly_sales', 'monthly_orders'
    ]);
    downloadCSV(trendCSV, `monthly-sales-trend-${timestamp}.csv`);
  }
};

// Export single comprehensive CSV with all data
export const exportComprehensiveCSV = (data: ExportData): void => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  
  let csvContent = '';
  
  // Add Overview Statistics
  csvContent += 'OVERVIEW STATISTICS\n';
  csvContent += arrayToCSV([data.overview_stats], [
    'total_sales', 'total_orders', 'best_selling_product', 
    'best_selling_quantity', 'active_customers', 'export_date'
  ]);
  csvContent += '\n\n';
  
  // Add Sales by Category
  csvContent += 'SALES BY CATEGORY\n';
  csvContent += arrayToCSV(data.sales_by_category, [
    'CategoryName', 'total_quantity', 'total_sales', 'order_count'
  ]);
  csvContent += '\n\n';
  
  // Add Top Products
  csvContent += 'TOP PRODUCTS\n';
  csvContent += arrayToCSV(data.top_products, [
    'Name', 'total_orders', 'total_revenue', 'avg_price', 'current_stock'
  ]);
  csvContent += '\n\n';
  
  // Add Recent Orders
  csvContent += 'RECENT ORDERS\n';
  csvContent += arrayToCSV(data.recent_orders, [
    'OrderID', 'customer_name', 'orderDate', 'status', 'payment_amount', 'paymentMethod'
  ]);
  csvContent += '\n\n';
  
  // Add Monthly Sales Trend
  csvContent += 'MONTHLY SALES TREND\n';
  csvContent += arrayToCSV(data.monthly_sales_trend, [
    'month', 'monthly_sales', 'monthly_orders'
  ]);
  
  downloadCSV(csvContent, `skincare-overview-report-${timestamp}.csv`);
};

// Export formats enum
export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  PDF_WITH_CHARTS = 'pdf_with_charts'
}