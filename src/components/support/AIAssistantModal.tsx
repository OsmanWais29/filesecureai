
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Loader2, Bot, ArrowUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type MessageType = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
};

export const AIAssistantModal = ({ open, onOpenChange }: AIAssistantModalProps) => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "welcome",
      content: "Hello! I'm your SecureFiles AI support assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "I understand you're having an issue with that. Let me suggest a solution based on our documentation.",
        "That's a good question. From what I can see in our knowledge base, you'll want to navigate to Settings > User Management and adjust the permissions there.",
        "Thanks for bringing this to our attention. This sounds like it might be a bug. Would you like me to create a ticket for our development team?",
        "I'd be happy to help with that! First, could you tell me which specific form you're working with?",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const assistantMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        content: randomResponse,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <DialogTitle>AI Support Assistant</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[80%]",
                message.role === "user" ? "ml-auto" : ""
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-1">
                  <Bot className="h-4 w-4" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={cn(
                  "rounded-lg p-3",
                  message.role === "assistant" 
                    ? "bg-muted text-foreground" 
                    : "bg-primary text-primary-foreground"
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              
              {message.role === "user" && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="h-8 w-8 mt-1">
                <Bot className="h-4 w-4" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-4 bg-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Ask the AI assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="flex justify-center mt-2">
            <p className="text-xs text-muted-foreground flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by SecureFiles AI
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
