
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "../types";
import { formatDistanceToNow } from "date-fns";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const timestamp = typeof message.timestamp === 'string' 
    ? new Date(message.timestamp) 
    : message.timestamp;

  return (
    <div className="flex items-start gap-4 w-full">
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-gray-800 text-white" : "bg-green-600 text-white"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      
      {/* Message Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {isUser ? "You" : "SecureFiles AI"}
          </span>
          {timestamp && (
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};
