
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Clock,
  CheckCheck,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuthState } from '@/hooks/useAuthState';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read_at: string | null;
  created_at: string;
  sender_email?: string;
  recipient_email?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  subject: string;
  last_message_at: string;
  last_message: string;
  other_participant_email: string;
  unread_count: number;
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthState();

  // Mock data for conversations
  const mockConversations: Conversation[] = [
    {
      id: '1',
      participants: ['user1', 'user2'],
      subject: 'Case Review - John Doe',
      last_message_at: '2024-01-15T10:30:00Z',
      last_message: 'Please review the updated documentation.',
      other_participant_email: 'trustee.smith@example.com',
      unread_count: 2
    },
    {
      id: '2',
      participants: ['user1', 'user3'],
      subject: 'Compliance Update Required',
      last_message_at: '2024-01-14T15:45:00Z',
      last_message: 'The OSB has requested additional information.',
      other_participant_email: 'jane.williams@example.com',
      unread_count: 0
    },
    {
      id: '3',
      participants: ['user1', 'user4'],
      subject: 'Client Meeting Follow-up',
      last_message_at: '2024-01-13T09:15:00Z',
      last_message: 'Meeting scheduled for next Tuesday at 2 PM.',
      other_participant_email: 'robert.davis@example.com',
      unread_count: 1
    }
  ];

  // Mock data for messages
  const mockMessages: Message[] = [
    {
      id: '1',
      sender_id: 'user2',
      recipient_id: 'user1',
      subject: 'Case Review - John Doe',
      content: 'Hi, I\'ve reviewed the case files for John Doe. The documentation looks complete, but we need to verify the income statements.',
      read_at: null,
      created_at: '2024-01-15T08:30:00Z',
      sender_email: 'trustee.smith@example.com'
    },
    {
      id: '2',
      sender_id: 'user1',
      recipient_id: 'user2',
      subject: 'Re: Case Review - John Doe',
      content: 'Thanks for the review. I\'ll request the updated income statements from the client today.',
      read_at: '2024-01-15T09:00:00Z',
      created_at: '2024-01-15T09:00:00Z',
      sender_email: user?.email || 'current.user@example.com'
    },
    {
      id: '3',
      sender_id: 'user2',
      recipient_id: 'user1',
      subject: 'Re: Case Review - John Doe',
      content: 'Perfect. Also, please review the updated documentation I uploaded to the client\'s folder.',
      read_at: null,
      created_at: '2024-01-15T10:30:00Z',
      sender_email: 'trustee.smith@example.com'
    }
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // For now, use mock data
      setConversations(mockConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversations"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // For now, use mock data
      if (conversationId === '1') {
        setMessages(mockMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      // Mock sending message
      const newMsg: Message = {
        id: Date.now().toString(),
        sender_id: user?.id || 'current-user',
        recipient_id: 'recipient',
        subject: 'New Message',
        content: newMessage,
        read_at: null,
        created_at: new Date().toISOString(),
        sender_email: user?.email || 'current.user@example.com'
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      toast({
        title: "Message Sent",
        description: "Your message has been delivered successfully."
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase()).join('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_participant_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        {/* Conversations Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <Button 
                size="sm" 
                onClick={() => setShowNewMessage(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                    selectedConversation === conversation.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(conversation.other_participant_email)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.other_participant_email}
                        </p>
                        <div className="flex items-center space-x-1">
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-700 truncate mb-1">
                        {conversation.subject}
                      </p>
                      
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Message View */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Message Header */}
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(conversations.find(c => c.id === selectedConversation)?.other_participant_email || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {conversations.find(c => c.id === selectedConversation)?.other_participant_email}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {conversations.find(c => c.id === selectedConversation)?.subject}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isCurrentUser = message.sender_email === user?.email;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`p-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          
                          <div className={`flex items-center mt-1 space-x-2 ${
                            isCurrentUser ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.created_at)}
                            </span>
                            {isCurrentUser && (
                              <div className="text-gray-400">
                                {message.read_at ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[44px] max-h-32 resize-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
