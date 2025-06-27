
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Plus, Users, MessageSquare } from 'lucide-react';

interface Trustee {
  id: string;
  name: string;
  jobTitle: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

const MessagesPage = () => {
  const [selectedTrustee, setSelectedTrustee] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in a real app, this would come from your database
  const trustees: Trustee[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      jobTitle: 'Senior Trustee',
      status: 'online',
      lastMessage: 'Thanks for the update on the Form 47 review',
      lastMessageTime: '2 min ago',
      unreadCount: 2
    },
    {
      id: '2',
      name: 'Michael Chen',
      jobTitle: 'Bankruptcy Administrator',
      status: 'away',
      lastMessage: 'The client documentation looks complete',
      lastMessageTime: '15 min ago'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      jobTitle: 'Compliance Officer',
      status: 'online',
      lastMessage: 'Can you review the risk assessment?',
      lastMessageTime: '1 hour ago',
      unreadCount: 1
    },
    {
      id: '4',
      name: 'David Thompson',
      jobTitle: 'Case Manager',
      status: 'offline',
      lastMessage: 'Meeting scheduled for tomorrow at 2 PM',
      lastMessageTime: '3 hours ago'
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      senderId: '1',
      content: 'Hi, I need to discuss the compliance requirements for the new client case.',
      timestamp: '10:30 AM',
      isRead: true
    },
    {
      id: '2',
      senderId: 'current',
      content: 'Sure, I can help with that. Which specific requirements are you concerned about?',
      timestamp: '10:32 AM',
      isRead: true
    },
    {
      id: '3',
      senderId: '1',
      content: 'Thanks for the update on the Form 47 review',
      timestamp: '10:35 AM',
      isRead: false
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedTrustee) {
      // In a real app, this would send the message to your backend
      console.log('Sending message:', newMessage, 'to:', selectedTrustee);
      setNewMessage('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const filteredTrustees = trustees.filter(trustee =>
    trustee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trustee.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTrusteeData = trustees.find(t => t.id === selectedTrustee);

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        {/* Sidebar - Trustees List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search trustees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredTrustees.map((trustee) => (
                <div
                  key={trustee.id}
                  onClick={() => setSelectedTrustee(trustee.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedTrustee === trustee.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={trustee.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {trustee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(trustee.status)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">{trustee.name}</h3>
                        {trustee.unreadCount && (
                          <Badge variant="default" className="bg-blue-600 text-xs">
                            {trustee.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{trustee.jobTitle}</p>
                      {trustee.lastMessage && (
                        <>
                          <p className="text-sm text-gray-500 truncate">{trustee.lastMessage}</p>
                          <p className="text-xs text-gray-400 mt-1">{trustee.lastMessageTime}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedTrustee ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedTrusteeData?.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {selectedTrusteeData?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedTrusteeData?.name}</h2>
                    <p className="text-sm text-gray-600">{selectedTrusteeData?.jobTitle}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedTrusteeData?.status || 'offline')}`} />
                    <span className="text-sm text-gray-500 capitalize">{selectedTrusteeData?.status}</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'current' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 'current'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'current' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Trustee</h3>
                <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
