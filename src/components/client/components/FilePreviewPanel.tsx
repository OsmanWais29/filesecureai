import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ZoomIn, ZoomOut, Download, Share2, Send, File } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

import { useFilePreview } from "./FilePreview/useFilePreview";
import { DocumentPreviewTab } from "./FilePreview/DocumentPreviewTab";

interface ClientDocument {
  id: string;
  title: string;
  type: string;
  status: string;
  category: string;
  dateModified: string;
  fileType: string;
  fileSize: string;
  metadata?: { storage_path?: string };
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

interface DocumentPreviewPanelProps {
  document: ClientDocument | undefined;
  recentActivities: RecentActivity[];
}

export const DocumentPreviewPanel: React.FC<DocumentPreviewPanelProps> = ({ 
  document,
  recentActivities
}) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: "comment-1",
      text: "Please review section 2.3 of this document",
      user: "Jane Smith",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      avatar: "/assets/avatars/jane.jpg"
    },
    {
      id: "comment-2",
      text: "Updated the financial calculations in the spreadsheet",
      user: "John Doe",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      avatar: "/assets/avatars/john.jpg"
    }
  ]);
  
  const storagePath = document?.metadata?.storage_path || null;
  const { url: fileUrl, isLoading, error } = useFilePreview(storagePath);

  const hasStoragePath = !!storagePath;
  const getStoragePath = () => storagePath || "";
  const handleDocumentOpen = () => {
    if (document?.id) {
      // Place your open-in-viewer logic here if needed
    }
  };
  const effectiveDocumentId = document?.id || "";

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const newCommentObj = {
      id: `comment-${Date.now()}`,
      text: newComment,
      user: "Current User",
      timestamp: new Date().toISOString(),
      avatar: "/assets/avatars/user.jpg"
    };
    setComments([newCommentObj, ...comments]);
    setNewComment("");
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview" className="flex-1 flex flex-col m-0">
          {document ? (
            <DocumentPreviewTab
              document={document as any}
              hasStoragePath={hasStoragePath}
              effectiveDocumentId={effectiveDocumentId}
              getStoragePath={getStoragePath}
              handleDocumentOpen={handleDocumentOpen}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Select a document to preview</p>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="history" className="m-0 p-4 h-full">
          <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="space-y-3 pr-2">
              {recentActivities.map(activity => (
                <Card key={activity.id} className="p-3">
                  <div className="flex items-start">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-sm">{activity.user}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm mt-1">{activity.action}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="comments" className="m-0 p-0 flex flex-col h-full">
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium mb-3">Comments & Collaboration</h3>
            <div className="flex gap-2">
              <Textarea 
                placeholder="Add a comment..." 
                className="resize-none"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button 
                className="self-end" 
                size="icon"
                onClick={handleAddComment}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/40 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
