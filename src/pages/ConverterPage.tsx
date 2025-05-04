
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PDFToXMLConverter } from "@/components/converter/PDFToXMLConverter";
import { Card, CardContent } from "@/components/ui/card";
import { FileSearch } from "lucide-react";

const ConverterPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <FileSearch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Document Converter</h1>
              <p className="text-muted-foreground">
                Convert PDF documents to structured XML format
              </p>
            </div>
          </div>
        </header>
        
        <div className="grid gap-6">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <PDFToXMLConverter />
            </CardContent>
          </Card>
          
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileSearch className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">Extract Structure</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically detect sections, tables, and key data points from PDF documents.
                </p>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-accent/10 p-3 rounded-full">
                  <FileSearch className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-medium">Convert to XML</h3>
                <p className="text-sm text-muted-foreground">
                  Transform unstructured documents into well-formatted XML ready for system integration.
                </p>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileSearch className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">Smart Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Intelligent document processing with OCR and advanced pattern recognition.
                </p>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default ConverterPage;
