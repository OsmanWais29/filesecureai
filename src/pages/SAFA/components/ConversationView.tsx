
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types";
import { ChatMessage } from "./ChatMessage";

interface ConversationViewProps {
  messages: ChatMessageType[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isProcessing: boolean;
}

export const ConversationView = ({
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleKeyPress,
  isProcessing
}: ConversationViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {messages.map((message) => (
              <div key={message.id} className="mb-8">
                <ChatMessage message={message} />
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
                        <div className="typing-indicator">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
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
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
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
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isProcessing}
                size="sm"
                className="shrink-0 h-10 w-10 p-0 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 transition-colors"
              >
                {isProcessing ? 
                  <Loader2 className="h-5 w-5 animate-spin" /> : 
                  <MessageSquare className="h-5 w-5" />
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

      <style>
        {`
          .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .dot {
            width: 6px;
            height: 6px;
            background-color: #6b7280;
            border-radius: 50%;
            animation: bounce 1.5s infinite;
          }
          
          .dot:nth-child(2) {
            animation-delay: 0.2s;
          }
          
          .dot:nth-child(3) {
            animation-delay: 0.4s;
          }
          
          @keyframes bounce {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-4px);
            }
          }
        `}
      </style>
    </div>
  );
};
