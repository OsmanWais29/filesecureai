
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
    <Card className="shadow-md border-none bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 p-2 rounded-full">
            <FileCode className="h-5 w-5 text-accent" />
          </div>
          <CardTitle>Conversion Results</CardTitle>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy XML
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={onDownload}
            className="gap-2 bg-accent hover:bg-accent/90"
          >
            <Download className="h-4 w-4" />
            Download XML
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="xml" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full grid grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="xml" className="gap-2">
              <FileCode className="h-4 w-4" />
              <span>XML Output</span>
            </TabsTrigger>
            <TabsTrigger value="structure" className="gap-2">
              <Table className="h-4 w-4" />
              <span>Structure</span>
            </TabsTrigger>
            <TabsTrigger value="validation" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Validation</span>
            </TabsTrigger>
          </TabsList>

          <div className="animate-in fade-in duration-300">
            <TabsContent value="xml" className="space-y-4 mt-0">
              <div className="relative">
                <pre className="bg-black text-green-400 p-6 rounded-md overflow-auto text-xs h-96 shadow-inner">
                  <code>{result.xml}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="structure" className="space-y-6 mt-0">
              <div className="bg-muted/30 p-6 rounded-md">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-primary" />
                  Document Metadata
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-background rounded-md border flex items-center gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-md">
                      <FileCode className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Filename</div>
                      <div className="font-medium truncate">{result.extractedData.metadata.filename}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded-md border flex items-center gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-md">
                      <FileCode className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Page Count</div>
                      <div className="font-medium">{result.extractedData.metadata.pageCount}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded-md border flex items-center gap-3">
                    <div className="bg-primary/10 p-1.5 rounded-md">
                      <FileCode className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Processing Time</div>
                      <div className="font-medium">{(result.extractedData.metadata.processingTime / 1000).toFixed(2)} seconds</div>
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded-md border flex items-center gap-3">
                    <div className={`${result.extractedData.metadata.success ? "bg-green-100" : "bg-red-100"} p-1.5 rounded-md`}>
                      <FileCode className={`h-3.5 w-3.5 ${result.extractedData.metadata.success ? "text-green-500" : "text-red-500"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className={`font-medium ${result.extractedData.metadata.success ? "text-green-600" : "text-red-600"}`}>
                        {result.extractedData.metadata.success ? "Success" : "Failed"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Table className="h-5 w-5 text-primary" />
                  Extracted Sections
                </h3>
                <div className="space-y-4">
                  {result.extractedData.sections.map((section, index) => (
                    <div key={index} className="bg-background border p-4 rounded-lg hover:border-primary/50 transition-colors">
                      <h4 className="text-sm font-semibold mb-3 pb-2 border-b flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <FileCode className="h-3.5 w-3.5 text-primary" />
                        </div>
                        {section.name}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {section.fields.map((field, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded min-w-[100px] text-right">
                              {field.name}:
                            </span>
                            <span className="bg-muted/30 px-2 py-1 rounded flex-1 truncate text-xs">
                              {String(field.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="validation" className="mt-0">
              {(result.validationErrors.length === 0 && result.validationWarnings.length === 0) ? (
                <div className="flex flex-col items-center justify-center bg-green-50 text-green-700 rounded-lg p-8 border border-green-100">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Validation Passed</h3>
                  <p className="text-green-600 text-center max-w-md">
                    Your XML document has passed validation with no errors or warnings. It's ready for system integration.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {result.validationErrors.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold flex items-center text-destructive gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Validation Errors
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {result.validationErrors.map((error, index) => (
                          <li key={index} className="bg-red-50 text-red-700 p-3 rounded-md border border-red-100 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.validationWarnings.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold flex items-center text-amber-600 gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Validation Warnings
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {result.validationWarnings.map((warning, index) => (
                          <li key={index} className="bg-amber-50 text-amber-700 p-3 rounded-md border border-amber-100 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
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
