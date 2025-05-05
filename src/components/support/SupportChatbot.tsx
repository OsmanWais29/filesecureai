
import React, { useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { toast } from "sonner";

interface SupportChatbotProps {
  onClose: () => void;
}

export const SupportChatbot: React.FC<SupportChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = React.useState([
    {
      id: 1,
      content: "Hi there! I'm the SecureFiles AI Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ]);
  
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom when new messages appear
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'm looking into this for you. Our AI is currently analyzing your question and will provide a detailed answer shortly.",
        "Great question! Based on your inquiry, I can see you're looking for help with document management. Let me guide you through the process.",
        "Thank you for asking. SecureFiles AI has several features to help you with this specific issue. First, you'll want to navigate to the Documents section.",
        "I understand your concern. This is a common question, and I'm happy to help. The solution involves a few simple steps that I can walk you through.",
        "I'm checking our knowledge base for the most up-to-date information on this topic. One moment please..."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const botMessage = {
        id: messages.length + 2,
        content: randomResponse,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      toast.success("AI Assistant responded to your question");
    }, 1500);
  };
  
  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Card className="shadow-xl border-primary/20">
        <CardHeader className="bg-primary text-white p-3 flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <h3 className="font-medium">AI Support Assistant</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-white hover:bg-primary-foreground/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`flex gap-2 max-w-[80%] ${
                    message.sender === "user" 
                      ? "flex-row-reverse" 
                      : "flex-row"
                  }`}
                >
                  <Avatar className="h-8 w-8 mt-1">
                    {message.sender === "user" ? (
                      <>
                        <AvatarImage src="/avatar-placeholder.png" />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/bot-avatar.png" />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  
                  <div 
                    className={`rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary/10 text-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.content}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 flex items-center">
                    <span className="typing-indicator">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        <CardFooter className="border-t p-3">
          <form 
            className="flex w-full gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
      
      {/* Replaced the incorrect style tag with proper CSS */}
      <style>
        {`
          .typing-indicator {
            display: flex;
            align-items: center;
            column-gap: 4px;
          }
          
          .dot {
            width: 6px;
            height: 6px;
            background-color: currentColor;
            border-radius: 50%;
            opacity: 0.6;
            animation: bounce 1.5s infinite;
          }
          
          .dot:nth-child(2) {
            animation-delay: 0.2s;
          }
          
          .dot:nth-child(3) {
            animation-delay: 0.4s;
          }
          
          @keyframes bounce {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-4px);
            }
          }
        `}
      </style>
    </div>
  );
};
