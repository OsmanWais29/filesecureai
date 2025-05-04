
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Settings, Play, Database, FileText, Table, Search, Calendar, Percent } from "lucide-react";
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
    <Card className="shadow-sm border-none bg-card/80 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <h3 className="text-xl font-semibold flex items-center">
                  <Settings className="h-5 w-5 mr-3 text-primary" />
                  Processing Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure how your PDF should be processed for optimal results
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-accent/5 transition-colors border">
                  <div className="space-y-0.5 flex items-start gap-3">
                    <div className="mt-0.5 bg-primary/10 p-2 rounded-md">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="useOcr" className="text-base">Use OCR</Label>
                      <p className="text-xs text-muted-foreground">
                        Optical character recognition for scanned or image-based PDFs
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="useOcr"
                    checked={options.useOcr}
                    onCheckedChange={(value) => onChange({ useOcr: value })}
                    className="data-[state=checked]:bg-accent"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-accent/5 transition-colors border">
                  <div className="space-y-0.5 flex items-start gap-3">
                    <div className="mt-0.5 bg-primary/10 p-2 rounded-md">
                      <Table className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="extractTables" className="text-base">Extract Tables</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically detect and extract tabular data from your document
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="extractTables"
                    checked={options.extractTables}
                    onCheckedChange={(value) => onChange({ extractTables: value })}
                    className="data-[state=checked]:bg-accent"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-accent/5 transition-colors border">
                  <div className="space-y-0.5 flex items-start gap-3">
                    <div className="mt-0.5 bg-primary/10 p-2 rounded-md">
                      <Search className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="detectSections" className="text-base">Auto-Detect Sections</Label>
                      <p className="text-xs text-muted-foreground">
                        Intelligently identify and structure document sections
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="detectSections"
                    checked={options.detectSections}
                    onCheckedChange={(value) => onChange({ detectSections: value })}
                    className="data-[state=checked]:bg-accent"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <h3 className="text-xl font-semibold flex items-center">
                  <Database className="h-5 w-5 mr-3 text-primary" />
                  Output Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure the output format and quality parameters
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-background border">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-md mt-0.5">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <Label htmlFor="dateFormat" className="text-base">Date Format</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Choose how dates will be formatted in the output XML
                        </p>
                      </div>
                    </div>
                    <Select
                      value={options.dateFormat}
                      onValueChange={(value) => onChange({ dateFormat: value })}
                    >
                      <SelectTrigger id="dateFormat" className="w-full">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US Format)</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (European Format)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-background border">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-md mt-0.5">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <Label htmlFor="outputFormat" className="text-base">Output Format</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Choose the final output format for your conversion
                        </p>
                      </div>
                    </div>
                    <Select
                      value={options.outputFormat}
                      onValueChange={(value: "xml" | "json") => onChange({ outputFormat: value })}
                    >
                      <SelectTrigger id="outputFormat" className="w-full">
                        <SelectValue placeholder="Select output format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xml">XML (Extensible Markup Language)</SelectItem>
                        <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-background border">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-md mt-0.5">
                        <Percent className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="confidence" className="text-base">Confidence Threshold</Label>
                          <span className="text-sm font-medium bg-accent/20 text-accent rounded-full px-2 py-0.5">
                            {Math.round(options.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Minimum confidence level for extracted data to be included
                        </p>
                      </div>
                    </div>
                    <Slider
                      id="confidence"
                      value={[options.confidence * 100]}
                      min={50}
                      max={100}
                      step={5}
                      onValueChange={(values) => onChange({ confidence: values[0] / 100 })}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>50% (More data, less accurate)</span>
                      <span>100% (High accuracy, less data)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onBatchProcessing}
              disabled={isProcessing || !file}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              Batch Process
            </Button>
            <Button
              onClick={onStartProcessing}
              disabled={isProcessing || !file}
              className="gap-2 bg-accent hover:bg-accent/90"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Processing
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
