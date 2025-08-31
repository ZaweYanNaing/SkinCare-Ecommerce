import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportComprehensiveCSV, type ExportData } from '@/utils/exportUtils';

interface SimpleExportButtonProps {
  disabled?: boolean;
}

export function SimpleExportButton({ disabled = false }: SimpleExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('http://localhost/admin/export-overview.php');
      const data = await response.json();
      
      if (data.success) {
        exportComprehensiveCSV(data.data as ExportData);
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
    <Button onClick={handleExport} disabled={disabled || exporting}>
      <Download />
      {exporting ? 'Exporting...' : 'Export'}
    </Button>
  );
}