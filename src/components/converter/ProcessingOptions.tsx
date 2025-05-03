
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Settings, Play, Database } from "lucide-react";
import { ProcessingOptions as OptionsType } from "./types";

interface ProcessingOptionsProps {
  options: OptionsType;
  onChange: (options: Partial<OptionsType>) => void;
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
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-base font-semibold flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Processing Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure how the PDF should be processed
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="useOcr">Use OCR</Label>
                    <p className="text-xs text-muted-foreground">
                      Optical character recognition for scanned PDFs
                    </p>
                  </div>
                  <Switch
                    id="useOcr"
                    checked={options.useOcr}
                    onCheckedChange={(value) => onChange({ useOcr: value })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="extractTables">Extract Tables</Label>
                    <p className="text-xs text-muted-foreground">
                      Detect and extract tabular data
                    </p>
                  </div>
                  <Switch
                    id="extractTables"
                    checked={options.extractTables}
                    onCheckedChange={(value) => onChange({ extractTables: value })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="detectSections">Auto-Detect Sections</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically identify document sections
                    </p>
                  </div>
                  <Switch
                    id="detectSections"
                    checked={options.detectSections}
                    onCheckedChange={(value) => onChange({ detectSections: value })}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-base font-semibold flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Output Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure the output format and parameters
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={options.dateFormat}
                    onValueChange={(value) => onChange({ dateFormat: value })}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (UK)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="outputFormat">Output Format</Label>
                  <Select
                    value={options.outputFormat}
                    onValueChange={(value: "xml" | "json") => onChange({ outputFormat: value })}
                  >
                    <SelectTrigger id="outputFormat">
                      <SelectValue placeholder="Select output format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confidence">Confidence Threshold</Label>
                    <span className="text-sm">{Math.round(options.confidence * 100)}%</span>
                  </div>
                  <Slider
                    id="confidence"
                    value={[options.confidence * 100]}
                    min={50}
                    max={100}
                    step={5}
                    onValueChange={(values) => onChange({ confidence: values[0] / 100 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum confidence level for extracted data
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onBatchProcessing}
              disabled={isProcessing || !file}
            >
              <Database className="h-4 w-4 mr-2" />
              Batch Process
            </Button>
            <Button
              onClick={onStartProcessing}
              disabled={isProcessing || !file}
            >
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Start Processing"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
