
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "../types";
import { formatDistanceToNow } from "date-fns";
import { User, Bot } from "lucide-react";

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
        "flex items-start gap-3 w-full",
        isUser ? "flex-row-reverse" : ""
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full h-8 w-8 shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <Card
        className={cn(
          "p-4 max-w-[80%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <div className="space-y-2">
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          {timestamp && (
            <div className={cn(
              "text-xs opacity-70",
              isUser ? "text-primary-foreground" : "text-muted-foreground"
            )}>
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
