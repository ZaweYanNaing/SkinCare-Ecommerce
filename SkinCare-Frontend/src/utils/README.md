# Export Utilities

This directory contains utilities for exporting overview data in various formats.

## Files

### `exportUtils.ts`
- CSV export functionality
- Data formatting and download utilities
- Support for single and multiple CSV files

### `pdfExportUtils.ts`
- PDF export functionality using jsPDF
- Professional report generation with tables and charts
- Support for multi-page reports with proper formatting

## PDF Export Features

### Basic PDF Export
- Professional formatted report
- Overview statistics table
- Sales by category data
- Top products performance
- Recent orders summary
- Monthly sales trends
- Automatic page breaks and pagination
- Consistent styling and branding

### PDF with Charts Export
- All basic PDF features
- Includes visual charts from the dashboard
- Chart capture using html2canvas
- Enhanced visual presentation

## Usage Examples

```typescript
import { exportOverviewToPDF, downloadPDF } from '@/utils/pdfExportUtils';
import { exportComprehensiveCSV } from '@/utils/exportUtils';

// Export PDF
const pdf = await exportOverviewToPDF(data);
downloadPDF(pdf, 'report-name');

// Export CSV
exportComprehensiveCSV(data);
```

## Dependencies

- `jspdf`: PDF generation
- `jspdf-autotable`: Table formatting in PDFs
- `html2canvas`: Chart capture for PDF inclusion

## Data Structure

The export utilities expect data in the following format:

```typescript
interface ExportData {
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
```

## PDF Styling

The PDF reports use:
- Professional color scheme
- Consistent fonts (Helvetica)
- Proper spacing and margins
- Color-coded section headers
- Responsive table layouts
- Page numbering and footers