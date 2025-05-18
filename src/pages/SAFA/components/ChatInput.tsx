
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isProcessing: boolean;
}

export const ChatInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleKeyPress,
  isProcessing
}: ChatInputProps) => {
  return (
    <div className="border-t p-4 bg-background/50 backdrop-blur-sm">
      <div className="flex gap-2 items-end">
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 min-h-[60px] max-h-[150px] resize-y focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          disabled={isProcessing}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isProcessing}
          className="self-end h-10 w-10 rounded-full p-0 flex items-center justify-center"
        >
          {isProcessing ? 
            <Loader2 className="h-4 w-4 animate-spin" /> : 
            <Send className="h-4 w-4" />
          }
        </Button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        {isProcessing ? 
          "AI is processing your message..." : 
          "Press Enter to send, Shift+Enter for a new line"}
      </div>
    </div>
  );
};
