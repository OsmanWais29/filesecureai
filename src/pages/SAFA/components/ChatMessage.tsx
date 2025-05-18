
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "../types";
import { formatDistanceToNow } from "date-fns";
import { User, Bot, Check, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.type === "user";
  const timestamp = typeof message.timestamp === 'string' 
    ? new Date(message.timestamp) 
    : message.timestamp;

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-full py-2 px-1",
        isUser ? "flex-row-reverse" : ""
      )}
    >
      <Avatar className={cn(
        "h-8 w-8 shrink-0",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
        <AvatarFallback>
          {isUser ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      
      <Card
        className={cn(
          "p-4 max-w-[85%]",
          isUser 
            ? "bg-primary text-primary-foreground border-primary" 
            : "bg-muted border-muted-foreground/10"
        )}
      >
        <div className="space-y-2">
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          {timestamp && (
            <div className="flex items-center gap-1">
              <div className={cn(
                "text-xs opacity-70 flex items-center gap-1",
                isUser ? "text-primary-foreground" : "text-muted-foreground"
              )}>
                {isUser ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {formatDistanceToNow(timestamp, { addSuffix: true })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
