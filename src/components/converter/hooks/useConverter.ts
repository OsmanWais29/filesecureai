
import { useState, useCallback } from "react";
import { ProcessingOptions, ProcessingStatus, ConversionResult, ProcessingStage } from "../types";
import { toast } from "sonner";
import { extractTextFromPdf } from "@/utils/documents/pdfUtils";
import { processDocument } from "../utils/pdfProcessing";
import { convertToXml } from "../utils/xmlConverter";

// Initial processing options
const defaultOptions: ProcessingOptions = {
  useOcr: true,
  extractTables: true,
  detectSections: true,
  dateFormat: "YYYY-MM-DD",
  outputFormat: "xml",
  confidence: 0.8
};

// Initial processing status
const initialStatus: ProcessingStatus = {
  overallProgress: 0,
  currentStage: "idle",
  stages: [
    { id: "extraction", name: "Text Extraction", status: "pending", progress: 0 },
    { id: "sections", name: "Section Detection", status: "pending", progress: 0 },
    { id: "tables", name: "Table Detection", status: "pending", progress: 0 },
    { id: "xml", name: "XML Conversion", status: "pending", progress: 0 }
  ],
  startTime: new Date(),
  errors: [],
  warnings: []
};

export const useConverter = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>(defaultOptions);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>(initialStatus);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfText, setPdfText] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    setTimeout(() => {
      setUploadedFile(file);
      setUploadProgress(100);
      toast.success("File uploaded successfully");
      clearInterval(interval);
    }, 1000);
  }, []);

  // Handle file removal
  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setUploadProgress(0);
    setPdfText(null);
    setConversionResult(null);
    setProcessingStatus(initialStatus);
  }, []);

  // Handle options change
  const handleOptionsChange = useCallback((options: Partial<ProcessingOptions>) => {
    setProcessingOptions(prev => ({ ...prev, ...options }));
  }, []);

  // Update processing status
  const updateStatus = useCallback((update: Partial<ProcessingStatus>) => {
    setProcessingStatus(prev => ({ ...prev, ...update }));
  }, []);

  // Update stage progress
  const updateStageProgress = useCallback((stageId: string, progress: number, message?: string) => {
    setProcessingStatus(prev => {
      const newStages = prev.stages.map(stage => {
        if (stage.id === stageId) {
          return { 
            ...stage, 
            status: progress >= 100 ? 'complete' : 'processing', 
            progress, 
            message 
          } as ProcessingStage;
        }
        return stage;
      });
      
      // Calculate overall progress
      const overallProgress = newStages.reduce(
        (sum, stage) => sum + stage.progress, 
        0
      ) / newStages.length;
      
      return {
        ...prev,
        stages: newStages,
        overallProgress,
        currentStage: stageId
      };
    });
  }, []);

  // Process the PDF
  const processFile = useCallback(async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file first");
      return;
    }

    try {
      setIsProcessing(true);
      updateStatus({
        startTime: new Date(),
        errors: [],
        warnings: []
      });

      // Stage 1: Extract text from PDF
      updateStageProgress("extraction", 10, "Starting text extraction...");
      
      // Convert file to ArrayBuffer
      const buffer = await uploadedFile.arrayBuffer();
      
      // Extract text from PDF
      updateStageProgress("extraction", 40, "Processing PDF pages...");
      const extractedText = await extractTextFromPdf(URL.createObjectURL(uploadedFile));
      updateStageProgress("extraction", 100, "Text extraction complete");
      setPdfText(extractedText);
      
      // Stage 2: Detect sections
      updateStageProgress("sections", 10, "Analyzing document structure...");
      
      // Process document to detect sections, fields, etc.
      const processedDocument = await processDocument(extractedText, processingOptions);
      updateStageProgress("sections", 100, "Section detection complete");
      
      // Stage 3: Table detection
      updateStageProgress("tables", 50, "Extracting tables...");
      // Table extraction would happen in the processDocument function
      updateStageProgress("tables", 100, "Table extraction complete");
      
      // Stage 4: XML conversion
      updateStageProgress("xml", 20, "Generating XML...");
      const xml = convertToXml(processedDocument);
      updateStageProgress("xml", 100, "XML generation complete");
      
      // Set conversion result
      const result: ConversionResult = {
        xml,
        json: processingOptions.outputFormat === 'json' ? processedDocument : undefined,
        extractedData: {
          metadata: {
            filename: uploadedFile.name,
            pageCount: 1, // This would come from the PDF parsing
            processingTime: new Date().getTime() - processingStatus.startTime.getTime(),
            success: true
          },
          sections: processedDocument.sections || []
        },
        validationErrors: [],
        validationWarnings: []
      };
      
      setConversionResult(result);
      toast.success("PDF successfully converted to XML");
    } catch (error) {
      console.error("Processing error:", error);
      toast.error(`Error processing PDF: ${(error as Error).message}`);
      
      updateStatus({
        errors: [...processingStatus.errors, (error as Error).message]
      });
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFile, processingOptions, processingStatus.startTime, processingStatus.errors, updateStatus, updateStageProgress]);

  // Start processing
  const handleStartProcessing = useCallback(() => {
    processFile();
  }, [processFile]);

  // Handle batch processing
  const handleBatchProcessing = useCallback(() => {
    toast.info("Batch processing is not implemented yet");
  }, []);

  // Download XML
  const handleDownloadXml = useCallback(() => {
    if (!conversionResult) return;
    
    const blob = new Blob([conversionResult.xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadedFile?.name.replace('.pdf', '')}_converted.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("XML file downloaded");
  }, [conversionResult, uploadedFile]);

  return {
    uploadedFile,
    uploadProgress,
    processingOptions,
    processingStatus,
    conversionResult,
    isProcessing,
    handleFileUpload,
    handleRemoveFile,
    handleOptionsChange,
    handleStartProcessing,
    handleBatchProcessing,
    handleDownloadXml
  };
};
