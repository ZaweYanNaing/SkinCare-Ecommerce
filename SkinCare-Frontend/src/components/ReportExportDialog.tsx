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
import { Download, FileText, File } from 'lucide-react';
import { exportReportCSV, exportReportDataSeparate, type ReportExportData, ReportExportFormat } from '@/utils/reportExportUtils';

interface ReportExportDialogProps {
  disabled?: boolean;
  exportEndpoint?: string;
  filename?: string;
}

export function ReportExportDialog({ 
  disabled = false, 
  exportEndpoint = 'http://localhost/admin/export-report.php',
  filename = 'report_data'
}: ReportExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ReportExportFormat>(ReportExportFormat.CSV);
  const [csvFormat, setCsvFormat] = useState<'single' | 'multiple'>('single');

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(exportEndpoint);
      const data = await response.json();
      
      if (data.success) {
        const exportData = data.data as ReportExportData;
        
        switch (exportFormat) {
          case ReportExportFormat.CSV:
            if (csvFormat === 'single') {
              exportReportCSV(exportData);
            } else {
              exportReportDataSeparate(exportData);
            }
            break;
            
          case ReportExportFormat.PDF:
            // TODO: Implement PDF export for reports
            alert('PDF export for reports coming soon!');
            break;
            
          case ReportExportFormat.PDF_WITH_CHARTS:
            // TODO: Implement PDF with charts export for reports
            alert('PDF with charts export for reports coming soon!');
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
          <DialogTitle>Export Report Data</DialogTitle>
          <DialogDescription>
            Choose your preferred export format for the report data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Export Format</label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setExportFormat(ReportExportFormat.CSV)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  exportFormat === ReportExportFormat.CSV
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">CSV Export</div>
                  <div className="text-sm text-gray-500">Spreadsheet-compatible format</div>
                </div>
              </button>
              
              <button
                onClick={() => setExportFormat(ReportExportFormat.PDF)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  exportFormat === ReportExportFormat.PDF
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <File className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">PDF Report</div>
                  <div className="text-sm text-gray-500">Clean formatted document (Coming Soon)</div>
                </div>
              </button>
            </div>
          </div>

          {/* CSV Options */}
          {exportFormat === ReportExportFormat.CSV && (
            <div className="space-y-3">
              <label className="text-sm font-medium">CSV Format</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="csvFormat"
                    value="single"
                    checked={csvFormat === 'single'}
                    onChange={(e) => setCsvFormat(e.target.value as 'single' | 'multiple')}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Single comprehensive file</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="csvFormat"
                    value="multiple"
                    checked={csvFormat === 'multiple'}
                    onChange={(e) => setCsvFormat(e.target.value as 'single' | 'multiple')}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Separate files for each report</span>
                </label>
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            disabled={exporting}
            className="w-full"
          >
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}