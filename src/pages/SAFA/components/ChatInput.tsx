
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

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
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={isProcessing}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isProcessing}
          className="self-end"
        >
          {isProcessing ? "Sending..." : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
