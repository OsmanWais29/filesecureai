
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, Download, FileText, Settings, History, RefreshCw } from "lucide-react";
import { ConversionSidebar } from "./ConversionSidebar";
import { WorkspacePanel } from "./WorkspacePanel";
import { AISidebar } from "./AISidebar";
import { TrainingButtons } from "./TrainingButtons";
import { useConverter } from "../hooks/useConverter";
import { toast } from "sonner";

export const PDFConverterInterface = () => {
  const [selectedEstate, setSelectedEstate] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<"xml" | "json" | "csv">("xml");
  const [aiAutoMapping, setAiAutoMapping] = useState(true);
  const [showAISidebar, setShowAISidebar] = useState(true);
  
  const {
    uploadedFile,
    extractedFields,
    processingStatus,
    isProcessing,
    handleFileUpload,
    handleFieldUpdate,
    handleReprocess,
    handleExport,
    handleTraining
  } = useConverter();

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">PDF to XML Converter</h1>
            </div>
            
            <Select value={selectedEstate} onValueChange={setSelectedEstate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Estate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="estate-001">Estate #001 - John Doe</SelectItem>
                <SelectItem value="estate-002">Estate #002 - Jane Smith</SelectItem>
                <SelectItem value="estate-003">Estate #003 - Bob Johnson</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleUploadClick} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload PDF
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">AI Auto-Mapping</span>
              <Switch
                checked={aiAutoMapping}
                onCheckedChange={setAiAutoMapping}
              />
            </div>

            <Select value={exportFormat} onValueChange={(value: "xml" | "json" | "csv") => setExportFormat(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => handleExport(exportFormat)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <ConversionSidebar />

        {/* Center Workspace */}
        <div className="flex-1 flex flex-col">
          <WorkspacePanel
            uploadedFile={uploadedFile}
            extractedFields={extractedFields}
            processingStatus={processingStatus}
            isProcessing={isProcessing}
            onFieldUpdate={handleFieldUpdate}
            aiAutoMapping={aiAutoMapping}
          />
          
          {/* Training Buttons */}
          <TrainingButtons
            onConfirmTrain={() => handleTraining('confirm')}
            onReject={() => handleTraining('reject')}
            onReprocess={handleReprocess}
            onSendToSAFA={() => toast.success("Sent to SAFA for further analysis")}
            disabled={!uploadedFile || isProcessing}
          />
        </div>

        {/* AI Sidebar */}
        {showAISidebar && (
          <AISidebar
            onClose={() => setShowAISidebar(false)}
            uploadedFile={uploadedFile}
            extractedFields={extractedFields}
          />
        )}
      </div>
    </div>
  );
};
