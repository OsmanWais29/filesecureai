
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  GraduationCap, 
  Plus,
  FileText,
  Brain,
  TrendingUp
} from "lucide-react";
import { useConversations } from "../hooks/useConversations";
import { ConversationView } from "./ConversationView";
import { TrainingPanel } from "./Sidebar/TrainingPanel";
import { TabType } from "../types";

export const SAFAInterface = () => {
  const [activeTab, setActiveTab] = useState<TabType>('document');
  const [inputMessage, setInputMessage] = useState("");
  
  const { 
    categoryMessages, 
    handleSendMessage, 
    isProcessing, 
    loadConversationHistory 
  } = useConversations(activeTab);

  // Load conversation history when tab changes
  useEffect(() => {
    loadConversationHistory(activeTab);
  }, [activeTab, loadConversationHistory]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim()) {
        handleSendMessage(inputMessage);
        setInputMessage("");
      }
    }
  };

  const handleSend = () => {
    if (inputMessage.trim()) {
      handleSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const getMessagesForTab = () => {
    return categoryMessages[activeTab] || [];
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'document':
        return 'AI-powered document analysis and form processing';
      case 'legal':
        return 'Legal compliance and regulatory guidance';
      case 'help':
        return 'Training and assistance with the platform';
      case 'client':
        return 'Client relationship management and insights';
      default:
        return 'Intelligent assistant for your needs';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Tab Switcher */}
      <div className="border-b bg-card p-4">
        <Tabs value={activeTab} onValueChange={(value: TabType) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document AI
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Legal AI
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Training & Help
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Client Connect
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-card flex flex-col">
          <div className="p-4">
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div>
          
          <div className="flex-1 px-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Sessions</h3>
              <div className="space-y-1">
                <div className="p-2 rounded-md hover:bg-accent cursor-pointer">
                  <div className="text-sm font-medium">Document Analysis</div>
                  <div className="text-xs text-muted-foreground">Form 47 Review</div>
                </div>
                <div className="p-2 rounded-md hover:bg-accent cursor-pointer">
                  <div className="text-sm font-medium">Risk Assessment</div>
                  <div className="text-xs text-muted-foreground">Compliance Check</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </div>

          {/* Training Panel for Help Tab */}
          {activeTab === 'help' && (
            <div className="border-t">
              <TrainingPanel />
            </div>
          )}
        </div>

        {/* Center Panel - Main Chat/Content */}
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold capitalize">{activeTab} Assistant</h2>
              <p className="text-sm text-muted-foreground">{getTabDescription()}</p>
            </div>
          </div>
          
          <ConversationView
            messages={getMessagesForTab()}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSend}
            handleKeyPress={handleKeyPress}
            isProcessing={isProcessing}
          />
        </div>

        {/* Right Panel - Context */}
        <div className="w-80 border-l bg-card p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="secondary" className="capitalize">
                <MessageSquare className="h-3 w-3 mr-1" />
                {activeTab} Mode
              </Badge>
              {activeTab === 'document' && (
                <Badge variant="secondary">
                  <FileText className="h-3 w-3 mr-1" />
                  Ready for Analysis
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Assistant Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Messages Today:</span>
                <span className="font-medium">{getMessagesForTab().length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Sessions:</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-green-600">
                  {isProcessing ? 'Processing...' : 'Ready'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Training Status for Help Tab */}
          {activeTab === 'help' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Training Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Documents Trained:</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex justify-between">
                  <span>Model Accuracy:</span>
                  <span className="font-medium text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
