
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
    toast({
      title: "New Chat Started",
      description: "Previous conversation cleared. You can start a new conversation.",
    });
  }, [clearConversation, toast]);

  const messages = categoryMessages.help || [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">SecureFiles AI</h1>
        </div>
        
        <div className="flex items-center gap-3">
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
          // Welcome Screen
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto w-full">
            <div className="text-center mb-12">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              
              <h1 className="text-4xl font-semibold text-gray-900 mb-6">
                How can I help you today?
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                I'm your AI assistant for SecureFiles AI. Ask me about document management, bankruptcy procedures, risk assessments, or platform features.
              </p>
            </div>

            {/* Quick Start Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-12">
              <button
                onClick={() => setInputMessage("How do I upload and analyze bankruptcy documents?")}
                className="p-6 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors group"
              >
                <div className="font-semibold text-gray-900 mb-2 group-hover:text-green-600">Document Management</div>
                <div className="text-gray-600">Learn how to upload, analyze, and manage bankruptcy documents</div>
              </button>
              
              <button
                onClick={() => setInputMessage("What are the different bankruptcy forms and their purposes?")}
                className="p-6 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors group"
              >
                <div className="font-semibold text-gray-900 mb-2 group-hover:text-green-600">Bankruptcy Forms</div>
                <div className="text-gray-600">Understanding Forms 1-96 and their specific requirements</div>
              </button>
              
              <button
                onClick={() => setInputMessage("How does the AI-powered risk assessment work?")}
                className="p-6 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors group"
              >
                <div className="font-semibold text-gray-900 mb-2 group-hover:text-green-600">Risk Assessment</div>
                <div className="text-gray-600">Learn about AI-powered compliance and risk analysis</div>
              </button>

              <button
                onClick={() => setInputMessage("How do I train the AI with my firm's documents?")}
                className="p-6 text-left bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors group"
              >
                <div className="font-semibold text-gray-900 mb-2 group-hover:text-green-600">AI Training</div>
                <div className="text-gray-600">Upload documents to improve AI responses for your practice</div>
              </button>
            </div>

            {/* Input Area */}
            <div className="w-full max-w-3xl">
              <div className="relative">
                <div className="flex items-end gap-4 p-4 bg-white border border-gray-300 rounded-3xl shadow-sm focus-within:border-green-500 focus-within:shadow-md transition-all">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Message SecureFiles AI..."
                    className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 p-0 focus:outline-none bg-transparent text-base placeholder:text-gray-500"
                    disabled={isProcessing}
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '24px',
                      maxHeight: '200px'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || isProcessing}
                    size="sm"
                    className="shrink-0 h-10 w-10 p-0 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="mt-3 text-sm text-gray-500 text-center">
                  {isProcessing ? 
                    "AI is processing your message..." : 
                    "SecureFiles AI can make mistakes. Consider checking important information."}
                </div>
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
