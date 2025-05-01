
import React from "react";
import { UniversalPDFViewer } from "@/components/PDFViewer/UniversalPDFViewer";

interface EnhancedPDFViewerProps {
  storagePath: string;
  bucketName?: string;
  title: string;
  zoomLevel?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const EnhancedPDFViewer: React.FC<EnhancedPDFViewerProps> = (props) => {
  // This is now a simple wrapper around our UniversalPDFViewer
  // This ensures backward compatibility with existing code that uses EnhancedPDFViewer
  return (
    <UniversalPDFViewer {...props} />
  );
};
