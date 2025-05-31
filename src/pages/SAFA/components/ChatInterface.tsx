
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Upload } from "lucide-react";
import { useConversations } from "../hooks/useConversations";
import { ConversationView } from "./ConversationView";
import { TrainingUpload } from "./TrainingUpload";
import { useToast } from "@/hooks/use-toast";

export const ChatInterface = () => {
  const { categoryMessages, handleSendMessage, isProcessing, clearConversation } = useConversations('help');
  const [inputMessage, setInputMessage] = useState("");
  const [showTrainingUpload, setShowTrainingUpload] = useState(false);
  const { toast } = useToast();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim()) {
        handleSend();
      }
    }
  };

  const handleSend = useCallback(async () => {
    if (inputMessage.trim() && !isProcessing) {
      try {
        await handleSendMessage(inputMessage);
        setInputMessage("");
        
        // Simulate AI response for demo
        setTimeout(() => {
          const aiResponse = generateAIResponse(inputMessage);
          // Add AI response to messages
          // This would normally be handled by the real AI integration
        }, 1000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [inputMessage, isProcessing, handleSendMessage, toast]);

  const handleNewChat = useCallback(() => {
    clearConversation('help');
    setInputMessage("");
    toast({
      title: "New Chat Started",
      description: "Your conversation has been cleared.",
    });
  }, [clearConversation, toast]);

  const generateAIResponse = (userMessage: string): string => {
    if (userMessage.toLowerCase().includes("upload") || userMessage.toLowerCase().includes("document")) {
      return "To upload documents for training in SecureFiles AI, navigate to the Documents page and use the drag-and-drop upload area or click the Upload button. The system supports PDF, Excel, Word, and image files.";
    }
    if (userMessage.toLowerCase().includes("bankruptcy") || userMessage.toLowerCase().includes("form")) {
      return "SecureFiles AI supports all bankruptcy forms (Forms 1-96). Each form has specific validation rules and risk assessments. Forms like 47 (Consumer Proposal) and 65 (Assignment) have automated compliance checking.";
    }
    if (userMessage.toLowerCase().includes("risk")) {
      return "Our AI-powered risk assessment analyzes documents for compliance issues, missing signatures, incomplete fields, and regulatory violations. Risk levels are color-coded: Green (low), Orange (medium), and Red (high priority).";
    }
    if (userMessage.toLowerCase().includes("user") || userMessage.toLowerCase().includes("permission")) {
      return "User management is handled through the Settings > Access Control section. You can assign roles, manage province-based access, and configure IP whitelisting for enhanced security.";
    }
    return "I'm here to help you with SecureFiles AI. I can assist with document upload procedures, bankruptcy form guidance, risk assessment features, user management, and platform navigation. What specific area would you like help with?";
  };

  const messages = categoryMessages.help || [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">SecureFiles AI Assistant</h1>
            <p className="text-sm text-gray-500">Training & Help</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setShowTrainingUpload(!showTrainingUpload)}
          >
            <Upload className="h-4 w-4" />
            Train AI
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>
      </div>

      {/* Training Upload Panel */}
      {showTrainingUpload && (
        <div className="border-b border-gray-200 bg-gray-50">
          <TrainingUpload onClose={() => setShowTrainingUpload(false)} />
        </div>
      )}

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          // Welcome Screen - ChatGPT style
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-2xl">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                How can I help you today?
              </h2>
              
              <p className="text-gray-600 mb-12 text-lg">
                I'm your AI training assistant for SecureFiles AI. Ask me about document management, bankruptcy procedures, or platform features.
              </p>

              {/* Quick suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <button
                  onClick={() => setInputMessage("How do I upload documents?")}
                  className="p-4 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
                >
                  <div className="font-medium text-gray-900 mb-1">Document Upload</div>
                  <div className="text-sm text-gray-600">Learn how to upload and manage documents</div>
                </button>
                
                <button
                  onClick={() => setInputMessage("What are the different bankruptcy forms?")}
                  className="p-4 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
                >
                  <div className="font-medium text-gray-900 mb-1">Bankruptcy Forms</div>
                  <div className="text-sm text-gray-600">Understanding Forms 1-96 and their purposes</div>
                </button>
                
                <button
                  onClick={() => setInputMessage("How does risk assessment work?")}
                  className="p-4 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
                >
                  <div className="font-medium text-gray-900 mb-1">Risk Assessment</div>
                  <div className="text-sm text-gray-600">Learn about AI-powered risk analysis</div>
                </button>

                <button
                  onClick={() => setInputMessage("How do I train the AI with my documents?")}
                  className="p-4 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
                >
                  <div className="font-medium text-gray-900 mb-1">AI Training</div>
                  <div className="text-sm text-gray-600">Upload documents to improve AI responses</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ConversationView
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSend}
            handleKeyPress={handleKeyPress}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
};
