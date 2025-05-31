
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
    <div className="p-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message SecureFiles AI..."
            className="min-h-[60px] max-h-[200px] resize-none border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
            disabled={isProcessing}
          />
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isProcessing}
          size="icon"
          className="h-[60px] w-[60px] rounded-lg"
        >
          {isProcessing ? 
            <Loader2 className="h-5 w-5 animate-spin" /> : 
            <Send className="h-5 w-5" />
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
