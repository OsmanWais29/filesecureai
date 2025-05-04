
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PDFToXMLConverter } from "@/components/converter/PDFToXMLConverter";
import { Card, CardContent } from "@/components/ui/card";
import { FileSearch } from "lucide-react";

const ConverterPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-accent/10 p-2 rounded-full">
            <FileSearch className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">PDF to XML Converter</h1>
            <p className="text-muted-foreground">
              Convert and structure your documents for seamless system integration
            </p>
          </div>
        </div>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-0">
            <PDFToXMLConverter />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 card-highlight">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FileSearch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Extract Structure</h3>
              <p className="text-muted-foreground">
                Automatically detect sections, tables, and key data points from your PDF documents.
              </p>
            </div>
          </Card>
          
          <Card className="p-6 card-highlight">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-accent/10 p-3 mb-4">
                <FileSearch className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-medium mb-2">Convert to XML</h3>
              <p className="text-muted-foreground">
                Transform unstructured documents into well-formatted XML ready for system integration.
              </p>
            </div>
          </Card>
          
          <Card className="p-6 card-highlight">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-secondary/10 p-3 mb-4">
                <FileSearch className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Smart Analysis</h3>
              <p className="text-muted-foreground">
                Intelligent document processing with OCR and advanced pattern recognition.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ConverterPage;
