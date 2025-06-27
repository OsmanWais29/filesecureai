
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, CheckSquare } from 'lucide-react';
import { DocumentDetails } from '../../types';
import { CollaborationPanel } from '../../CollaborationPanel';
import { TaskManager } from '../../TaskManager';

interface CollaborationTabsProps {
  document: DocumentDetails;
}

export const CollaborationTabs: React.FC<CollaborationTabsProps> = ({ document }) => {
  return (
    <Tabs defaultValue="comments" className="h-full flex flex-col">
      <div className="px-4 pt-2">
        <TabsList className="w-full">
          <TabsTrigger value="comments" className="flex items-center text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center text-xs">
            <CheckSquare className="h-3 w-3 mr-1" />
            Tasks
          </TabsTrigger>
        </TabsList>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <TabsContent value="comments" className="mt-0 h-full">
          <ScrollArea className="h-full">
            <div className="p-4">
              <CollaborationPanel 
                document={document}
                onCommentAdded={() => console.log('Comment added')}
              />
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-0 h-full">
          <ScrollArea className="h-full">
            <div className="p-4">
              <TaskManager
                documentId={document.id}
                onTaskUpdate={() => console.log('Task updated')}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
};
