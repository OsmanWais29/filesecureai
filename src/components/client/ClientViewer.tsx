
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClientViewerProps } from "./types";
import { ClientTemplate } from "./components/ClientTemplate";

export const ClientViewer = (props: ClientViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  console.log("ClientViewer: Rendering with props:", {
    clientId: props.clientId,
    hasCallback: !!props.onBack,
    hasDocumentCallback: !!props.onDocumentOpen,
    currentRoute: window.location.pathname
  });
  
  useEffect(() => {
    // Show loading toast and then load client
    toast.info(`Loading client: ${props.clientId}`, {
      description: "Preparing client information..."
    });
    
    // Simulate loading time to ensure smooth experience
    const timer = setTimeout(() => {
      setIsLoading(false);
      toast.success(`Client ${props.clientId} loaded`, {
        description: "Client profile is now available"
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [props.clientId]);
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Client</h2>
          <p className="text-gray-600">Preparing {props.clientId}'s information...</p>
        </div>
      </div>
    );
  }
  
  // Always use the ClientTemplate which has reliable layout and data
  return (
    <ClientTemplate 
      clientId={props.clientId} 
      onBack={props.onBack}
      onDocumentOpen={props.onDocumentOpen}
    />
  );
};
