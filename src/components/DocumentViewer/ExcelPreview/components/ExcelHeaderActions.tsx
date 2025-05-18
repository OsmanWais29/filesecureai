
import React from 'react';
import { FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExcelHeaderActionsProps {
  documentTitle: string;
  selectedSheet: string;
  setSelectedSheet: (sheet: string) => void;
  sheetNames: string[];
}

const ExcelHeaderActions: React.FC<ExcelHeaderActionsProps> = ({
  documentTitle,
  selectedSheet,
  setSelectedSheet,
  sheetNames
}) => {
  return (
    <div className="flex flex-col border-b p-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2 text-emerald-600" />
          <h3 className="font-medium text-lg">{documentTitle}</h3>
        </div>
        
        {sheetNames.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                {selectedSheet}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sheetNames.map((sheet) => (
                <DropdownMenuItem 
                  key={sheet} 
                  onClick={() => setSelectedSheet(sheet)}
                  className={selectedSheet === sheet ? "bg-muted" : ""}
                >
                  {sheet}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default ExcelHeaderActions;
