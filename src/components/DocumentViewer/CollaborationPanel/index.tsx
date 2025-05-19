
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentDetails as DocumentDetailsType } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EnhancedComments } from "../Comments/EnhancedComments";
import { MessageSquare, Clock, ClipboardList } from "lucide-react";
import { TaskManager } from "../TaskManager";

interface CollaborationPanelProps {
  document: DocumentDetailsType;
  onCommentAdded: () => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ 
  document,
  onCommentAdded
}) => {
  return (
    <Card className="h-full">
      <Tabs defaultValue="comments" className="h-full flex flex-col">
        <div className="p-1 px-2 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="comments" className="flex items-center text-xs py-1.5">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center text-xs py-1.5">
              <ClipboardList className="h-3.5 w-3.5 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center text-xs py-1.5">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Versions
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="comments" className="mt-0 h-full">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-3">
                <EnhancedComments 
                  documentId={document.id} 
                  onCommentAdded={onCommentAdded}
                />
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-0 h-full">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-3">
                <TaskManager
                  documentId={document.id}
                  onTaskUpdate={onCommentAdded}
                />
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="versions" className="mt-0 h-full">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-3">
                {/* Version history component removed as it's not properly exported */}
                <p className="text-muted-foreground">Version history is not available at this time.</p>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};
