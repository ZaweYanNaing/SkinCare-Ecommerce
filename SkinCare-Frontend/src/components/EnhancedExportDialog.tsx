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
import { Download, FileText, File, BarChart3 } from 'lucide-react';
import { exportComprehensiveCSV, exportOverviewData, type ExportData, ExportFormat } from '@/utils/exportUtils';
import { exportAdvancedPDF, downloadAdvancedPDF } from '@/utils/advancedPdfExport';
import { downloadPDFWithCharts } from '@/utils/pdfWithCharts';

interface EnhancedExportDialogProps {
  disabled?: boolean;
  exportEndpoint?: string;
  filename?: string;
}

export function EnhancedExportDialog({ 
  disabled = false, 
  exportEndpoint = 'http://localhost/admin/export-overview.php',
  filename = 'skincare-overview-report'
}: EnhancedExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.PDF);
  const [csvFormat, setCsvFormat] = useState<'single' | 'multiple'>('single');

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(exportEndpoint);
      const data = await response.json();
      
      if (data.success) {
        const exportData = data.data as ExportData;
        
        switch (exportFormat) {
          case ExportFormat.CSV:
            if (csvFormat === 'single') {
              exportComprehensiveCSV(exportData);
            } else {
              exportOverviewData(exportData);
            }
            break;
            
          case ExportFormat.PDF:
            const pdf = exportAdvancedPDF(exportData);
            downloadAdvancedPDF(pdf, filename);
            break;
            
          case ExportFormat.PDF_WITH_CHARTS:
            await downloadPDFWithCharts(exportData, filename);
            break;
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
          <DialogTitle>Export Overview Report</DialogTitle>
          <DialogDescription>
            Choose your preferred export format for the overview data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Export Format</h4>
            <div className="space-y-3">
              {/* PDF Options */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pdf"
                    name="format"
                    checked={exportFormat === ExportFormat.PDF}
                    onChange={() => setExportFormat(ExportFormat.PDF)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="pdf" className="text-sm flex items-center gap-2">
                    <File className="h-4 w-4 text-red-500" />
                    PDF Report (Tables & Statistics)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pdf_charts"
                    name="format"
                    checked={exportFormat === ExportFormat.PDF_WITH_CHARTS}
                    onChange={() => setExportFormat(ExportFormat.PDF_WITH_CHARTS)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="pdf_charts" className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    PDF Report with Charts (Recommended)
                  </label>
                </div>
              </div>
              
              {/* CSV Option */}
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="csv"
                  name="format"
                  checked={exportFormat === ExportFormat.CSV}
                  onChange={() => setExportFormat(ExportFormat.CSV)}
                  className="h-4 w-4"
                />
                <label htmlFor="csv" className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  CSV Data Files
                </label>
              </div>
            </div>
          </div>

          {/* CSV Sub-options */}
          {exportFormat === ExportFormat.CSV && (
            <div className="space-y-3 pl-6 border-l-2 border-gray-200">
              <h5 className="text-sm font-medium text-gray-600">CSV Format</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="single_csv"
                    name="csv_format"
                    checked={csvFormat === 'single'}
                    onChange={() => setCsvFormat('single')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="single_csv" className="text-sm">
                    Single comprehensive CSV file
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="multiple_csv"
                    name="csv_format"
                    checked={csvFormat === 'multiple'}
                    onChange={() => setCsvFormat('multiple')}
                    className="h-4 w-4"
                  />
                  <label htmlFor="multiple_csv" className="text-sm">
                    Multiple CSV files (one per data type)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Format descriptions */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            {exportFormat === ExportFormat.PDF && (
              <div>
                <strong>PDF Report:</strong> Professional formatted report with tables, statistics, and business insights. Perfect for presentations and sharing.
              </div>
            )}
            {exportFormat === ExportFormat.PDF_WITH_CHARTS && (
              <div>
                <strong>PDF with Charts:</strong> Complete report including visual charts and graphs from your dashboard. Best for comprehensive analysis.
              </div>
            )}
            {exportFormat === ExportFormat.CSV && (
              <div>
                <strong>CSV Data:</strong> Raw data in spreadsheet format. Ideal for further analysis in Excel or other data tools.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting 
              ? (exportFormat === ExportFormat.PDF_WITH_CHARTS ? 'Capturing Charts...' : 'Generating...') 
              : 'Export Report'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}