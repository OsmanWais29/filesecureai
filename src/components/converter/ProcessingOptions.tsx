
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ProcessingOptions as ProcessingOptionsType } from "./types";
import { Play, Layers, FileText } from "lucide-react";

interface ProcessingOptionsProps {
  options: ProcessingOptionsType;
  onChange: (options: Partial<ProcessingOptionsType>) => void;
  onStartProcessing: () => void;
  onBatchProcessing: () => void;
  isProcessing: boolean;
  file: File | null;
}

export const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
  options,
  onChange,
  onStartProcessing,
  onBatchProcessing,
  isProcessing,
  file
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-ocr">Use OCR (Text Recognition)</Label>
                <Switch
                  id="use-ocr"
                  checked={options.useOcr}
                  onCheckedChange={(checked) => onChange({ useOcr: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="extract-tables">Extract Tables</Label>
                <Switch
                  id="extract-tables"
                  checked={options.extractTables}
                  onCheckedChange={(checked) => onChange({ extractTables: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="detect-sections">Detect Sections</Label>
                <Switch
                  id="detect-sections"
                  checked={options.detectSections}
                  onCheckedChange={(checked) => onChange({ detectSections: checked })}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select
                  value={options.dateFormat}
                  onValueChange={(value) => onChange({ dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="output-format">Output Format</Label>
                <Select
                  value={options.outputFormat}
                  onValueChange={(value) => onChange({ outputFormat: value as "xml" | "json" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select output format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confidence">Confidence Threshold: {(options.confidence * 100).toFixed(0)}%</Label>
                <Slider
                  id="confidence"
                  min={0.5}
                  max={1}
                  step={0.1}
                  value={[options.confidence]}
                  onValueChange={([value]) => onChange({ confidence: value })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-4 justify-center">
        <Button
          onClick={onStartProcessing}
          disabled={!file || isProcessing}
          size="lg"
          className="min-w-32"
        >
          <Play className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Start Processing'}
        </Button>
        
        <Button
          onClick={onBatchProcessing}
          disabled={!file || isProcessing}
          variant="outline"
          size="lg"
          className="min-w-32"
        >
          <Layers className="h-4 w-4 mr-2" />
          Batch Process
        </Button>
      </div>
    </div>
  );
};
