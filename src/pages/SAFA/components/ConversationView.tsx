
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage as ChatMessageType } from "../types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Card } from "@/components/ui/card";
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
  // Reference to scroll to bottom of messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/30">
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea className="absolute inset-0 px-4">
          <div className="py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
                <div className="text-muted-foreground mb-2">
                  No messages yet. Start a conversation!
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            
            {isProcessing && (
              <Card className="p-4 bg-muted/30 border-dashed animate-pulse">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">AI is thinking...</p>
                </div>
              </Card>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <ChatInput 
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
        isProcessing={isProcessing}
      />
    </div>
  );
};
