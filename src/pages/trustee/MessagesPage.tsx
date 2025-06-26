
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Search, Plus, Users, Clock } from 'lucide-react';
import { toast } from "sonner";

const TrusteeMessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior Trustee",
      avatar: "/api/placeholder/32/32",
      lastMessage: "Can you help me with the Johnson case?",
      timestamp: "2 hours ago",
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Trustee",
      avatar: "/api/placeholder/32/32",
      lastMessage: "The documents have been reviewed",
      timestamp: "5 hours ago",
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: "Lisa Davis",
      role: "Junior Trustee",
      avatar: "/api/placeholder/32/32",
      lastMessage: "Meeting scheduled for tomorrow",
      timestamp: "1 day ago",
      unread: 1,
      online: true
    }
  ];

  const messages = selectedConversation ? [
    {
      id: 1,
      sender: "Sarah Johnson",
      content: "Hi, I need some assistance with the Johnson bankruptcy case. Can we discuss the asset valuation?",
      timestamp: "10:30 AM",
      isMe: false
    },
    {
      id: 2,
      sender: "You",
      content: "Of course! I reviewed the case yesterday. The property valuation seems accurate, but we should double-check the business assets.",
      timestamp: "10:35 AM",
      isMe: true
    },
    {
      id: 3,
      sender: "Sarah Johnson",
      content: "That's exactly what I was thinking. Could you help me with the business evaluation tomorrow?",
      timestamp: "10:40 AM",
      isMe: false
    }
  ] : [];

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!selectedConversation) {
      toast.error("Please select a conversation");
      return;
    }

    toast.success("Message sent");
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6 h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Trustee Messages
          </h1>
          <p className="text-gray-600 mt-1">Communicate with your team members</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Conversations
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 border-b transition-colors ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.avatar} alt={conversation.name} />
                          <AvatarFallback>
                            {conversation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                          <div className="flex items-center gap-2">
                            {conversation.unread > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {conversation.timestamp}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{conversation.role}</p>
                        <p className="text-sm text-gray-500 truncate mt-1">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversations.find(c => c.id === selectedConversation)?.avatar} />
                      <AvatarFallback>
                        {conversations.find(c => c.id === selectedConversation)?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{conversations.find(c => c.id === selectedConversation)?.name}</h3>
                      <p className="text-sm text-gray-600">{conversations.find(c => c.id === selectedConversation)?.role}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isMe
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 min-h-[60px] resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} className="self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrusteeMessagesPage;
