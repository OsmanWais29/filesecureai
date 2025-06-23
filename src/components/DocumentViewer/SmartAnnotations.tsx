
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Plus, 
  Reply, 
  Resolve, 
  AlertTriangle,
  CheckCircle,
  Clock,
  AtSign
} from 'lucide-react';
import { toast } from 'sonner';

interface Annotation {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  position: { x: number; y: number };
  status: 'open' | 'resolved';
  type: 'comment' | 'suggestion' | 'question';
  mentions?: string[];
  replies?: Annotation[];
}

interface SmartAnnotationsProps {
  documentId: string;
  annotations?: Annotation[];
  onAnnotationAdd?: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  onAnnotationResolve?: (annotationId: string) => void;
}

export const SmartAnnotations: React.FC<SmartAnnotationsProps> = ({
  documentId,
  annotations = [],
  onAnnotationAdd,
  onAnnotationResolve
}) => {
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedType, setSelectedType] = useState<'comment' | 'suggestion' | 'question'>('comment');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock annotations for demonstration
  const mockAnnotations: Annotation[] = annotations.length > 0 ? annotations : [
    {
      id: '1',
      content: 'This section needs clarification - the debt amount appears inconsistent with Form 31.',
      author: 'Sarah Wilson',
      timestamp: new Date(Date.now() - 3600000),
      position: { x: 200, y: 150 },
      status: 'open',
      type: 'question',
      mentions: ['Mike Chen'],
      replies: [
        {
          id: '1-1',
          content: 'Good catch! I\'ll verify against the proof of claim.',
          author: 'Mike Chen',
          timestamp: new Date(Date.now() - 1800000),
          position: { x: 0, y: 0 },
          status: 'open',
          type: 'comment'
        }
      ]
    },
    {
      id: '2',
      content: 'Missing signature here - BIA Section 158 compliance issue.',
      author: 'System AI',
      timestamp: new Date(Date.now() - 7200000),
      position: { x: 350, y: 300 },
      status: 'open',
      type: 'suggestion'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <AlertTriangle className="h-4 w-4" />;
      case 'question': return <MessageSquare className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'bg-orange-100 text-orange-700';
      case 'question': return 'bg-blue-100 text-blue-700';
      case 'comment': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStartAnnotation = () => {
    setIsAddingAnnotation(true);
    setSelectedPosition({ x: 250, y: 200 }); // Mock position
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleAddAnnotation = () => {
    if (!newAnnotation.trim() || !selectedPosition) return;

    const annotation: Omit<Annotation, 'id' | 'timestamp'> = {
      content: newAnnotation,
      author: 'Current User',
      position: selectedPosition,
      status: 'open',
      type: selectedType,
      mentions: [],
      replies: []
    };

    onAnnotationAdd?.(annotation);
    
    toast.success('Annotation added', {
      description: 'Your annotation has been saved'
    });

    setNewAnnotation('');
    setIsAddingAnnotation(false);
    setSelectedPosition(null);
  };

  const handleResolveAnnotation = (annotationId: string) => {
    onAnnotationResolve?.(annotationId);
    
    toast.success('Annotation resolved', {
      description: 'The annotation has been marked as resolved'
    });
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium">Annotations</span>
          <Badge variant="outline">{mockAnnotations.length}</Badge>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartAnnotation}
          disabled={isAddingAnnotation}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Add Annotation Form */}
      {isAddingAnnotation && (
        <Card className="m-4 border-dashed">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-2">
              {(['comment', 'suggestion', 'question'] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="gap-1"
                >
                  {getTypeIcon(type)}
                  {type}
                </Button>
              ))}
            </div>
            
            <Textarea
              ref={textareaRef}
              value={newAnnotation}
              onChange={(e) => setNewAnnotation(e.target.value)}
              placeholder={`Add a ${selectedType}...`}
              className="min-h-[80px]"
            />
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingAnnotation(false);
                  setNewAnnotation('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddAnnotation}
                disabled={!newAnnotation.trim()}
              >
                Add {selectedType}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Annotations List */}
      <div className="flex-1 overflow-auto space-y-3 p-4">
        {mockAnnotations.map((annotation) => (
          <Card key={annotation.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4 space-y-3">
              {/* Annotation Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {annotation.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{annotation.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(annotation.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getTypeColor(annotation.type)}`}>
                    {getTypeIcon(annotation.type)}
                    {annotation.type}
                  </Badge>
                  {annotation.status === 'resolved' && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>
              </div>

              {/* Annotation Content */}
              <p className="text-sm">{annotation.content}</p>

              {/* Mentions */}
              {annotation.mentions && annotation.mentions.length > 0 && (
                <div className="flex items-center gap-2">
                  <AtSign className="h-3 w-3 text-muted-foreground" />
                  <div className="flex gap-1">
                    {annotation.mentions.map((mention) => (
                      <Badge key={mention} variant="outline" className="text-xs">
                        {mention}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Replies */}
              {annotation.replies && annotation.replies.length > 0 && (
                <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
                  {annotation.replies.map((reply) => (
                    <div key={reply.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {reply.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs font-medium">{reply.author}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(reply.timestamp)}
                        </p>
                      </div>
                      <p className="text-sm ml-7">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {annotation.status === 'open' && (
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Reply className="h-3 w-3" />
                    Reply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResolveAnnotation(annotation.id)}
                    className="gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Resolve
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {mockAnnotations.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No annotations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "Add" to create your first annotation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
