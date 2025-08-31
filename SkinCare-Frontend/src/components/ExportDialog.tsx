import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, FileText, Table } from 'lucide-react';
import { exportComprehensiveCSV, exportOverviewData, type ExportData } from '@/utils/exportUtils';

interface ExportDialogProps {
  disabled?: boolean;
}

export function ExportDialog({ disabled = false }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    overviewStats: true,
    salesByCategory: true,
    topProducts: true,
    recentOrders: true,
    monthlySalesTrend: true,
  });
  const [exportFormat, setExportFormat] = useState<'single' | 'multiple'>('single');

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('http://localhost/admin/export-overview.php');
      const data = await response.json();
      
      if (data.success) {
        const exportData = data.data as ExportData;
        
        // Filter data based on selected options
        const filteredData: ExportData = {
          overview_stats: exportOptions.overviewStats ? exportData.overview_stats : {} as any,
          sales_by_category: exportOptions.salesByCategory ? exportData.sales_by_category : [],
          top_products: exportOptions.topProducts ? exportData.top_products : [],
          recent_orders: exportOptions.recentOrders ? exportData.recent_orders : [],
          monthly_sales_trend: exportOptions.monthlySalesTrend ? exportData.monthly_sales_trend : [],
        };
        
        if (exportFormat === 'single') {
          exportComprehensiveCSV(filteredData);
        } else {
          exportOverviewData(filteredData);
        }
        
        setOpen(false);
      } else {
        console.error('Export failed:', data.message);
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Export failed. Please check your connection and try again.');
    } finally {
      setExporting(false);
    }
  };

  const toggleOption = (option: keyof typeof exportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const selectAll = () => {
    const allSelected = Object.values(exportOptions).every(Boolean);
    const newValue = !allSelected;
    setExportOptions({
      overviewStats: newValue,
      salesByCategory: newValue,
      topProducts: newValue,
      recentOrders: newValue,
      monthlySalesTrend: newValue,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Download />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Overview Data</DialogTitle>
          <DialogDescription>
            Choose what data to export and in which format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Export Format</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="single"
                  name="format"
                  checked={exportFormat === 'single'}
                  onChange={() => setExportFormat('single')}
                  className="h-4 w-4"
                />
                <label htmlFor="single" className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Single comprehensive CSV file
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="multiple"
                  name="format"
                  checked={exportFormat === 'multiple'}
                  onChange={() => setExportFormat('multiple')}
                  className="h-4 w-4"
                />
                <label htmlFor="multiple" className="text-sm flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Multiple CSV files (one per data type)
                </label>
              </div>
            </div>
          </div>

          {/* Data Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Data to Export</h4>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {Object.values(exportOptions).every(Boolean) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="overviewStats"
                  checked={exportOptions.overviewStats}
                  onChange={() => toggleOption('overviewStats')}
                  className="h-4 w-4"
                />
                <label htmlFor="overviewStats" className="text-sm">
                  Overview Statistics (Total Sales, Orders, etc.)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="salesByCategory"
                  checked={exportOptions.salesByCategory}
                  onChange={() => toggleOption('salesByCategory')}
                  className="h-4 w-4"
                />
                <label htmlFor="salesByCategory" className="text-sm">
                  Sales by Category
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="topProducts"
                  checked={exportOptions.topProducts}
                  onChange={() => toggleOption('topProducts')}
                  className="h-4 w-4"
                />
                <label htmlFor="topProducts" className="text-sm">
                  Top Products Performance
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recentOrders"
                  checked={exportOptions.recentOrders}
                  onChange={() => toggleOption('recentOrders')}
                  className="h-4 w-4"
                />
                <label htmlFor="recentOrders" className="text-sm">
                  Recent Orders (Last 20)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="monthlySalesTrend"
                  checked={exportOptions.monthlySalesTrend}
                  onChange={() => toggleOption('monthlySalesTrend')}
                  className="h-4 w-4"
                />
                <label htmlFor="monthlySalesTrend" className="text-sm">
                  Monthly Sales Trend (Last 6 months)
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={exporting || !Object.values(exportOptions).some(Boolean)}
          >
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}