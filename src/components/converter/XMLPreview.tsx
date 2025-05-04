
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Check, AlertCircle, Copy, FileCode, Table, AlertTriangle, CheckCircle } from "lucide-react";
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
    <Card className="border shadow-sm">
      <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <FileCode className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Conversion Results</CardTitle>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="gap-1.5"
          >
            {copied ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy XML</span>
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={onDownload}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download XML</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="xml" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="xml" className="text-xs">XML Output</TabsTrigger>
            <TabsTrigger value="structure" className="text-xs">Structure</TabsTrigger>
            <TabsTrigger value="validation" className="text-xs">Validation</TabsTrigger>
          </TabsList>

          <div className="animate-in fade-in-50 duration-300">
            <TabsContent value="xml">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs h-80 font-mono">
                  <code>{result.xml}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="structure">
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                    <FileCode className="h-4 w-4 text-primary" />
                    Document Metadata
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-background rounded-md border flex items-center gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-md">
                        <FileCode className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <div className="text-muted-foreground">Filename</div>
                        <div className="font-medium truncate">{result.extractedData.metadata.filename}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded-md border flex items-center gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-md">
                        <FileCode className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <div className="text-muted-foreground">Page Count</div>
                        <div className="font-medium">{result.extractedData.metadata.pageCount}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded-md border flex items-center gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-md">
                        <FileCode className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <div className="text-muted-foreground">Processing Time</div>
                        <div className="font-medium">{(result.extractedData.metadata.processingTime / 1000).toFixed(2)} seconds</div>
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded-md border flex items-center gap-2">
                      <div className={`${result.extractedData.metadata.success ? "bg-green-100" : "bg-red-100"} p-1.5 rounded-md`}>
                        <FileCode className={`h-3 w-3 ${result.extractedData.metadata.success ? "text-green-500" : "text-red-500"}`} />
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className={`font-medium ${result.extractedData.metadata.success ? "text-green-600" : "text-red-600"}`}>
                          {result.extractedData.metadata.success ? "Success" : "Failed"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-1.5">
                    <Table className="h-4 w-4 text-primary" />
                    Extracted Sections
                  </h3>
                  <div className="space-y-3">
                    {result.extractedData.sections.map((section, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                            <FileCode className="h-3.5 w-3.5 text-primary" />
                            {section.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {section.fields.map((field, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs">
                                <span className="text-muted-foreground bg-muted/50 px-2 py-1 rounded min-w-[80px] text-right">
                                  {field.name}:
                                </span>
                                <span className="bg-muted/20 px-2 py-1 rounded flex-1 truncate">
                                  {String(field.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="validation">
              {(result.validationErrors.length === 0 && result.validationWarnings.length === 0) ? (
                <div className="flex flex-col items-center justify-center bg-green-50 text-green-700 rounded-md p-6 border border-green-100">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-base font-medium mb-2">Validation Passed</h3>
                  <p className="text-sm text-green-600 text-center max-w-md">
                    Your XML document has passed validation with no errors or warnings.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {result.validationErrors.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center text-destructive gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        Validation Errors
                      </h3>
                      <ul className="space-y-2 text-xs">
                        {result.validationErrors.map((error, index) => (
                          <li key={index} className="bg-red-50 text-red-700 p-3 rounded-md border border-red-100 flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.validationWarnings.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center text-amber-600 gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        Validation Warnings
                      </h3>
                      <ul className="space-y-2 text-xs">
                        {result.validationWarnings.map((warning, index) => (
                          <li key={index} className="bg-amber-50 text-amber-700 p-3 rounded-md border border-amber-100 flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
