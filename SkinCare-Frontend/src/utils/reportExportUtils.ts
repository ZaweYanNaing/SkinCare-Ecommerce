// Utility functions for report data export

export interface ReportExportData {
  monthly_sales: Array<{
    month: string;
    yearMonth: string;
    sales: number;
    orders: number;
  }>;
  daily_finance: Array<{
    day: string;
    fullDate: string;
    value: number;
  }>;
  top_customers: Array<{
    rank_no: number;
    customer: string;
    total_amount: number;
    orders: number;
    last_purchase: string;
  }>;
  export_date: string;
  report_period: string;
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
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export comprehensive report CSV
export const exportReportCSV = (data: ReportExportData): void => {
  let csvContent = `Report Data Export\nGenerated: ${data.export_date}\nPeriod: ${data.report_period}\n\n`;
  
  // Monthly Sales Section
  csvContent += 'MONTHLY SALES REPORT\n';
  csvContent += arrayToCSV(data.monthly_sales, ['month', 'yearMonth', 'sales', 'orders']);
  csvContent += '\n\n';
  
  // Daily Finance Section
  csvContent += 'DAILY FINANCE REPORT\n';
  csvContent += arrayToCSV(data.daily_finance, ['day', 'fullDate', 'value']);
  csvContent += '\n\n';
  
  // Top Customers Section
  csvContent += 'TOP CUSTOMERS REPORT\n';
  csvContent += arrayToCSV(data.top_customers, ['rank_no', 'customer', 'total_amount', 'orders', 'last_purchase']);
  
  const filename = `report_data_${new Date().toISOString().split('T')[0]}`;
  downloadCSV(csvContent, filename);
};

// Export separate CSV files
export const exportReportDataSeparate = (data: ReportExportData): void => {
  const dateStr = new Date().toISOString().split('T')[0];
  
  // Monthly Sales CSV
  const monthlySalesCSV = arrayToCSV(data.monthly_sales, ['month', 'yearMonth', 'sales', 'orders']);
  downloadCSV(monthlySalesCSV, `monthly_sales_${dateStr}`);
  
  // Daily Finance CSV
  const dailyFinanceCSV = arrayToCSV(data.daily_finance, ['day', 'fullDate', 'value']);
  downloadCSV(dailyFinanceCSV, `daily_finance_${dateStr}`);
  
  // Top Customers CSV
  const topCustomersCSV = arrayToCSV(data.top_customers, ['rank_no', 'customer', 'total_amount', 'orders', 'last_purchase']);
  downloadCSV(topCustomersCSV, `top_customers_${dateStr}`);
};

export enum ReportExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  PDF_WITH_CHARTS = 'pdf_with_charts'
}