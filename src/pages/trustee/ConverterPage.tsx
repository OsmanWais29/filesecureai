
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, ArrowRight } from "lucide-react";

const TrusteeConverterPage = () => {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Converter</h1>
          <p className="text-gray-600 mt-1">Convert documents between different formats for processing and analysis.</p>
        </div>

        {/* Converter Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                PDF to Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Extract text content from PDF documents for analysis and processing.
              </p>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Excel to PDF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Convert Excel spreadsheets to PDF format for document submission.
              </p>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Word to PDF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Convert Word documents to PDF for standardized formatting.
              </p>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Word Doc
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Image to PDF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Convert scanned images and photos to searchable PDF documents.
              </p>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-500" />
                OCR Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Extract text from scanned documents using advanced OCR technology.
              </p>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Process OCR
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-500" />
                Batch Converter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Convert multiple documents at once for efficient processing.
              </p>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Batch Upload
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Conversions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Form_47_John_Doe.pdf", from: "PDF", to: "Text", status: "Completed", time: "2 hours ago" },
                { name: "Financial_Statement.xlsx", from: "Excel", to: "PDF", status: "Processing", time: "1 hour ago" },
                { name: "Scanned_Document.jpg", from: "Image", to: "PDF", status: "Completed", time: "30 minutes ago" },
              ].map((conversion, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="font-medium">{conversion.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {conversion.from} <ArrowRight className="h-3 w-3" /> {conversion.to}
                        <span className="mx-2">•</span>
                        {conversion.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      conversion.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {conversion.status}
                    </span>
                    {conversion.status === 'Completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeConverterPage;
