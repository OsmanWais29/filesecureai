
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, FileCheck, Sparkles } from "lucide-react";

import { ChatPanel } from "./components/ChatPanel";
import { VerificationPanel } from "./components/VerificationPanel";
import { StatsSidebar } from "./components/StatsSidebar";
import { useVerificationData } from "./hooks/useVerificationData";
import { useChatMessages } from "./hooks/useChatMessages";

interface TrusteeCoPliotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
}

export const TrusteeCoPliotModal = ({
  open,
  onOpenChange,
  clientId
}: TrusteeCoPliotModalProps) => {
  const { completionPercentage, chatMessages } = useChatMessages();
  const { verificationData } = useVerificationData();
  
  // Set the default tab directly based on chat messages
  const [activeTab, setActiveTab] = useState<string>(
    chatMessages.length > 0 ? "conversation" : "verification"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <Bot className="h-5 w-5" />
            </div>
            TrusteeCo-Pilot Assistant
            <Badge variant="outline" className="ml-2 bg-white/20 border-white/30 text-white flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* Left Panel - Chat & Verification */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-4 pt-4 border-b">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger 
                    value="conversation" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
                    disabled={chatMessages.length === 0}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Conversation
                  </TabsTrigger>
                  <TabsTrigger 
                    value="verification" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
                  >
                    <FileCheck className="h-4 w-4" />
                    Verification
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Only render the conversation tab content if there are messages */}
              {chatMessages.length > 0 && (
                <TabsContent 
                  value="conversation" 
                  className="flex-1 flex flex-col overflow-hidden mt-0 p-0"
                >
                  <div className="flex-1 flex flex-col overflow-hidden pt-4 px-4 pb-4">
                    <ChatPanel />
                  </div>
                </TabsContent>
              )}

              <TabsContent 
                value="verification" 
                className="flex-1 overflow-y-auto m-0 p-0"
              >
                <VerificationPanel verificationData={verificationData} />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Panel - Stats & Info */}
          <StatsSidebar 
            completionPercentage={completionPercentage}
            stats={verificationData.stats}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
