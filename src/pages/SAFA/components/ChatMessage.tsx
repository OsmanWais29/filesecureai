
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "../types";
import { formatDistanceToNow } from "date-fns";
import { User, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const timestamp = typeof message.timestamp === 'string' 
    ? new Date(message.timestamp) 
    : message.timestamp;

  return (
    <div className={cn(
      "flex items-start gap-4 w-full",
      isUser ? "flex-row-reverse" : ""
    )}>
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarFallback className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex-1 space-y-2",
        isUser ? "text-right" : ""
      )}>
        <div className={cn(
          "inline-block max-w-[80%] rounded-lg p-4",
          isUser 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted"
        )}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
        
        {timestamp && (
          <div className={cn(
            "text-xs text-muted-foreground",
            isUser ? "text-right" : "text-left"
          )}>
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  );
};
