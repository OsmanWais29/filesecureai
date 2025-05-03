
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PDFToXMLConverter } from "@/components/converter/PDFToXMLConverter";

const ConverterPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-semibold">PDF to XML Converter</h1>
        <p className="text-muted-foreground">
          Convert custom PDF documents to structured XML format for system integration.
        </p>
        
        <PDFToXMLConverter />
      </div>
    </MainLayout>
  );
};

export default ConverterPage;
