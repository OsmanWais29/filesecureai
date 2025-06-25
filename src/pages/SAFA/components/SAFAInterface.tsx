
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Send, 
  MessageSquare,
  Users,
  FileText,
  BookOpen,
  BarChart3,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  module: 'CRM' | 'SAFA' | 'Training';
}

export const SAFAInterface = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'CRM' | 'SAFA' | 'Training'>('SAFA');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to SecureFiles AI Assistant! I\'m here to help you with financial analysis, client management, and insolvency law guidance.',
      role: 'assistant',
      timestamp: new Date(),
      module: 'SAFA'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const conversationHistory = [
    { id: '1', title: 'Form 47 Analysis - John Doe', time: '2 hours ago', module: 'SAFA' },
    { id: '2', title: 'Client Income Review', time: '1 day ago', module: 'CRM' },
    { id: '3', title: 'OSB Compliance Check', time: '2 days ago', module: 'Training' },
    { id: '4', title: 'Surplus Income Calculation', time: '3 days ago', module: 'SAFA' },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
      module: activeTab
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(activeTab, inputMessage),
        role: 'assistant',
        timestamp: new Date(),
        module: activeTab
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInputMessage('');
  };

  const getAIResponse = (module: string, input: string) => {
    switch (module) {
      case 'CRM':
        return `I'll help you with client management. Based on your query about "${input}", I can assist with contact updates, meeting logs, and client file organization.`;
      case 'SAFA':
        return `Analyzing your financial query: "${input}". I'll review the relevant forms, calculate surplus income, and identify any inconsistencies in the financial data.`;
      case 'Training':
        return `I'm learning from your input: "${input}". This will help improve my accuracy in form recognition and insolvency law interpretation.`;
      default:
        return 'How can I assist you today?';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar */}
      <div className={cn(
        "bg-gray-900 text-white transition-all duration-300 flex-shrink-0 flex flex-col",
        sidebarCollapsed ? "w-12" : "w-64"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">SecureFiles AI</h2>
                <p className="text-xs text-gray-400">Financial Assistant</p>
              </div>
            </div>
          )}
          
          <Button
            onClick={() => setMessages([{
              id: Date.now().toString(),
              content: 'New conversation started. How can I help you today?',
              role: 'assistant',
              timestamp: new Date(),
              module: activeTab
            }])}
            className={cn(
              "bg-gray-800 hover:bg-gray-700 text-white border-gray-600",
              sidebarCollapsed ? "w-8 h-8 p-0" : "w-full"
            )}
          >
            <Plus className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">New Session</span>}
          </Button>
        </div>

        {/* Conversation History */}
        <ScrollArea className="flex-1 p-2">
          {!sidebarCollapsed && (
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-gray-400 px-2 mb-2">Recent Sessions</h3>
              {conversationHistory.map((conv) => (
                <Button
                  key={conv.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-2 text-gray-300 hover:bg-gray-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{conv.title}</p>
                    <p className="text-xs text-gray-500">{conv.time}</p>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Navigation Icons */}
        <div className="p-2 border-t border-gray-700">
          {sidebarCollapsed ? (
            <div className="space-y-2">
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-300">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-300">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-300">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm">Client Files</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800">
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-sm">Form History</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 rounded-full border border-gray-600 bg-gray-900 hover:bg-gray-800 w-6 h-6"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Tab Switcher */}
        <div className="border-b bg-background px-6 py-3">
          <div className="flex items-center justify-center">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(['CRM', 'SAFA', 'Training'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-all",
                    activeTab === tab 
                      ? "bg-white dark:bg-gray-700 shadow-sm" 
                      : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {tab === 'CRM' && <Users className="h-4 w-4 mr-2" />}
                  {tab === 'SAFA' && <BarChart3 className="h-4 w-4 mr-2" />}
                  {tab === 'Training' && <BookOpen className="h-4 w-4 mr-2" />}
                  {tab}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.filter(msg => msg.module === activeTab).map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 bg-green-600">
                    <AvatarFallback className="bg-green-600 text-white text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-2xl rounded-lg px-4 py-3",
                  message.role === 'user' 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 dark:bg-gray-800 text-foreground border"
                )}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-2",
                    message.role === 'user' ? "text-blue-100" : "text-muted-foreground"
                  )}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 bg-blue-600">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      U
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-background p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${activeTab} something...`}
                  className="min-h-[44px] resize-none border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="h-[44px] px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {activeTab === 'SAFA' && (
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-xs">
                  Generate Summary
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Compare to CRA
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Flag Income Issues
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
