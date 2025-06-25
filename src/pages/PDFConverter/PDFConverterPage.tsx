
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PDFConverterInterface } from "./components/PDFConverterInterface";

const PDFConverterPage = () => {
  return (
    <MainLayout>
      <div className="h-full">
        <PDFConverterInterface />
      </div>
    </MainLayout>
  );
};

export default PDFConverterPage;
