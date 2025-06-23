
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, 
  MessageSquare, 
  Share2, 
  Clock, 
  Eye,
  Edit3,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'viewing' | 'editing' | 'commenting';
  lastSeen: Date;
}

interface CollaborationToolbarProps {
  documentId: string;
  currentUsers?: CollaborationUser[];
  onStartCollaboration?: () => void;
  onShareDocument?: () => void;
}

export const CollaborationToolbar: React.FC<CollaborationToolbarProps> = ({
  documentId,
  currentUsers = [],
  onStartCollaboration,
  onShareDocument
}) => {
  const [isCollaborating, setIsCollaborating] = useState(false);
  
  // Mock users for demonstration
  const mockUsers: CollaborationUser[] = currentUsers.length > 0 ? currentUsers : [
    {
      id: '1',
      name: 'Sarah Wilson',
      status: 'viewing',
      lastSeen: new Date()
    },
    {
      id: '2', 
      name: 'Mike Chen',
      status: 'commenting',
      lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'viewing': return <Eye className="h-3 w-3" />;
      case 'editing': return <Edit3 className="h-3 w-3" />;
      case 'commenting': return <MessageSquare className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'viewing': return 'bg-blue-100 text-blue-700';
      case 'editing': return 'bg-green-100 text-green-700';
      case 'commenting': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStartCollaboration = () => {
    setIsCollaborating(!isCollaborating);
    onStartCollaboration?.();
    
    toast.success(isCollaborating ? 'Collaboration ended' : 'Collaboration started', {
      description: isCollaborating ? 'Real-time updates disabled' : 'Real-time updates enabled'
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/document/${documentId}`);
    onShareDocument?.();
    
    toast.success('Document link copied', {
      description: 'Share this link with team members'
    });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-card border-b">
      {/* Active Users */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {mockUsers.length} active
          </span>
        </div>
        
        <div className="flex items-center -space-x-2">
          {mockUsers.slice(0, 3).map((user) => (
            <TooltipProvider key={user.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-background ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getStatusIcon(user.status)}
                      <span className="text-xs capitalize">{user.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last seen: {user.lastSeen.toLocaleTimeString()}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {mockUsers.length > 3 && (
            <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium">+{mockUsers.length - 3}</span>
            </div>
          )}
        </div>
      </div>

      {/* Collaboration Controls */}
      <div className="flex items-center gap-2">
        {isCollaborating && (
          <Badge variant="secondary" className="gap-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </Badge>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartCollaboration}
          className="gap-1"
        >
          <CheckSquare className="h-4 w-4" />
          {isCollaborating ? 'End Session' : 'Collaborate'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-1"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
};
