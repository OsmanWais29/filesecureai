
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PenSquare, Upload, MessageSquare, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "../types";

export const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }

    try {
      const { data, error } = await supabase.functions.invoke('deepseek-chat', {
        body: { message: userMessage.content }
      });

      if (error) {
        throw new Error(`AI API error: ${error.message}`);
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: data.response || 'I apologize, but I encountered an error processing your request.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'I apologize, but I encountered an error. Please check that the DeepSeek API is configured properly.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [inputMessage, isProcessing, toast]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputMessage("");
    toast({
      title: "New Chat Started",
      description: "Previous conversation cleared.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  return (
    <div className="flex flex-col h-full">
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

      {/* Main Content */}
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
          </div>
        ) : (
          // Chat Messages
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              {messages.map((message) => (
                <div key={message.id} className="mb-8">
                  <div className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`flex flex-col space-y-2 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {message.role === 'user' ? "You" : "SecureFiles AI"}
                        </span>
                      </div>
                      
                      <div className={`px-6 py-4 rounded-3xl text-gray-800 leading-relaxed whitespace-pre-wrap ${
                        message.role === 'user' 
                          ? "bg-green-600 text-white rounded-br-lg" 
                          : "bg-gray-100 rounded-bl-lg"
                      }`}>
                        {message.content}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center shrink-0">
                        <div className="w-5 h-5 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-3xl rounded-bl-lg px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="relative">
              <div className="flex items-end gap-4 p-4 bg-white border border-gray-300 rounded-3xl shadow-sm focus-within:border-green-500 focus-within:shadow-md transition-all">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Message SecureFiles AI..."
                  className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 p-0 focus:outline-none bg-transparent text-base placeholder:text-gray-500"
                  disabled={isProcessing}
                  rows={1}
                  style={{ height: '24px' }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || isProcessing}
                  size="sm"
                  className="shrink-0 h-10 w-10 p-0 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                >
                  {isProcessing ? 
                    <Loader2 className="h-5 w-5 animate-spin" /> : 
                    <Send className="h-5 w-5" />
                  }
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
      </div>
    </div>
  );
};
