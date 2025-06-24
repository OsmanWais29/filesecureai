
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ProcessingOptions as ProcessingOptionsType } from './types';
import { Settings, Play, Layers } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Processing Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="useOcr">Use OCR</Label>
              <Switch
                id="useOcr"
                checked={options.useOcr}
                onCheckedChange={(checked) => onChange({ useOcr: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="extractTables">Extract Tables</Label>
              <Switch
                id="extractTables"
                checked={options.extractTables}
                onCheckedChange={(checked) => onChange({ extractTables: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="detectSections">Detect Sections</Label>
              <Switch
                id="detectSections"
                checked={options.detectSections}
                onCheckedChange={(checked) => onChange({ detectSections: checked })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select
                value={options.outputFormat}
                onValueChange={(value: "xml" | "json") => onChange({ outputFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select
                value={options.dateFormat}
                onValueChange={(value) => onChange({ dateFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Confidence Threshold: {Math.round(options.confidence * 100)}%</Label>
              <Slider
                value={[options.confidence]}
                onValueChange={([value]) => onChange({ confidence: value })}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <Button
            onClick={onStartProcessing}
            disabled={!file || isProcessing}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Start Processing'}
          </Button>
          
          <Button
            onClick={onBatchProcessing}
            variant="outline"
            disabled={!file || isProcessing}
            className="flex-1"
          >
            <Layers className="h-4 w-4 mr-2" />
            Batch Process
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
