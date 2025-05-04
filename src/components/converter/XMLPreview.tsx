
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ConversionResult } from "./types";
import { Download, Check, AlertCircle, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface XMLPreviewProps {
  result: ConversionResult;
  onDownload: () => void;
}

export const XMLPreview: React.FC<XMLPreviewProps> = ({ result, onDownload }) => {
  const [activeTab, setActiveTab] = useState("xml");
  
  // Format XML with proper indentation for display
  const formatXml = (xml: string) => {
    // XML is already formatted in our implementation
    return xml;
  };
  
  // Format JSON for display
  const formatJson = (json: any) => {
    return JSON.stringify(json, null, 2);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Conversion Result</CardTitle>
          <Button onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download XML
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="xml">XML Output</TabsTrigger>
              <TabsTrigger value="json" disabled={!result.json}>Data Preview</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="xml" className="space-y-4">
              <div className="relative">
                <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto max-h-[500px] overflow-y-auto">
                  <code className="text-xs">{formatXml(result.xml)}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="json" className="space-y-4">
              {result.json ? (
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto max-h-[500px] overflow-y-auto">
                    <code className="text-xs">{formatJson(result.json)}</code>
                  </pre>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No JSON data available
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="validation" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {result.validationErrors.length === 0 ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-1" />
                      <span>XML validation passed</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-destructive">
                      <AlertCircle className="h-5 w-5 mr-1" />
                      <span>{result.validationErrors.length} validation errors found</span>
                    </div>
                  )}
                </div>
                
                {result.validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Errors</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {result.validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {result.validationWarnings.length > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Validation Warnings</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {result.validationWarnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-medium">Extraction Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-xs text-muted-foreground">Filename</div>
                      <div className="font-medium">{result.extractedData.metadata.filename}</div>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-xs text-muted-foreground">Page Count</div>
                      <div className="font-medium">{result.extractedData.metadata.pageCount}</div>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-xs text-muted-foreground">Processing Time</div>
                      <div className="font-medium">{(result.extractedData.metadata.processingTime / 1000).toFixed(2)}s</div>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className={`font-medium ${result.extractedData.metadata.success ? 'text-green-600' : 'text-destructive'}`}>
                        {result.extractedData.metadata.success ? 'Success' : 'Failed'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Extracted Sections</h3>
                  <div className="space-y-2">
                    {result.extractedData.sections.map((section, index) => (
                      <div key={index} className="bg-muted p-3 rounded-md">
                        <div className="font-medium">{section.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {section.fields.length} fields extracted
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
