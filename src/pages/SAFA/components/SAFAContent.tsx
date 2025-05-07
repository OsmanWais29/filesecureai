
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for conversation modules
const modules = [
  { id: "documents", name: "Documents", count: 12 },
  { id: "legal", name: "Legal & Regulatory", count: 5 },
  { id: "help", name: "Training & Help", count: 3 },
  { id: "client", name: "Client Connect", count: 8 },
];

const SAFAContent: React.FC = () => {
  return (
    <div className="flex-1 p-4 overflow-auto">
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="documents">
            <TabsList className="mb-4">
              {modules.map(module => (
                <TabsTrigger key={module.id} value={module.id} className="flex gap-2">
                  {module.name}
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                    {module.count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {modules.map(module => (
              <TabsContent key={module.id} value={module.id} className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">{module.name} AI Assistant</h2>
                <p className="text-muted-foreground">
                  This is the {module.name.toLowerCase()} module of SecureFiles AI assistant. 
                  You can ask questions related to {module.name.toLowerCase()} here.
                </p>
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-center text-muted-foreground max-w-md">
                    Start a conversation with the AI to get assistance with {module.name.toLowerCase()} related questions.
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SAFAContent;
