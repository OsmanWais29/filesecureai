
import React from "react";
import { ChatMessage } from "../../../types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Send } from "lucide-react";
import { ChatMessage as MessageComponent } from "../../../components/ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentModuleContentProps {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleMessageSend: () => void;
  isProcessing: boolean;
  onUploadComplete: (documentId: string) => Promise<void>;
}

export const DocumentModuleContent: React.FC<DocumentModuleContentProps> = ({
  messages = [], // Default to empty array
  inputMessage,
  setInputMessage,
  handleKeyPress,
  handleMessageSend,
  isProcessing,
  onUploadComplete
}) => {
  // This is a placeholder for the document upload functionality
  const handleDocumentUpload = () => {
    // In a real implementation, this would open a file picker and upload the document
    console.log("Document upload triggered");
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Document Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Upload documents or ask questions about document analysis and management.
        </p>
      </div>

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-4">
          {Array.isArray(messages) && messages.map(message => (
            <MessageComponent key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto border-t pt-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleDocumentUpload}
            disabled={isProcessing}
            title="Upload Document"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about document analysis..."
            className="flex-1 min-h-[80px]"
            disabled={isProcessing}
          />
          <Button 
            onClick={handleMessageSend}
            disabled={!inputMessage.trim() || isProcessing}
            className="self-end"
          >
            {isProcessing ? "Sending..." : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
