
import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PenSquare, Upload, MessageSquare } from "lucide-react";
import { useConversations } from "../hooks/useConversations";
import { ConversationView } from "./ConversationView";
import { TrainingUpload } from "./TrainingUpload";
import { useToast } from "@/hooks/use-toast";

export const ChatInterface = () => {
  const { categoryMessages, handleSendMessage, isProcessing, clearConversation, loadConversationHistory } = useConversations('help');
  const [inputMessage, setInputMessage] = useState("");
  const [showTrainingUpload, setShowTrainingUpload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConversationHistory('help');
  }, [loadConversationHistory]);

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
    setShowTrainingUpload(false);
  }, [clearConversation]);

  const messages = categoryMessages.help || [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ChatGPT-style Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">SecureFiles AI</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            onClick={() => setShowTrainingUpload(!showTrainingUpload)}
          >
            <Upload className="h-4 w-4" />
            Train AI
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            onClick={handleNewChat}
          >
            <PenSquare className="h-4 w-4" />
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          // ChatGPT-style Welcome Screen
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full">
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-semibold text-gray-900 mb-4">
                How can I help you today?
              </h1>
              
              <p className="text-gray-600 text-lg">
                I'm your AI assistant for SecureFiles AI. Ask me about document management, bankruptcy procedures, or platform features.
              </p>
            </div>

            {/* Quick Start Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mb-8">
              <button
                onClick={() => setInputMessage("How do I upload documents?")}
                className="p-4 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors group"
              >
                <div className="font-medium text-gray-900 mb-1">Document Upload</div>
                <div className="text-sm text-gray-600">Learn how to upload and manage documents</div>
              </button>
              
              <button
                onClick={() => setInputMessage("What are the different bankruptcy forms?")}
                className="p-4 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors group"
              >
                <div className="font-medium text-gray-900 mb-1">Bankruptcy Forms</div>
                <div className="text-sm text-gray-600">Understanding Forms 1-96 and their purposes</div>
              </button>
              
              <button
                onClick={() => setInputMessage("How does risk assessment work?")}
                className="p-4 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors group"
              >
                <div className="font-medium text-gray-900 mb-1">Risk Assessment</div>
                <div className="text-sm text-gray-600">Learn about AI-powered risk analysis</div>
              </button>

              <button
                onClick={() => setInputMessage("How do I train the AI with my documents?")}
                className="p-4 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors group"
              >
                <div className="font-medium text-gray-900 mb-1">AI Training</div>
                <div className="text-sm text-gray-600">Upload documents to improve AI responses</div>
              </button>
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
