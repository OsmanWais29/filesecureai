
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, Check, FileJson, FileXml } from "lucide-react";
import { ConversionResult } from "./types";

interface XMLPreviewProps {
  result: ConversionResult;
  onDownload: () => void;
}

export const XMLPreview: React.FC<XMLPreviewProps> = ({ result, onDownload }) => {
  const [activeTab, setActiveTab] = useState("xml");
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    const textToCopy = activeTab === "xml" ? result.xml : JSON.stringify(result.json, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Format XML for display
  const formatXml = (xml: string) => {
    // Very basic formatting for readability
    let formatted = xml;
    
    // Replace > with >\n
    formatted = formatted.replace(/>/g, ">\n");
    
    // Add indentation
    let indent = 0;
    const lines = formatted.split("\n");
    formatted = lines.map(line => {
      let temp = line.trim();
      
      // Decrease indent for closing tags
      if (temp.startsWith("</")) {
        indent -= 2;
      }
      
      // Add current indentation
      const result = " ".repeat(indent) + temp;
      
      // Increase indent for opening tags (if not self-closing)
      if (temp.startsWith("<") && !temp.startsWith("</") && !temp.endsWith("/>")) {
        indent += 2;
      }
      
      return result;
    }).join("\n");
    
    return formatted;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Conversion Result</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            size="sm"
            onClick={onDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
      
      <Card className="shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <TabsList>
              <TabsTrigger value="xml" className="flex items-center">
                <FileXml className="h-4 w-4 mr-1" />
                XML
              </TabsTrigger>
              <TabsTrigger value="json" disabled={!result.json} className="flex items-center">
                <FileJson className="h-4 w-4 mr-1" />
                JSON
              </TabsTrigger>
              <TabsTrigger value="tree" className="flex items-center">
                Data Structure
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              {result.validationErrors.length === 0 ? (
                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Valid
                </Badge>
              ) : (
                <Badge variant="destructive">
                  {result.validationErrors.length} Errors
                </Badge>
              )}
              
              {result.validationWarnings.length > 0 && (
                <Badge variant="warning" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  {result.validationWarnings.length} Warnings
                </Badge>
              )}
            </div>
          </div>
          
          <CardContent className="pt-2">
            <TabsContent value="xml" className="mt-0">
              <div className="relative">
                <pre className="bg-muted rounded-md p-4 overflow-x-auto text-xs font-mono max-h-96">
                  {formatXml(result.xml)}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="json" className="mt-0">
              {result.json ? (
                <div className="relative">
                  <pre className="bg-muted rounded-md p-4 overflow-x-auto text-xs font-mono max-h-96">
                    {JSON.stringify(result.json, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-muted rounded-md p-4 text-center text-sm text-muted-foreground">
                  JSON output not available. Change output format to JSON in processing options.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tree" className="mt-0">
              <div className="bg-muted rounded-md p-4 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-medium mb-2">Extracted Data</h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-1">Metadata</h5>
                    <div className="space-y-1">
                      <div className="flex text-xs">
                        <span className="font-mono w-32">Filename:</span>
                        <span>{result.extractedData.metadata.filename}</span>
                      </div>
                      <div className="flex text-xs">
                        <span className="font-mono w-32">Page Count:</span>
                        <span>{result.extractedData.metadata.pageCount}</span>
                      </div>
                      <div className="flex text-xs">
                        <span className="font-mono w-32">Processing Time:</span>
                        <span>{(result.extractedData.metadata.processingTime / 1000).toFixed(2)}s</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-1">Sections</h5>
                    <div className="space-y-3">
                      {result.extractedData.sections.map((section, idx) => (
                        <div key={idx} className="border rounded p-2 bg-background">
                          <h6 className="text-xs font-medium mb-1">{section.name}</h6>
                          <div className="space-y-1">
                            {section.fields.map((field, fidx) => (
                              <div key={fidx} className="flex text-xs items-center">
                                <span className="font-mono w-32 truncate" title={field.name}>
                                  {field.name}:
                                </span>
                                <span className="truncate flex-1" title={String(field.value)}>
                                  {String(field.value)}
                                </span>
                              </div>
                            ))}
                            
                            {section.tables && section.tables.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs font-medium">Tables: </span>
                                <span className="text-xs">{section.tables.length} tables found</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};
