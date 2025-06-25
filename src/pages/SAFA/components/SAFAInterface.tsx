
import React, { useState } from "react";
import SAFAHeader from "./SAFAHeader";
import SAFASidebar from "./Sidebar/SAFASidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Paperclip, 
  Mic, 
  MoreHorizontal,
  User,
  Bot,
  TrendingUp,
  FileText,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export const SAFAInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'crm' | 'safa' | 'training'>('safa');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m SAFA, your AI assistant for financial analysis and bankruptcy law. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const tabs = [
    { id: 'crm', label: 'CRM', description: 'Client Intelligence' },
    { id: 'safa', label: 'SAFA', description: 'Financial Analysis' },
    { id: 'training', label: 'Training Model', description: 'AI Learning' },
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you're asking about: "${inputValue}". Let me analyze this for you based on Canadian insolvency law and your case data.`,
        timestamp: new Date(),
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'crm':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Updated contact info for John Doe</p>
                <p className="text-sm text-blue-700">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">AI detected missing SIN in Form 2</p>
                <p className="text-sm text-orange-700">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Meeting logged: May 30 with debtor</p>
                <p className="text-sm text-green-700">1 day ago</p>
              </div>
            </div>
          </div>
        );
      case 'training':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Bot className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Model retrained on Form 31 from Jane Smith</p>
                <p className="text-sm text-purple-700">30 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="font-medium text-indigo-900">Trustee corrected auto-mapping of 'Total Monthly Income'</p>
                <p className="text-sm text-indigo-700">2 hours ago</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-6 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 max-w-4xl",
                    message.type === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={cn(
                      message.type === 'user' 
                        ? "bg-blue-500 text-white" 
                        : "bg-green-500 text-white"
                    )}>
                      {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "flex-1 space-y-2",
                    message.type === 'user' ? "text-right" : ""
                  )}>
                    <div className={cn(
                      "inline-block p-4 rounded-lg max-w-3xl",
                      message.type === 'user'
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900 border"
                    )}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        );
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <SAFASidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <SAFAHeader toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Tab Switcher */}
        <div className="border-b bg-white px-6 py-3">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="gap-2"
              >
                {tab.label}
                {activeTab === tab.id && (
                  <Badge variant="secondary" className="text-xs">
                    {tab.description}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white">
          {renderTabContent()}
        </div>

        {/* Floating Input (only for SAFA tab) */}
        {activeTab === 'safa' && (
          <div className="border-t bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3 bg-gray-50 rounded-lg p-3">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Ask SAFA something..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-0 bg-transparent focus-visible:ring-0 text-sm"
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
