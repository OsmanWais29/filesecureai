
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { ChatMessage as ChatMessageType } from "../types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

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
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isProcessing && (
            <Card className="p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">AI is thinking...</p>
            </Card>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
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
