
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Send, 
  Loader2, 
  Bot, 
  User,
  AlertTriangle,
  CheckCircle,
  FileText,
  Upload,
  Sparkles,
} from "lucide-react";
import { ChatMessage } from "../types";
import { SAFAModule } from "./SAFANavigationSidebar";

interface SAFAConversationPanelProps {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isProcessing: boolean;
  activeModule: SAFAModule;
  estateName: string;
}

const suggestedPrompts: Record<SAFAModule, string[]> = {
  overview: [
    "Show estate summary",
    "What needs my attention?",
    "List upcoming deadlines",
  ],
  documents: [
    "Upload and analyze document",
    "Find missing forms",
    "Generate Form 31",
  ],
  creditors: [
    "Import creditors from Statement of Affairs",
    "Show missing proofs of claim",
    "List creditors by priority",
  ],
  claims: [
    "Show claims needing verification",
    "Why is this claim flagged?",
    "Calculate dividend distribution",
  ],
  meetings: [
    "Prepare Meeting of Creditors",
    "Generate meeting notice",
    "Show voting summary",
  ],
  distributions: [
    "Simulate dividend distribution",
    "Generate Form 35",
    "Show distribution priorities",
  ],
  "osb-forms": [
    "List required forms",
    "Prepare Form 31 for CRA",
    "Check form validation status",
  ],
};

export const SAFAConversationPanel: React.FC<SAFAConversationPanelProps> = ({
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleKeyPress,
  isProcessing,
  activeModule,
  estateName,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const prompts = suggestedPrompts[activeModule] || suggestedPrompts.overview;

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <WelcomeScreen 
              estateName={estateName}
              activeModule={activeModule}
              prompts={prompts}
              onPromptClick={(prompt) => {
                setInputMessage(prompt);
              }}
            />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isProcessing && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        SAFA is analyzing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card p-4">
        <div className="max-w-3xl mx-auto">
          {/* Quick Prompts */}
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {prompts.slice(0, 3).map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInputMessage(prompt)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {prompt}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="relative">
            <Textarea
              placeholder={`Ask SAFA about ${activeModule}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-[60px] pr-24 resize-none"
              disabled={isProcessing}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            All conversations are logged and linked to this estate for compliance
          </p>
        </div>
      </div>
    </div>
  );
};

const WelcomeScreen: React.FC<{
  estateName: string;
  activeModule: SAFAModule;
  prompts: string[];
  onPromptClick: (prompt: string) => void;
}> = ({ estateName, activeModule, prompts, onPromptClick }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
      <Bot className="h-8 w-8 text-primary" />
    </div>
    <h2 className="text-xl font-semibold mb-2">
      Welcome to SAFA
    </h2>
    <p className="text-muted-foreground mb-1">
      Smart AI Financial Assistant
    </p>
    {estateName && (
      <Badge variant="secondary" className="mb-6">
        Estate: {estateName}
      </Badge>
    )}
    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
      I'm your command-driven operational assistant. Ask me to import creditors, 
      review claims, generate forms, or explain SAFA signals.
    </p>
    
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
      {prompts.map((prompt, idx) => (
        <Card
          key={idx}
          className="p-4 cursor-pointer hover:bg-accent transition-colors text-left"
          onClick={() => onPromptClick(prompt)}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5" />
            <span className="text-sm">{prompt}</span>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === "user";
  const isAlert = message.content.includes("⚠️") || message.content.includes("SAFA Alert");

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary" : isAlert ? "bg-destructive/10" : "bg-primary/10"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : isAlert ? (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>
      <div
        className={`flex-1 max-w-[80%] rounded-lg p-4 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : isAlert
            ? "bg-destructive/10 border border-destructive/20"
            : "bg-muted"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        <div className={`text-xs mt-2 ${isUser ? "opacity-70" : "text-muted-foreground"}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
