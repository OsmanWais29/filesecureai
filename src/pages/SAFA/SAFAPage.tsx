
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  FileText, 
  Users, 
  BarChart, 
  Calendar,
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  Shield,
  Zap
} from "lucide-react";

const SAFAPage = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm SAFA, your Smart AI Financial Assistant. I'm here to help you with document analysis, risk assessment, and client management. How can I assist you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const categories = [
    {
      id: "document",
      name: "Document Analysis",
      description: "AI-powered analysis of bankruptcy forms and financial documents",
      icon: FileText,
      color: "bg-blue-500"
    },
    {
      id: "legal", 
      name: "Legal & Regulatory",
      description: "Canadian insolvency law guidance and compliance assistance",
      icon: Shield,
      color: "bg-green-500"
    },
    {
      id: "help",
      name: "Training & Help",
      description: "Interactive guidance and system training assistance",
      icon: Brain,
      color: "bg-purple-500"
    },
    {
      id: "client",
      name: "Client Connect",
      description: "CRM integration and client relationship management",
      icon: Users,
      color: "bg-orange-500"
    }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I understand your request. Let me analyze this for you and provide detailed insights based on the latest Canadian insolvency regulations and best practices.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SAFA
              </h1>
              <p className="text-sm text-gray-600">Smart AI Financial Assistant</p>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your intelligent companion for bankruptcy document analysis, legal guidance, and client management
          </p>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-blue-500" />
                      Chat with SAFA
                      <Badge variant="secondary" className="ml-auto">
                        <Zap className="h-3 w-3 mr-1" />
                        AI Powered
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${
                            message.type === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.type === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                            }`}
                          >
                            {message.type === "user" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div
                            className={`p-3 rounded-lg ${
                              message.type === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask SAFA about document analysis, legal guidance, or client management..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Analyze Form 47
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      BIA Compliance Check
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Client Risk Assessment
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Form 65 Analysis</span>
                        <span className="text-gray-500">2h ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Assessment</span>
                        <span className="text-gray-500">4h ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Client Portfolio Review</span>
                        <span className="text-gray-500">1d ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${category.color} text-white`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      Start Conversation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>AI Prompt Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Document Analysis Template</h3>
                    <p className="text-sm text-gray-600 mb-3">Comprehensive bankruptcy form analysis</p>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Risk Assessment Template</h3>
                    <p className="text-sm text-gray-600 mb-3">Client risk evaluation framework</p>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Conversation History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">Form 47 Analysis Session</h3>
                      <span className="text-sm text-gray-500">Today, 2:30 PM</span>
                    </div>
                    <p className="text-sm text-gray-600">Comprehensive analysis of consumer proposal documentation...</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">Legal Compliance Review</h3>
                      <span className="text-sm text-gray-500">Yesterday, 4:15 PM</span>
                    </div>
                    <p className="text-sm text-gray-600">BIA compliance verification and regulatory guidance...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SAFAPage;
