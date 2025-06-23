
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  MessageCircle, 
  Eye, 
  Edit, 
  MousePointer,
  Video,
  Phone,
  Share,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentAction: 'viewing' | 'editing' | 'commenting' | 'idle';
  location: string;
  lastActive: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system' | 'mention';
}

export const RealtimeCollaboration = ({ documentId }: { documentId?: string }) => {
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@trustee.com',
      status: 'online',
      currentAction: 'editing',
      location: 'Document Analysis Section',
      lastActive: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      email: 'mike.r@firm.com',
      status: 'online',
      currentAction: 'viewing',
      location: 'Risk Assessment Tab',
      lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Emma Wilson',
      email: 'emma.w@admin.com',
      status: 'away',
      currentAction: 'idle',
      location: 'Dashboard',
      lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '1',
      message: 'I\'m reviewing the risk assessment now',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      type: 'text'
    },
    {
      id: '2',
      userId: 'system',
      message: 'Mike Rodriguez joined the collaboration',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      type: 'system'
    },
    {
      id: '3',
      userId: '2',
      message: 'The compliance section looks good to me',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      type: 'text'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'editing': return <Edit className="h-3 w-3" />;
      case 'viewing': return <Eye className="h-3 w-3" />;
      case 'commenting': return <MessageCircle className="h-3 w-3" />;
      default: return <MousePointer className="h-3 w-3" />;
    }
  };

  const getUserByMessage = (userId: string) => {
    return activeUsers.find(user => user.id === userId);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: '1', // Current user
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    toast.success('Message sent');
  };

  const startVideoCall = () => {
    setIsVideoCallActive(true);
    toast.success('Video call started');
  };

  const shareScreen = () => {
    toast.success('Screen sharing initiated');
  };

  return (
    <div className="space-y-6">
      {/* Active Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Collaborators ({activeUsers.filter(u => u.status === 'online').length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{user.name}</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getActionIcon(user.currentAction)}
                      {user.currentAction}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.location} • {user.status}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(user.lastActive).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startVideoCall}
              className={isVideoCallActive ? 'bg-green-100' : ''}
            >
              <Video className="h-4 w-4 mr-2" />
              {isVideoCallActive ? 'Video Call Active' : 'Start Video Call'}
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Audio Call
            </Button>
            <Button variant="outline" size="sm" onClick={shareScreen}>
              <Share className="h-4 w-4 mr-2" />
              Share Screen
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Discussion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Team Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-64 w-full pr-4">
            <div className="space-y-3">
              {chatMessages.map((message) => {
                const user = getUserByMessage(message.userId);
                const isSystem = message.type === 'system';
                
                return (
                  <div key={message.id} className={`flex gap-3 ${isSystem ? 'justify-center' : ''}`}>
                    {!isSystem && user && (
                      <Avatar className="h-6 w-6 mt-1">
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex-1 ${isSystem ? 'text-center' : ''}`}>
                      {!isSystem && user && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      <div className={`text-sm ${isSystem ? 'text-muted-foreground italic' : 'bg-muted p-2 rounded-lg'}`}>
                        {message.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Cursors Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>Live Document Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Sarah is editing the risk assessment section</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Mike is reviewing compliance requirements</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Emma was last active 15 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
