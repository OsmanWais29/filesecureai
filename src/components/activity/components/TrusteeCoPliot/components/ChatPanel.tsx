
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send } from "lucide-react";
import { useChatMessages, ChatMessage } from "../hooks/useChatMessages";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ className }) => {
  const {
    isRecording,
    message,
    setMessage,
    chatMessages,
    toggleRecording,
    handleSendMessage
  } = useChatMessages();

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden", className)}>
      <div id="chat-container" className="flex-1 overflow-y-auto border rounded-md mb-4">
        <div className="p-4 space-y-4">
          {chatMessages.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}
              >
                {msg.content.split('\n').map((text, i) => (
                  <React.Fragment key={i}>
                    {text}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2 p-2 border rounded-md bg-card">
        <Button 
          type="button" 
          size="icon"
          variant={isRecording ? "destructive" : "outline"}
          className={cn(
            "transition-all",
            isRecording && "animate-pulse"
          )}
          onClick={toggleRecording}
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 min-h-[40px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button 
          type="button" 
          size="icon"
          variant="default"
          onClick={handleSendMessage}
          className="bg-primary hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
