
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage as ChatMessageType } from "../types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Loader2 } from "lucide-react";

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
          <div className="p-4 space-y-6 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isProcessing && (
              <div className="flex items-start gap-3 w-full py-2 px-1">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="bg-muted rounded-lg p-4 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <div className="typing-indicator">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background">
        <div className="max-w-3xl mx-auto">
          <ChatInput 
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      <style>
        {`
          .typing-indicator {
            display: flex;
            align-items: center;
            column-gap: 4px;
          }
          
          .dot {
            width: 6px;
            height: 6px;
            background-color: currentColor;
            border-radius: 50%;
            opacity: 0.6;
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
