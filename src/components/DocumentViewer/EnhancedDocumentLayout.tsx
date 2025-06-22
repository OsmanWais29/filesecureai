
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileText, 
  MessageCircle, 
  Plus, 
  User, 
  ZoomIn, 
  RotateCw,
  Maximize,
  Calendar,
  Link
} from 'lucide-react';
import { DocumentDetails, Risk } from './types';
import DocumentPreview from './DocumentPreview';

interface EnhancedDocumentLayoutProps {
  document: DocumentDetails;
  documentId: string;
}

export const EnhancedDocumentLayout: React.FC<EnhancedDocumentLayoutProps> = ({
  document,
  documentId
}) => {
  const [newComment, setNewComment] = useState('');
  const [newTask, setNewTask] = useState('');

  // Mock data for demonstration
  const mockRisks: Risk[] = [
    {
      type: "Missing Information",
      description: "Debtor signature missing on Page 2, Line 15",
      severity: "high",
      biaCitation: "Per BIA s. 66.13 - Debtor signature required",
      suggestedFix: "Request debtor to sign document",
      deadline: "2024-02-15",
      resolved: false
    },
    {
      type: "Compliance Issue",
      description: "Income verification documents not attached",
      severity: "medium",
      biaCitation: "Per BIA s. 65.1 - Supporting documents required",
      suggestedFix: "Attach pay stubs and bank statements",
      deadline: "2024-02-20",
      resolved: false
    }
  ];

  const mockComments = [
    {
      id: '1',
      user: 'Jane Smith',
      avatar: 'JS',
      content: 'Please review the income calculations on page 3',
      timestamp: '2024-01-15 10:30 AM',
      replies: []
    },
    {
      id: '2',
      user: 'Mike Johnson',
      avatar: 'MJ',
      content: 'Debtor has provided updated financial information',
      timestamp: '2024-01-15 2:15 PM',
      replies: []
    }
  ];

  const mockTasks = [
    {
      id: '1',
      title: 'Obtain missing signature',
      status: 'todo',
      assignee: 'Jane Smith',
      deadline: '2024-02-15',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Verify income calculations',
      status: 'in-progress',
      assignee: 'Mike Johnson',
      deadline: '2024-02-10',
      priority: 'medium'
    }
  ];

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Document Overview & Risk Management */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full border-r bg-background">
            <ScrollArea className="h-full p-4">
              {/* Document Details */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Client:</span> John Doe
                  </div>
                  <div>
                    <span className="font-medium">Document:</span> {document.title}
                  </div>
                  <div>
                    <span className="font-medium">Upload:</span> {new Date(document.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Prepared By:</span> LIT Office
                  </div>
                  <div className="flex items-center gap-2">
                    <Link className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">2 Linked Files</span>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment Panel */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockRisks.map((risk, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getRiskIcon(risk.severity)}</span>
                          <Badge variant={getRiskColor(risk.severity)} className="text-xs">
                            {risk.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-xs">
                        <div className="font-medium">{risk.type}</div>
                        <div className="text-muted-foreground mt-1">{risk.description}</div>
                      </div>
                      
                      <div className="text-xs space-y-1">
                        <div className="text-blue-600">{risk.biaCitation}</div>
                        <div className="text-green-600">💡 {risk.suggestedFix}</div>
                        <div className="flex items-center gap-1 text-orange-600">
                          <Calendar className="h-3 w-3" />
                          Due: {risk.deadline}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="text-xs h-6">
                          Create Task
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-6">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Activity Log */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Jane Smith opened document</span>
                      <span className="text-muted-foreground ml-auto">2m ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Mike Johnson added comment</span>
                      <span className="text-muted-foreground ml-auto">1h ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      <span>Document uploaded</span>
                      <span className="text-muted-foreground ml-auto">3h ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Center Panel - Document Viewer */}
        <ResizablePanel defaultSize={50}>
          <div className="h-full flex flex-col">
            {/* Document Controls */}
            <div className="border-b p-2 flex items-center gap-2 bg-muted/30">
              <Button size="sm" variant="ghost">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Maximize className="h-4 w-4" />
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Version 1.2</Badge>
                <Button size="sm" variant="ghost" className="text-xs">
                  Compare Versions
                </Button>
              </div>
            </div>

            {/* Document Preview */}
            <div className="flex-1">
              <DocumentPreview 
                storagePath={document.storage_path}
                documentId={documentId}
                title={document.title}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Collaboration & Tasks */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full border-l bg-background">
            <Tabs defaultValue="comments" className="h-full flex flex-col">
              <div className="border-b px-4 pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="comments" className="flex-1 p-4 mt-0">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{comment.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.user}</span>
                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                          </div>
                          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Textarea 
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button size="sm" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tasks" className="flex-1 p-4 mt-0">
                <ScrollArea className="h-full">
                  <div className="space-y-3">
                    {mockTasks.map((task) => (
                      <Card key={task.id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{task.title}</span>
                            <Badge 
                              variant={task.priority === 'high' ? 'destructive' : 'default'}
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Assigned to: {task.assignee}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Due: {task.deadline}
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-xs h-6">
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs h-6">
                              Complete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Input 
                      placeholder="Add new task..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                    />
                    <Button size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
