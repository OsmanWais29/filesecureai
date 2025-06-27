
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  History,
  User,
  Calendar,
  Tag,
  Plus
} from 'lucide-react';
import { DocumentDetails } from '../../types';
import { EnhancedComments } from '../../Comments/EnhancedComments';
import { TaskManager } from '../../TaskManager';

interface LeftPanelProps {
  document: DocumentDetails;
  onCommentAdded: () => void;
  onTaskAssigned: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  document,
  onCommentAdded,
  onTaskAssigned
}) => {
  const [activeTab, setActiveTab] = useState('comments');

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Collaboration & Info</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="comments" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">
              <CheckSquare className="h-3 w-3 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="metadata" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Info
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-xs">
              <History className="h-3 w-3 mr-1" />
              Versions
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="comments" className="h-full mt-2">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Threaded Comments</h3>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                <EnhancedComments 
                  documentId={document.id}
                  onCommentAdded={onCommentAdded}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tasks" className="h-full mt-2">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Task Basket</h3>
                  <Badge variant="secondary">3 open</Badge>
                </div>
                <TaskManager
                  documentId={document.id}
                  onTaskUpdate={onTaskAssigned}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="metadata" className="h-full mt-2">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Document Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">File Name:</span>
                        <p className="text-muted-foreground truncate">{document.title}</p>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="text-muted-foreground">{document.type || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Upload Date:</span>
                        <p className="text-muted-foreground">
                          {new Date(document.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <span className="font-medium text-xs">AI/Manual Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          Form
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          BIA
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="versions" className="h-full mt-2">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Version History</h3>
                  <Button size="sm" variant="ghost">View All</Button>
                </div>
                <div className="space-y-2">
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Current Version</p>
                        <p className="text-xs text-muted-foreground">Today, 2:30 PM</p>
                      </div>
                      <Badge>Current</Badge>
                    </div>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
