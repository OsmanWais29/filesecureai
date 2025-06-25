
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  GraduationCap, 
  Send, 
  Plus,
  FileText,
  Brain,
  TrendingUp
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  module: string;
}

export const SAFAInterface = () => {
  const [activeTab, setActiveTab] = useState<'crf' | 'safa' | 'training'>('safa');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to SecureFiles AI Assistant. How can I help you analyze your financial documents today?',
      role: 'assistant',
      timestamp: new Date(),
      module: 'safa'
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
      module: activeTab
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you need help with "${inputMessage}". Let me analyze that for you...`,
        role: 'assistant',
        timestamp: new Date(),
        module: activeTab
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Tab Switcher */}
      <div className="border-b bg-card p-4">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="crf" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              CRM
            </TabsTrigger>
            <TabsTrigger value="safa" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              SAFA
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Training Model
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-card p-4 flex flex-col">
          <div className="mb-4">
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Recent Sessions</h3>
            <div className="space-y-1">
              <div className="p-2 rounded-md hover:bg-accent cursor-pointer">
                <div className="text-sm font-medium">Client Analysis #1</div>
                <div className="text-xs text-muted-foreground">2 hours ago</div>
              </div>
              <div className="p-2 rounded-md hover:bg-accent cursor-pointer">
                <div className="text-sm font-medium">Form 47 Review</div>
                <div className="text-xs text-muted-foreground">Yesterday</div>
              </div>
              <div className="p-2 rounded-md hover:bg-accent cursor-pointer">
                <div className="text-sm font-medium">Risk Assessment</div>
                <div className="text-xs text-muted-foreground">2 days ago</div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
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

        {/* Center Panel - Main Chat/Content */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Floating Input */}
          <div className="border-t bg-background p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Ask SAFA something..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (Optional Context) */}
        <div className="w-80 border-l bg-card p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="secondary">
                <FileText className="h-3 w-3 mr-1" />
                Form 47 Active
              </Badge>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                Client: John Doe
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Documents Analyzed:</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Flags:</span>
                <span className="font-medium text-orange-600">3</span>
              </div>
              <div className="flex justify-between">
                <span>Compliance Score:</span>
                <span className="font-medium text-green-600">94%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
