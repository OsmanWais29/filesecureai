
import React from "react";
import { ChatMessage } from "../../../types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, BookMarked } from "lucide-react";
import { ChatMessage as MessageComponent } from "../../../components/ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalModuleContentProps {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleMessageSend: () => void;
  isProcessing: boolean;
}

export const LegalModuleContent: React.FC<LegalModuleContentProps> = ({
  messages,
  inputMessage,
  setInputMessage,
  handleKeyPress,
  handleMessageSend,
  isProcessing
}) => {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Legal & Regulatory</h2>
        <p className="text-sm text-muted-foreground">
          Get assistance with OSB regulations, BIA acts, and legal compliance questions.
        </p>
      </div>

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-4">
          {messages.map(message => (
            <MessageComponent key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto border-t pt-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            title="Browse Legal Resources"
          >
            <BookMarked className="h-4 w-4" />
          </Button>
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a legal or regulatory question..."
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
