
import React from "react";
import { ChatMessage } from "../../../types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, HelpCircle } from "lucide-react";
import { ChatMessage as MessageComponent } from "../../../components/ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HelpModuleContentProps {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleMessageSend: () => void;
  isProcessing: boolean;
}

export const HelpModuleContent: React.FC<HelpModuleContentProps> = ({
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
        <h2 className="text-lg font-medium">Training & Help</h2>
        <p className="text-sm text-muted-foreground">
          Get guidance on using the system and learn about best practices.
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
            title="Help Resources"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about system features..."
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
