
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Users,
  FileText,
  Brain,
  Upload,
  Settings,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'analysis' | 'graph' | 'table';
}

type ActiveTab = 'crm' | 'safa' | 'training';

export const SAFAInterface = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('safa');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m SAFA, your AI assistant for financial analysis and insolvency law. How can I help you today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I understand your query. Let me analyze that for you...',
        role: 'assistant',
        timestamp: new Date()
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

  // Mock data for sidebar
  const safaSessions = [
    { id: '1', title: 'Form 47 Analysis - John Doe', timestamp: '2 hours ago' },
    { id: '2', title: 'Income Verification - Jane Smith', timestamp: 'Yesterday' },
    { id: '3', title: 'Asset Assessment - Bob Johnson', timestamp: '3 days ago' },
  ];

  const clientFiles = [
    { id: '1', name: 'John Doe', status: 'active', lastUpdate: '2h ago' },
    { id: '2', name: 'Jane Smith', status: 'pending', lastUpdate: '1d ago' },
    { id: '3', name: 'Bob Johnson', status: 'completed', lastUpdate: '3d ago' },
  ];

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className={cn(
        "bg-gray-900 text-white transition-all duration-300 flex flex-col",
        sidebarCollapsed ? "w-16" : "w-72"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h1 className="font-semibold">SecureFiles AI</h1>
                <p className="text-xs text-gray-400">Professional Edition</p>
              </div>
            </div>
          )}
          
          <Button
            onClick={() => setMessages([{
              id: Date.now().toString(),
              content: 'Hello! I\'m SAFA, your AI assistant for financial analysis and insolvency law. How can I help you today?',
              role: 'assistant',
              timestamp: new Date()
            }])}
            className={cn(
              "bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white w-full",
              sidebarCollapsed ? "px-2" : "px-4"
            )}
          >
            <Plus className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">New Session</span>}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-2">
          {!sidebarCollapsed ? (
            <div className="space-y-4">
              {/* SAFA Sessions */}
              <div>
                <h3 className="text-xs font-medium text-gray-400 mb-2 px-2">SAFA Sessions</h3>
                <div className="space-y-1">
                  {safaSessions.map(session => (
                    <Button
                      key={session.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2 text-left hover:bg-gray-800"
                    >
                      <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{session.title}</p>
                        <p className="text-xs text-gray-400">{session.timestamp}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Client Files */}
              <div>
                <h3 className="text-xs font-medium text-gray-400 mb-2 px-2">Client Files</h3>
                <div className="space-y-1">
                  {clientFiles.map(client => (
                    <Button
                      key={client.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2 text-left hover:bg-gray-800"
                    >
                      <Users className="h-4 w-4 mr-2 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{client.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {client.status}
                          </Badge>
                          <span className="text-xs text-gray-400">{client.lastUpdate}</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-medium text-gray-400 mb-2 px-2">Quick Actions</h3>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start hover:bg-gray-800">
                    <FileText className="h-4 w-4 mr-2" />
                    Form History
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-gray-800">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button variant="ghost" size="icon" className="w-full hover:bg-gray-800">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-full hover:bg-gray-800">
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-full hover:bg-gray-800">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-full hover:bg-gray-800">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 mb-3">
              <User className="h-6 w-6" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Licensed Trustee</p>
                <p className="text-xs text-gray-400">Ontario, Canada</p>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-gray-800">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <Button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            variant="ghost"
            size="icon"
            className="w-full hover:bg-gray-800"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Tab Switcher */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setActiveTab('crm')}
              variant={activeTab === 'crm' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-full"
            >
              <Users className="h-4 w-4 mr-2" />
              CRM
            </Button>
            <Button
              onClick={() => setActiveTab('safa')}
              variant={activeTab === 'safa' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-full"
            >
              <Brain className="h-4 w-4 mr-2" />
              SAFA
            </Button>
            <Button
              onClick={() => setActiveTab('training')}
              variant={activeTab === 'training' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Training Model
            </Button>
          </div>
        </div>

        {/* Center Panel */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {activeTab === 'safa' && (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-4",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === 'user' 
                          ? "bg-blue-600 text-white rounded-br-sm" 
                          : "bg-white border border-gray-200 rounded-bl-sm"
                      )}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={cn(
                          "text-xs mt-2 opacity-70",
                          message.role === 'user' ? "text-blue-100" : "text-gray-500"
                        )}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>

                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {activeTab === 'crm' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Client Intelligence</h2>
                  <Card className="p-4">
                    <p className="text-gray-600">CRM workspace coming soon...</p>
                  </Card>
                </div>
              )}

              {activeTab === 'training' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Training Model</h2>
                  <Card className="p-4">
                    <p className="text-gray-600">Training workspace coming soon...</p>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Floating Input Footer */}
          {activeTab === 'safa' && (
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end gap-3 p-3 border border-gray-300 rounded-2xl bg-white shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Message SAFA..."
                    className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-gray-400"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  SAFA can make mistakes. Consider checking important information.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
