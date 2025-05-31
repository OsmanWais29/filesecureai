
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputMessage]);

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex items-end gap-3 p-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message SecureFiles AI..."
            className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base placeholder:text-gray-500"
            disabled={isProcessing}
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            size="sm"
            className="shrink-0 h-8 w-8 p-0 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
          >
            {isProcessing ? 
              <Loader2 className="h-4 w-4 animate-spin" /> : 
              <Send className="h-4 w-4" />
            }
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {isProcessing ? 
            "AI is processing your message..." : 
            "SecureFiles AI can make mistakes. Consider checking important information."}
        </div>
      </div>
    </div>
  );
};
