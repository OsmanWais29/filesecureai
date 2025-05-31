
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputMessage]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <div className="flex items-end gap-3 p-4 bg-white border border-gray-300 rounded-2xl shadow-lg focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message SecureFiles AI..."
            className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base"
            disabled={isProcessing}
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            size="sm"
            className="shrink-0 h-10 w-10 p-0 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
          >
            {isProcessing ? 
              <Loader2 className="h-5 w-5 animate-spin" /> : 
              <Send className="h-5 w-5" />
            }
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          {isProcessing ? 
            "AI is processing your message..." : 
            "SecureFiles AI can make mistakes. Consider checking important information."}
        </div>
      </div>
    </div>
  );
};
