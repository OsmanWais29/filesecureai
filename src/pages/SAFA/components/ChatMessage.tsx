
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "../types";
import { formatDistanceToNow } from "date-fns";
import { User, MessageSquare } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const timestamp = typeof message.timestamp === 'string' 
    ? new Date(message.timestamp) 
    : message.timestamp;

  return (
    <div className={cn("flex items-start gap-4 w-full group", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shrink-0">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={cn("flex flex-col space-y-2 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">
            {isUser ? "You" : "SecureFiles AI"}
          </span>
          {timestamp && (
            <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
          )}
        </div>
        
        <div className={cn(
          "px-6 py-4 rounded-3xl text-gray-800 leading-relaxed whitespace-pre-wrap max-w-none",
          isUser 
            ? "bg-green-600 text-white rounded-br-lg" 
            : "bg-gray-100 rounded-bl-lg"
        )}>
          {message.content}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};
