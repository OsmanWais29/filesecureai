
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UniversalPDFViewer } from "@/components/PDFViewer/UniversalPDFViewer";
import { FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const PDFViewerDemo = () => {
  const [pdfPath, setPdfPath] = useState<string>("");
  const [viewingPath, setViewingPath] = useState<string | null>(null);
  
  const handleViewPdf = () => {
    if (!pdfPath.trim()) {
      toast.warning("Please enter a storage path");
      return;
    }
    
    setViewingPath(pdfPath.trim());
    toast.success("Loading PDF...");
  };
  
  const handleReset = () => {
    setViewingPath(null);
    setPdfPath("");
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-semibold">PDF Viewer Demo</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Universal PDF Viewer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input 
                  placeholder="Enter PDF storage path (e.g. user/document.pdf)" 
                  value={pdfPath} 
                  onChange={(e) => setPdfPath(e.target.value)} 
                  className="flex-1"
                />
                <Button onClick={handleViewPdf}>View PDF</Button>
                {viewingPath && (
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                )}
              </div>
              
              {viewingPath ? (
                <div className="h-[600px] border rounded-md overflow-hidden">
                  <UniversalPDFViewer 
                    storagePath={viewingPath} 
                    title="Demo PDF" 
                    onLoad={() => toast.success("PDF loaded successfully")}
                    onError={(error) => toast.error(`Error: ${error.message}`)}
                  />
                </div>
              ) : (
                <div className="h-[600px] border rounded-md flex items-center justify-center bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter a storage path and click "View PDF" to test the viewer</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PDFViewerDemo;
