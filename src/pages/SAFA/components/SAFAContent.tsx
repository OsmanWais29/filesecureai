
import { ReactNode } from "react";

interface SAFAContentProps {
  sidebarCollapsed: boolean;
  children?: ReactNode;
}

export const SAFAContent = ({ sidebarCollapsed, children }: SAFAContentProps) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SecureFiles AI Assistant</h1>
      
      <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-medium mb-2">Welcome to SecureFiles AI</h2>
        <p className="text-muted-foreground mb-4">
          Select a category from the sidebar to begin. You can analyze documents, get legal insights, 
          connect with clients, or access training and help.
        </p>
        
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm">
            <strong>Getting Started:</strong> Upload a document for analysis or select 
            a conversation category to interact with the AI assistant.
          </p>
        </div>
      </div>
      
      {/* Display any children elements */}
      {children}
    </div>
  );
};
