
import React, { useEffect, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Sparkles } from "lucide-react";
import { useChatMessages } from "../hooks/useChatMessages";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = memo(({ className }) => {
  const {
    isRecording,
    message,
    setMessage,
    chatMessages,
    toggleRecording,
    handleSendMessage
  } = useChatMessages();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Handle message input change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Handle key press in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden", className)}>
      <div 
        id="chat-container" 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto border rounded-md mb-4 bg-background/50"
      >
        <div className="p-4 space-y-4">
          {chatMessages.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-300`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted/80 border border-border/50'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 text-xs text-primary mb-1 font-medium">
                    <Sparkles className="h-3 w-3" />
                    AI Assistant
                  </div>
                )}
                <div className="prose-sm">
                  {msg.content.split('\n').map((text, i) => (
                    <React.Fragment key={i}>
                      {text}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="text-xs opacity-70 mt-1 text-right">
                  {new Date().toLocaleTimeString(undefined, { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex items-center space-x-2 p-3 border rounded-md bg-card shadow-sm">
        <Button 
          type="button" 
          size="icon"
          variant={isRecording ? "destructive" : "outline"}
          className={cn(
            "transition-all",
            isRecording && "animate-pulse"
          )}
          onClick={toggleRecording}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Textarea
          value={message}
          onChange={handleMessageChange}
          placeholder="Type your message..."
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          onKeyDown={handleKeyDown}
        />
        <Button 
          type="button" 
          size="icon"
          variant="default"
          onClick={handleSendMessage}
          className="bg-primary hover:bg-primary/90 shadow-sm transition-colors"
          disabled={!message.trim()}
          aria-label="Send message"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

ChatPanel.displayName = "ChatPanel";
