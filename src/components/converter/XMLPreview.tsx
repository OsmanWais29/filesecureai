
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Check, AlertCircle, Copy } from "lucide-react";
import { ConversionResult } from "./types";

interface XMLPreviewProps {
  result: ConversionResult;
  onDownload: () => void;
}

export const XMLPreview: React.FC<XMLPreviewProps> = ({ result, onDownload }) => {
  const [activeTab, setActiveTab] = useState("xml");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Conversion Results</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy XML
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={onDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download XML
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="xml" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="xml">XML Output</TabsTrigger>
            <TabsTrigger value="structure">Document Structure</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="xml" className="space-y-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md overflow-auto text-xs h-96">
                <code>{result.xml}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Document Metadata</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Filename:</div>
                  <div>{result.extractedData.metadata.filename}</div>
                  <div className="text-muted-foreground">Page Count:</div>
                  <div>{result.extractedData.metadata.pageCount}</div>
                  <div className="text-muted-foreground">Processing Time:</div>
                  <div>{(result.extractedData.metadata.processingTime / 1000).toFixed(2)} seconds</div>
                  <div className="text-muted-foreground">Status:</div>
                  <div className={result.extractedData.metadata.success ? "text-green-500" : "text-red-500"}>
                    {result.extractedData.metadata.success ? "Success" : "Failed"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Extracted Sections</h3>
                {result.extractedData.sections.map((section, index) => (
                  <div key={index} className="bg-muted p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-2">{section.name}</h4>
                    <div className="space-y-2">
                      {section.fields.map((field, i) => (
                        <div key={i} className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">{field.name}:</div>
                          <div className="truncate">{String(field.value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            {(result.validationErrors.length === 0 && result.validationWarnings.length === 0) ? (
              <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-md">
                <Check className="h-5 w-5 mr-2" />
                <span>XML validation passed with no errors or warnings</span>
              </div>
            ) : (
              <div className="space-y-4">
                {result.validationErrors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center text-destructive">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Validation Errors
                    </h3>
                    <ul className="space-y-1 text-sm">
                      {result.validationErrors.map((error, index) => (
                        <li key={index} className="bg-red-50 text-red-700 p-2 rounded-md">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.validationWarnings.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Validation Warnings
                    </h3>
                    <ul className="space-y-1 text-sm">
                      {result.validationWarnings.map((warning, index) => (
                        <li key={index} className="bg-amber-50 text-amber-700 p-2 rounded-md">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
