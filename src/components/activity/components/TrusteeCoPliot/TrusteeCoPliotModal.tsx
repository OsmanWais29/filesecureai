
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, FileCheck } from "lucide-react";

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
  
  // Set the default tab directly based on chat messages - no useEffect needed
  const [activeTab, setActiveTab] = useState<string>(
    chatMessages.length > 0 ? "conversation" : "verification"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> 
            TrusteeCo-Pilot Assistant
            <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
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
                  <TabsTrigger value="conversation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Conversation
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Verification
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Only render the conversation tab content if there are messages */}
              <TabsContent 
                value="conversation" 
                className="flex-1 flex flex-col overflow-hidden mt-0 p-0"
              >
                {chatMessages.length > 0 ? (
                  <div className="flex-1 flex flex-col overflow-hidden pt-4 px-4 pb-4">
                    <ChatPanel />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8 text-center">
                    <div className="max-w-md">
                      <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No conversation started</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use the form below to ask questions about this client's data and receive AI-powered assistance.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

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
