
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ExcelErrorDisplayProps {
  error: string;
}

const ExcelErrorDisplay: React.FC<ExcelErrorDisplayProps> = ({ error }) => {
  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Excel Document</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Please ensure that:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>The file is a valid Excel document (.xlsx or .xls format)</li>
          <li>The file is not corrupted or password protected</li>
          <li>You have permission to access this document</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelErrorDisplay;
